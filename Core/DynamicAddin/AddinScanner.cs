using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Runtime.Loader;
using System.Threading.Tasks;
using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Logging;

namespace IAmFara.Core.DynamicAddin
{
    public class AddinScanner
    {
        private readonly string _path;
        private readonly AddinStorage _storage;
        private readonly IServiceCollection _services;
        private readonly IMvcBuilder _mvcBuilder;
        private readonly HashSet<Assembly> _seenAssemblies;

        internal AddinScanner(string path,
                              IServiceCollection services,
                              IConfiguration configuration,
                              IMvcBuilder mvcBuilder)
        {
            _path = Path.Combine(path, "Features");
            _storage = new AddinStorage(services, configuration);
            _services = services;
            _mvcBuilder = mvcBuilder;
            _seenAssemblies = new HashSet<Assembly>();
        }

        internal AddinStorage Scan()
        {
            AddinLogs.Reset();

            // Get all assemblies from features folder
            if (Directory.Exists(_path))
            {
                var assemblyFiles = Directory.EnumerateFiles(_path, "*.dll", SearchOption.AllDirectories);
                Load(assemblyFiles);
            }
            else
                AddinLogs.LogWarning("Feature folder could not be found ...");

            return _storage;
        }

        private void Load(IEnumerable<string> assemblyFiles)
        {
            // Loop through files and load assemblies
            foreach (var assemblyFile in assemblyFiles)
            {
                var assembly = Assembly.LoadFrom(assemblyFile);

                if (_seenAssemblies.Contains(assembly))
                {
                    continue;
                }

                PopulateApplicationPartManager(_mvcBuilder.PartManager, assembly);

                Load(assembly);
            }
        }

        private void PopulateApplicationPartManager(ApplicationPartManager manager, Assembly myAssembly)
        {
            var assemblies = GetApplicationPartAssemblies(myAssembly);

            foreach (var assembly in assemblies)
            {
                if (!_seenAssemblies.Add(assembly))
                {
                    // "assemblies" may contain duplicate values, but we want unique ApplicationPart instances.
                    // Note that we prefer using a HashSet over Distinct since the latter isn't
                    // guaranteed to preserve the original ordering.
                    continue;
                }

                var partFactory = ApplicationPartFactory.GetApplicationPartFactory(assembly);
                foreach (var applicationPart in partFactory.GetApplicationParts(assembly))
                {
                    manager.ApplicationParts.Add(applicationPart);
                }
            }
        }

        private static IEnumerable<Assembly> GetApplicationPartAssemblies(Assembly assembly)
        {
            var entryAssembly = assembly;

            // Use ApplicationPartAttribute to get the closure of direct or transitive dependencies
            // that reference MVC.
            var assembliesFromAttributes = entryAssembly.GetCustomAttributes<ApplicationPartAttribute>()
                .Select(name => Assembly.Load(name.AssemblyName))
                .OrderBy(assembly => assembly.FullName, StringComparer.Ordinal)
                .SelectMany(GetAssemblyClosure);

            // The SDK will not include the entry assembly as an application part. We'll explicitly list it
            // and have it appear before all other assemblies \ ApplicationParts.
            return GetAssemblyClosure(entryAssembly)
                .Concat(assembliesFromAttributes);
        }

        private static IEnumerable<Assembly> GetAssemblyClosure(Assembly assembly)
        {
            yield return assembly;

            var relatedAssemblies = GetRelatedAssemblies(assembly, throwOnError: false)
                .OrderBy(assembly => assembly.FullName, StringComparer.Ordinal);

            foreach (var relatedAssembly in relatedAssemblies)
            {
                yield return relatedAssembly;
            }
        }

        private static IReadOnlyList<Assembly> GetRelatedAssemblies(Assembly assembly, bool throwOnError)
        {
            if (assembly == null)
            {
                throw new ArgumentNullException(nameof(assembly));
            }

            var loadContext = AssemblyLoadContext.GetLoadContext(assembly) ?? AssemblyLoadContext.Default;
            return GetRelatedAssemblies(assembly, throwOnError, File.Exists, new AssemblyLoadContextWrapper(loadContext));
        }

        private static IReadOnlyList<Assembly> GetRelatedAssemblies(
            Assembly assembly,
            bool throwOnError,
            Func<string, bool> fileExists,
            AssemblyLoadContextWrapper assemblyLoadContext)
        {
            if (assembly == null)
            {
                throw new ArgumentNullException(nameof(assembly));
            }

            // MVC will specifically look for related parts in the same physical directory as the assembly.
            // No-op if the assembly does not have a location.
            if (assembly.IsDynamic)
            {
                return Array.Empty<Assembly>();
            }

            var attributes = assembly.GetCustomAttributes<RelatedAssemblyAttribute>().ToArray();
            if (attributes.Length == 0)
            {
                return Array.Empty<Assembly>();
            }

            var assemblyName = assembly.GetName().Name;
            // Assembly.Location may be null for a single-file exe. In this case, attempt to look for related parts in the app's base directory
            var assemblyDirectory = string.IsNullOrEmpty(assembly.Location) ?
                AppContext.BaseDirectory :
                Path.GetDirectoryName(assembly.Location);

            if (string.IsNullOrEmpty(assemblyDirectory))
            {
                return Array.Empty<Assembly>();
            }

            var relatedAssemblies = new List<Assembly>();
            for (var i = 0; i < attributes.Length; i++)
            {
                var attribute = attributes[i];
                Assembly relatedAssembly;
                var relatedAssemblyLocation = Path.Combine(assemblyDirectory, attribute.AssemblyFileName + ".dll");
                if (fileExists(relatedAssemblyLocation))
                {
                    relatedAssembly = assemblyLoadContext.LoadFromAssemblyPath(relatedAssemblyLocation);
                }
                else
                {
                    try
                    {
                        var relatedAssemblyName = new AssemblyName(attribute.AssemblyFileName);
                        relatedAssembly = assemblyLoadContext.LoadFromAssemblyName(relatedAssemblyName);
                    }
                    catch when (!throwOnError)
                    {
                        // Ignore assembly load failures when throwOnError = false.
                        continue;
                    }
                }

                relatedAssemblies.Add(relatedAssembly);
            }

            return relatedAssemblies;
        }

        private void Load(Assembly assembly)
        {
            // Find all types which implements IFeatureAddin
            var addins = assembly.GetExportedTypes()
                                 .Where(type => type.GetInterface(nameof(IFeatureAddin)) != null);
            Load(addins);
        }

        private void Load(IEnumerable<Type> addins)
        {
            // Loop through addins and load them
            foreach (var addin in addins)
            {
                try
                {
                    Load(addin);
                    AddinLogs.LogInformation($"Addin library successfully registered: {addin}");
                }
                catch (Exception ex)
                {
                    AddinLogs.LogError($"Failed to register {addin}\n{ex}");
                }
            }
        }

        private void Load(Type addin)
        {
            var instance = Activator.CreateInstance(addin) as IFeatureAddin;
            _storage.RegisterAddin(instance);
        }

        internal class AssemblyLoadContextWrapper
        {
            private readonly AssemblyLoadContext _loadContext;

            public AssemblyLoadContextWrapper(AssemblyLoadContext loadContext)
            {
                _loadContext = loadContext;
            }

            public virtual Assembly LoadFromAssemblyName(AssemblyName assemblyName)
                => _loadContext.LoadFromAssemblyName(assemblyName);

            public virtual Assembly LoadFromAssemblyPath(string assemblyPath)
                => _loadContext.LoadFromAssemblyPath(assemblyPath);
        }
    }
}
