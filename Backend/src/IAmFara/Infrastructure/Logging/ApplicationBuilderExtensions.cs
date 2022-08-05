using Infrastructure.Authentication;
using Infrastructure.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.AspNetCore.Builder
{
    public static class LoggingApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseCorelationId(this IApplicationBuilder builder)
        {
            return builder
                .UseMiddleware<CorrelationIdGeneratorMiddleware>();
        }
    }
}
