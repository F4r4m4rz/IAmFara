using Data.Exceptions;
using Infrastructure.Logging;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using static System.Collections.Specialized.BitVector32;

namespace Infrastructure.Misc.Middlewares
{
    internal class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, ICorrelationIdAccessor correlationIdAccessor, ILogger<ExceptionHandlingMiddleware> logger)
        {
            Exception? exception = null;
            if (exception != null)
            {
                if (exception is HandledException handled)
                {
                    // Nothing needs to be done just logging as warning
                    logger.LogWarning(handled.Message, handled.InnerException);
                }
                else
                {
                    // Log as error and redirect to error page
                    logger.LogError(exception.Message, exception);
                }
            }

            try
            {
                await _next.Invoke(context);
            }
            catch (Exception ex)
            {
                exception = ex;
            }
        }
    }
}
