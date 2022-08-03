using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Infrastructure.Logging;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace Microsoft.Extensions.DependencyInjection
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddDbLogger(this IServiceCollection services, IConfiguration config)
        {
            var connectionString = config.GetConnectionString("LoggingDbContext");
            services.AddDbContext<LoggingDbContext>(options => options.UseSqlServer(connectionString));
            services.AddSingleton<ILoggingDbContextFactory>(sp => new LoggingDbContextFactory(connectionString));

            services.AddLogging(builder =>
            {
                builder.Services.AddSingleton<ILoggerProvider, DbLoggingProvider>();
            });

            services.AddScoped<ICorelationIdAccessor, CorelationIdAccessor>();

            return services;
        }
    }
}
