using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Infrastructure;
using Infrastructure.Logging;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection.Extensions;
using Microsoft.Extensions.Logging;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddAppDependencies(this IServiceCollection services, IConfiguration config)
        {
            services.AddDbContextInfrastructure(config)
                    .AddLoggingInfrastructure(config)
                    .AddAuthenticationIfrastructure()
                    .AddRepositories();
             
            return services;
        }

        private static IServiceCollection AddDbContextInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            IConfiguration settings = config.GetSection(AppDbContextFactorySettings._section);
            services.Configure<AppDbContextFactorySettings>(settings);
            services.AddSingleton<IAppDbContextFactory, AppDbContextFactory>()
                    .AddScoped<AppDbContext>(sp => sp.GetRequiredService<IAppDbContextFactory>().CreateContext());

            return services;
        }       
    }
}
