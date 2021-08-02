using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace IAmFara.Core.DynamicAddin
{
    public class AddinScanner
    {
        private readonly string _path;
        private readonly AddinStorage _storage;
        private readonly IMvcBuilder _mvcBuilder;

        internal AddinScanner(string path,
                              IServiceCollection services,
                              IConfiguration configuration,
                              IMvcBuilder mvcBuilder)
        {
            _path = Path.Combine(path, "Features");
            _storage = new AddinStorage(services, configuration);
            _mvcBuilder = mvcBuilder;
        }

        internal async Task<AddinStorage> Scan()
        {
            // Get all assemblies which matches from features folder
            if (Directory.Exists(_path))
            {
                var assemblyFiles = Directory.EnumerateFiles(_path, "*.dll", SearchOption.TopDirectoryOnly);
                await Load(assemblyFiles);
            }
            else
                AddinLogs.LogWarning("Feature folder could not be found ...");

            return _storage;
        }

        private async Task Load(IEnumerable<string> assemblyFiles)
        {
            // Loop through files and load assemblies
            foreach (var assemblyFile in assemblyFiles)
            {
                // check if view assembly exists
                var viewAssemblyFile = assemblyFile.Replace(".dll", ".Views.dll");
                if (File.Exists(viewAssemblyFile))
                {
                    var viewAssemblyRaw = await File.ReadAllBytesAsync(viewAssemblyFile);
                    var viewAssembly = Assembly.Load(viewAssemblyRaw);
                    _mvcBuilder.ConfigureApplicationPartManager(manager =>
                    {
                        manager.ApplicationParts.Add(new CompiledRazorAssemblyPart(viewAssembly));
                    });
                }

                var assemblyRaw = await File.ReadAllBytesAsync(assemblyFile);
                var assembly = Assembly.Load(assemblyRaw);
                Load(assembly);
            }
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
                    AddinLogs.LogInformation($"Addin successfully registered: {addin}");
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
    }
}
