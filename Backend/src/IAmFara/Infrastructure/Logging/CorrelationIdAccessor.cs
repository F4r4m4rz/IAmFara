using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    public interface ICorrelationIdAccessor
    {
        CorrelationIdInstance? CorelationId { get; }
    }

    public class CorrelationIdInstance
    {
        public CorrelationIdInstance(Guid corelationId)
        {
            CorelationId = corelationId;
        }

        public Guid CorelationId { get; }
    }

    internal class CorrelationIdAccessor : ICorrelationIdAccessor
    {
        private readonly IHttpContextAccessor _httpContextAccessor;

        public CorrelationIdAccessor(IHttpContextAccessor httpContextAccessor)
        {
            _httpContextAccessor = httpContextAccessor;
        }

        public CorrelationIdInstance? CorelationId
        {
            get
            {
                if (_httpContextAccessor?.HttpContext != null && _httpContextAccessor.HttpContext.Items.TryGetValue("CorrelationId", out var correlationId))
                    return correlationId as CorrelationIdInstance;

                return null;
            }
        }

    }
}
