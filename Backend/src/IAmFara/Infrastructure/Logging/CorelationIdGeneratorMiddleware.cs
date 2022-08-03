using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    internal class CorelationIdGeneratorMiddleware
    {
        private RequestDelegate _next;

        public CorelationIdGeneratorMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, ICorelationIdAccessor corelationIdAccessor)
        {
            DbLogger.CorelationId = corelationIdAccessor.CorelationId;
            await _next(context);
        }
    }
}
