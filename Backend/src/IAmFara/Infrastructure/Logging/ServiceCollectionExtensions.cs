using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
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
        public static IServiceCollection AddDbLogger(this IServiceCollection services, IConfiguration config)
        {
            IConfiguration loggingSection = config.GetSection(DbLoggerConfig._section);

            var connectionString = config.GetConnectionString("LoggingDbContext");
            services.AddSingleton<LoggingDbContext>(_ => new LoggingDbContext(connectionString));
            services.AddSingleton<ILoggingDbContextFactory, LoggingDbContextFactory>(_ => new LoggingDbContextFactory(connectionString));
            
            services.AddLogging(builder =>
            {
                builder.Services.Configure<DbLoggerConfig>(loggingSection);
                builder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<ILoggerProvider, DbLoggingProvider>());
            });

            services.AddSingleton<ICorrelationIdAccessor, CorrelationIdAccessor>();

            return services;
        }

        public static IApplicationBuilder UserCorelationId(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CorrelationIdGeneratorMiddleware>();
        }
    }
}
