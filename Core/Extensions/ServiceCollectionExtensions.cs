using System;
using IAmFara.Core.DynamicAddin;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Collections.Generic;
using IAmFara.Core.DynamicAddin.Abstractions;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public async static Task<IServiceCollection> AddIAmFaraServicesAsync(this IServiceCollection services, IConfiguration configuration, string addinsPath = null)
        {
            var mvcBuilder = services.AddMvc();

            // Add AddinLogs
            services.AddSingleton<IAddinLogs, AddinLogs>();

            // Load dynamic addins
            if (addinsPath != null)
            {
                var scanner = new AddinScanner(addinsPath, services, configuration, mvcBuilder);
                var addinStorage = await scanner.Scan();
                services.AddSingleton<IEnumerable<IFeatureAddin>>(addinStorage.GetRegisteredAddins());
            }

            return services;
        }
    }
}
