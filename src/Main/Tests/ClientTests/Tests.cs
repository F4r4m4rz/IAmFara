using IAmFara.ClientTests.Components;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.ClientTests
{
    [TestFixture]
    public abstract class Tests
    {
        private static PluginTests _pluginTests;

        internal static void LazyInitialize()
        {
            _pluginTests = TestContext.GetTestClass<PluginTests>();
        }

        [Test, Order(1)]
        public virtual void AssembliesCanLoadSmoothly()
        {
            _pluginTests.AssembliesCanLoadSmoothly();
        }

        [Test, Order(2)]
        public virtual void AllPluginAssembliesAreLoaded()
        {
            _pluginTests.AllPluginAssembliesAreLoaded();
        }

        [Test, Order(3)]
        public virtual void AllPluginsAreDiscovered()
        {
            _pluginTests.AllPluginsAreDiscovered();
        }
    }
}
