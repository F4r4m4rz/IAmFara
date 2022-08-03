using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    internal class DbLoggingProvider : ILoggerProvider
    {
        private readonly ILoggingDbContextFactory _contextFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public DbLoggingProvider(ILoggingDbContextFactory contextFactory, IHttpContextAccessor httpContextAccessor)
        {
            _contextFactory = contextFactory;
            _httpContextAccessor = httpContextAccessor;
        }

        public ILogger CreateLogger(string categoryName)
        {
            var corelationIdAccessor = _httpContextAccessor.HttpContext?.RequestServices?.GetRequiredService<ICorelationIdAccessor>();
            return new DbLogger(_contextFactory.GetInstance(), corelationIdAccessor?.CorelationId ?? Guid.NewGuid());
        }

        public void Dispose()
        {

        }
    }
}
