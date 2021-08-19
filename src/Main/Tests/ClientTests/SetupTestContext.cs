using IAmFara.ClientTests.Components;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace IAmFara.ClientTests
{
    public class SetupTestContext
    {
        public static async Task OnTimeSetup(int? assembliesCount = null, int? pluginCount = null)
        {
            // Setup IoC
            var host = Host.CreateDefaultBuilder()
                                   .ConfigureAppConfiguration(builder =>
                                   {
                                       builder.AddJsonFile("AppSettings.json");
                                   })
                                   .ConfigureServices(services =>
                                   {
                                       ConfigureInternalServices(services, assembliesCount, pluginCount);
                                   })
                                   .Build();
            await host.StartAsync();

            var testRunning = host.Services.GetRequiredService<TestContext>() ??
                throw new Exception("Setting up TestContext has been failed");

            // Initialize test classes
            Tests.LazyInitialize();
        }

        private static void ConfigureInternalServices(IServiceCollection services, int? assembliesCount = null, int? pluginCount = null)
        {
            services.AddLogging();
            services.AddSingleton<TestContext>(serviceProvider =>
            {
                var logger = serviceProvider.GetRequiredService<ILogger<TestContext>>();
                var testContext = new TestContext(logger, serviceProvider);
                testContext.LazyInitialize(assembliesCount, pluginCount);
                return testContext;
            });
            services.AddSingleton<GlobalTests>();
            services.AddSingleton<PluginTests>();
        }
    }
}
