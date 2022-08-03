using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    internal class DbLogger : ILogger
    {
        private readonly LoggingDbContext _context;
        private readonly Guid _corelationId;

        public DbLogger(LoggingDbContext context, Guid corelationId)
        {
            _context = context;
            _corelationId = corelationId;
        }

        public IDisposable BeginScope<TState>(TState state)
        {
            return null!;
        }

        public bool IsEnabled(LogLevel logLevel)
        {
            return logLevel != LogLevel.None;
        }

        public void Log<TState>(LogLevel logLevel, EventId eventId, TState state, Exception? exception, Func<TState, Exception?, string> formatter)
        {
            if (!IsEnabled(logLevel))
            {
                // Don't log the entry if it's not enabled.
                return;
            }

            var threadId = Thread.CurrentThread.ManagedThreadId;

            var message = formatter(state, exception);

            var record = new LogRecord
            {
                EventId = eventId.ToString(),
                ExceptionMessage = exception?.Message,
                ExceptionStackTrace = exception?.StackTrace,
                LogLevel = logLevel.ToString(),
                Message = !String.IsNullOrWhiteSpace(message) ? message : "",
                ThreadId = threadId,
                CorelationId = _corelationId
            };

            _context.Add(record);
            _context.SaveChanges();
        }
    }
}
