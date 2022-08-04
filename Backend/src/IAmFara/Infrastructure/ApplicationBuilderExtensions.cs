using Infrastructure.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.AspNetCore.Builder
{
    public static class ApplicationBuilderExtensions
    {
        public static IApplicationBuilder UserCorelationId(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<CorrelationIdGeneratorMiddleware>();
        }
    }
}
