using Infrastructure.Authentication;
using Infrastructure.Logging;
using Infrastructure.Misc.Middlewares;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Microsoft.AspNetCore.Builder
{
    public static class MiscApplicationBuilderExtensions
    {
        public static IApplicationBuilder UseExceptionHanling(this IApplicationBuilder builder)
        {
            return builder
                .UseMiddleware<ExceptionHandlingMiddleware>();
        }
    }
}
