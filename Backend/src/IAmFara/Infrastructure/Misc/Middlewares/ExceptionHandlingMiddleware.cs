using Infrastructure.Logging;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;

namespace Infrastructure.Misc.Middlewares
{
    internal class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, ICorrelationIdAccessor correlationIdAccessor)
        {
            Exception? exception = null;
            context.Response.OnStarting( async () =>
            {
                if (exception != null)
                {
                    var action = new
                    {
                        type = "UNHANDLED_EXCEPTION",
                        payload = new
                        {
                            data = new
                            {
                                CorrelationId = correlationIdAccessor.CorelationId?.CorelationId.ToString(),
                                Message = exception.Message
                            }
                        }
                    };

                    var json = JsonSerializer.Serialize(action);
                    await context.Response.WriteAsync(json);
                }
            });

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
