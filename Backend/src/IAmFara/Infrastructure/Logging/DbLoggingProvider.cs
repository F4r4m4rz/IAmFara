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

        public DbLoggingProvider(ILoggingDbContextFactory contextFactory)
        {
            _contextFactory = contextFactory;
        }

        public ILogger CreateLogger(string categoryName)
        {
            return new DbLogger(_contextFactory.GetInstance());
        }

        public void Dispose()
        {

        }
    }
}
