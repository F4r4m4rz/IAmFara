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
    public static class LoggingServiceCollectionExtensions
    {
        internal static IServiceCollection AddLoggingInfrastructure(this IServiceCollection services, IConfiguration config)
        {
            return services.AddLogging(builder =>
            {
                IConfiguration loggingSection = config.GetSection(DbLoggerConfig._section);
                builder.Services.Configure<DbLoggerConfig>(loggingSection);
                builder.Services.TryAddEnumerable(ServiceDescriptor.Singleton<ILoggerProvider, DbLoggingProvider>());
                builder.Services.AddSingleton<ICorrelationIdAccessor, CorrelationIdAccessor>();
            });
        }        
    }
}
