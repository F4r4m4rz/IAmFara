using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    internal class CorrelationIdGeneratorMiddleware
    {
        private RequestDelegate _next;

        public CorrelationIdGeneratorMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task Invoke(HttpContext context, ICorrelationIdAccessor corelationIdAccessor)
        {
            var correlationId = new CorrelationIdInstance(Guid.NewGuid());
            context.Items.Add("CorrelationId", correlationId);

            await _next(context);
        }
    }
}
