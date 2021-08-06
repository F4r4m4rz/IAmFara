using System;
using IAmFara.Core.DynamicAddin;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System.ComponentModel;
using System.Threading.Tasks;
using System.Collections.Generic;
using IAmFara.Core.DynamicAddin.Abstractions;
using System.Linq;
using Microsoft.AspNetCore.Mvc.ApplicationParts;
using Microsoft.AspNetCore.Hosting;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.AspNetCore.Mvc.Infrastructure;
using IAmFara.Core;
using System.IO;
using System.Runtime.Loader;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddIAmFaraServicesAsync(this IServiceCollection services, IConfiguration configuration)
        {
            var mvcBuilder = services.AddMvc();

            // Add AddinLogs
            services.AddSingleton<IAddinLogs, AddinLogs>();

            // Load dynamic addins
            var addinsPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory);
            var scanner = new AddinScanner(addinsPath, services, configuration, mvcBuilder);
            var addinStorage = scanner.Scan();
            services.AddSingleton<IEnumerable<IFeatureAddin>>(addinStorage.GetRegisteredAddins());

            return services;
        }
    }
}
