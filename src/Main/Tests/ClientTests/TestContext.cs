using IAmFara.Core.Dynamic.Abstractions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.ClientTests
{
    internal class TestContext
    {
        private readonly ILogger<TestContext> _logger;
        private readonly IServiceProvider _services;
        private static TestContext lifetimeInstance;

        public TestContext(ILogger<TestContext> logger, IServiceProvider services)
        {
            lifetimeInstance = this;
            _logger = logger;
            _services = services;

            PluginAssemblies = new List<Assembly>();
            Plugins = new List<Type>();
        }

        internal void LazyInitialize(int? expectedPluginsAssemblyCount, int? expectedPluginsCount)
        {
            ExpectedPluginAssemblyCount = expectedPluginsAssemblyCount;
            ExpectedPluginCount = expectedPluginsCount;
        }

        public List<Assembly> PluginAssemblies { get; private set; }
        public List<Type> Plugins { get; private set; }
        public int? ExpectedPluginAssemblyCount { get; private set; }
        public int? ExpectedPluginCount { get; private set; }
        public IServiceProvider PluginServices { get; set; }

        private T GetService<T>() where T: class
        {
            return _services.GetRequiredService<T>();
        }

        internal static T GetTestClass<T>() where T : class
        {
            return lifetimeInstance.GetService<T>();
        }
    }
}
