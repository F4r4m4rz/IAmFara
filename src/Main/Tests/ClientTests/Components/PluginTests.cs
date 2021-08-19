using IAmFara.ClientTests.Utilities.Exceptions;
using IAmFara.Core.Dynamic.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.ClientTests.Components
{
    internal class PluginTests
    {
        private readonly ILogger<PluginTests> _logger;
        private readonly IConfiguration _configuration;
        private readonly TestContext _context;
        private bool _assembliesAreLoaded = false;
        private List<IPlugin> PluginsInstances;

        public PluginTests(ILogger<PluginTests> logger, IConfiguration configuration, TestContext context)
        {
            _logger = logger;
            _configuration = configuration;
            _context = context;

            PluginsInstances = new List<IPlugin>();
        }

        private void LoadAssemblies(bool throwException)
        {
            var exceptions = new List<AssemblyLoadException>();
            var assemblyFiles = Directory.EnumerateFiles(AppDomain.CurrentDomain.BaseDirectory, "*.dll", SearchOption.AllDirectories);
            foreach (var assemblyFile in assemblyFiles)
            {
                try
                {
                    Assembly.LoadFrom(assemblyFile);
                }
                catch (Exception ex)
                {
                    var message = $"Unable to load assembly: {assemblyFile}";
                    _logger.LogWarning(message, ex);
                    exceptions.Add(new AssemblyLoadException(message, ex));
                }
            }

            // Loading is finished
            _assembliesAreLoaded = true;

            if (throwException && exceptions.Count != 0)
                throw new AssemblyLoadException("Failed to load one or more assemblies", exceptions);
        }

        private void DiscoverPlugins()
        {
            var assemblies = AppDomain.CurrentDomain.GetAssemblies()
                .Where(assembly =>
                {
                    var plugins = assembly.GetTypes().Where(type => type.IsAssignableTo(typeof(IPlugin)) && !type.IsAbstract);
                    if (plugins?.Count() != 0)
                    {
                        _context.Plugins.AddRange(plugins);
                        _logger?.LogInformation($"Plugin assembly loaded: {assembly.FullName}");
                        return true;
                    }
                    else
                        return false;
                });

            _context.PluginAssemblies.AddRange(assemblies);
        }

        private void CreateServiceProvider(IConfiguration configuration)
        {
            var serviceCollection = new ServiceCollection();
            foreach (var plugin in _context.Plugins)
            {
                var instance = Activator.CreateInstance(plugin) as IPlugin;
                var validationResults = instance.Validate(new ValidationContext(this));
                if (validationResults.All(vr => vr?.Equals(ValidationResult.Success) ?? true))
                    instance.RegisterServices(serviceCollection, configuration);
            }
            _context.PluginServices = serviceCollection.BuildServiceProvider();
        }

        public void AssembliesCanLoadSmoothly()
        {
            var testDelegate = new TestDelegate(() => LoadAssemblies(true));
            Assert.DoesNotThrow(testDelegate);
        }

        public void AllPluginAssembliesAreLoaded()
        {
            if (!_assembliesAreLoaded)
                LoadAssemblies(false);

            var testDelegate = new TestDelegate(() => DiscoverPlugins());

            Assert.DoesNotThrow(testDelegate);

            if (_context.ExpectedPluginAssemblyCount.HasValue)
                Assert.AreEqual(_context.ExpectedPluginAssemblyCount.Value, _context.PluginAssemblies.Count());
        }

        public void AllPluginsAreDiscovered()
        {
            if (!_assembliesAreLoaded)
                LoadAssemblies(false);

            if (_context.ExpectedPluginCount.HasValue)
                Assert.AreEqual(_context.ExpectedPluginCount, _context.Plugins.Count());
            else
                Assert.AreNotEqual(0, _context.Plugins.Count());
        }

        public void CanInstantiatePlugins()
        {
            foreach (var plugin in _context.Plugins)
            {

            }
        }

        public void PluginAreValid()
        {
            foreach (var plugin in _context.Plugins)
            {

            }
        }
    }
}
