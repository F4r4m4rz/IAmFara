using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;
using IAmFara.Core.DynamicAddin.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace IAmFara.Core.DynamicAddin
{
    public class AddinScanner
    {
        private readonly string _path;
        private readonly AddinStorage _storage;

        internal AddinScanner(string path,
                              IServiceCollection services,
                              IConfiguration configuration)
        {
            _path = path;
            _storage = new AddinStorage(services, configuration);
        }

        internal async Task<AddinStorage> Scan()
        {
            // Get all assemblies which matches "*.IAmFaraAddin*.dll"
            var assemblyFiles = Directory.EnumerateFiles(_path, "*.IAmFaraAddin*.dll", SearchOption.TopDirectoryOnly);
            await Load(assemblyFiles);
            return _storage;
        }

        private async Task Load(IEnumerable<string> assemblyFiles)
        {
            // Loop through files and load assemblies
            foreach (var assemblyFile in assemblyFiles)
            {
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
                Load(addin);
            }
        }

        private void Load(Type addin)
        {
            var instance = Activator.CreateInstance(addin) as IFeatureAddin;
            _storage.RegisterAddin(instance);
        }
    }
}
