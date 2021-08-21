using IAmFara.ClientTests.Exceptions;
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
        private List<IPlugin> PluginsInstances;

        // Progress flags
        private bool _assembliesAreLoaded = false;
        private bool _pluginsAreDiscovered = false;
        private bool _pluginsAreInstanciated = false;
        private bool _pluginsAreValidated = false;
        private bool _servicesAreRegistered = false;

        public PluginTests(ILogger<PluginTests> logger, IConfiguration configuration, TestContext context)
        {
            _logger = logger;
            _configuration = configuration;
            _context = context;

            PluginsInstances = new List<IPlugin>();
        }

        #region Helpers
        private void LoadAssemblies(bool throwException)
        {
            if (_assembliesAreLoaded)
                return;

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
                    exceptions.Add(new AssemblyLoadException($"Unable to load assembly: {assemblyFile}", ex));
                }
            }

            // Loading is finished
            _assembliesAreLoaded = true;

            if (exceptions.Count != 0)
            {
                var ex = new AssemblyLoadException("Failed to load one or more assemblies", exceptions);
                ex.LogPretty(_logger);
                if (throwException)
                    throw ex;
            }
        }

        private void DiscoverPlugins()
        {
            if (_pluginsAreDiscovered)
                return;

            LoadAssemblies(false);
            var assemblies = AppDomain.CurrentDomain.GetAssemblies()
                .Where(assembly =>
                {
                    var plugins = assembly.GetTypes().Where(type => type.IsAssignableTo(typeof(IPlugin)) && !type.IsAbstract);
                    if (plugins?.Count() != 0)
                    {
                        _context.Plugins.AddRange(plugins);
                        return true;
                    }
                    else
                        return false;
                });

            _context.PluginAssemblies.AddRange(assemblies);

            _pluginsAreDiscovered = true;
        }

        public void InstansiatePlugins(bool throwException)
        {
            if (_pluginsAreInstanciated)
                return;

            DiscoverPlugins();
            var exceptions = new List<PluginInstansiationException>();
            foreach (var plugin in _context.Plugins)
            {
                try
                {
                    var instance = Activator.CreateInstance(plugin) as IPlugin;
                    PluginsInstances.Add(instance);
                }
                catch (Exception ex)
                {
                    exceptions.Add(new PluginInstansiationException(plugin, ex));
                }
            }

            if (exceptions.Count() != 0)
            {
                var ex = new PluginInstansiationException(exceptions);
                ex.LogPretty(_logger);
                if (throwException)
                    throw ex;
            }

            _pluginsAreInstanciated = true;
        }

        public void ValidatePlugins(bool throwException)
        {
            if (_pluginsAreValidated)
                return;

            InstansiatePlugins(false);
            var exceptions = new List<PluginNotValidException>();
            foreach (var plugin in PluginsInstances)
            {
                try
                {
                    Validator.ValidateObject(plugin, new ValidationContext(plugin), true);
                }
                catch (ValidationException ex)
                {
                    exceptions.Add(new PluginNotValidException(plugin, ex));
                }
            }

            if (exceptions.Count() != 0)
            {
                var ex = new PluginNotValidException(exceptions);
                ex.LogPretty(_logger);
                if (throwException)
                    throw ex;
            }

            _pluginsAreValidated = true;
        }

        private void CreateServiceProvider()
        {
            if (_servicesAreRegistered)
                return;

            InstansiatePlugins(false);
            var serviceCollection = new ServiceCollection();
            foreach (var plugin in PluginsInstances)
            {
                plugin.RegisterServices(serviceCollection, _configuration);
            }
            _context.PluginServices = serviceCollection.BuildServiceProvider();

            _servicesAreRegistered = true;
        }
        #endregion

        #region Tests
        public void AssembliesCanLoadSmoothly()
        {
            var testDelegate = new TestDelegate(() => LoadAssemblies(true));
            Assert.DoesNotThrow(testDelegate);
        }

        public void AllPluginAssembliesAreLoaded()
        {
            var testDelegate = new TestDelegate(() => DiscoverPlugins());

            Assert.DoesNotThrow(testDelegate);

            if (_context.ExpectedPluginAssemblyCount.HasValue)
                Assert.AreEqual(_context.ExpectedPluginAssemblyCount.Value, _context.PluginAssemblies.Count());
        }

        public void AllPluginsAreDiscovered()
        {
            var testDelegate = new TestDelegate(() => DiscoverPlugins());

            Assert.DoesNotThrow(testDelegate);

            if (_context.ExpectedPluginCount.HasValue)
                Assert.AreEqual(_context.ExpectedPluginCount, _context.Plugins.Count());
            else
                Assert.AreNotEqual(0, _context.Plugins.Count());
        }

        public void CanInstansiateAllPlugins()
        {
            var testDelegate = new TestDelegate(() => InstansiatePlugins(true));

            Assert.DoesNotThrow(testDelegate);

            if (_context.ExpectedPluginCount.HasValue)
                Assert.AreEqual(_context.ExpectedPluginCount, _context.Plugins.Count());
            else
                Assert.AreNotEqual(0, _context.Plugins.Count());
        }

        public void AllPluginsAreValid()
        {
            var testDelegate = new TestDelegate(() => ValidatePlugins(true));

            Assert.DoesNotThrow(testDelegate);
        }

        public void SuccessfullyRegisteredPluginServices()
        {
            var testDelegate = new TestDelegate(() => CreateServiceProvider());

            Assert.DoesNotThrow(testDelegate);
        }
        #endregion
    }
}
