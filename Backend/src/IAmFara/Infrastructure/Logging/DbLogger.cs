using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Diagnostics.CodeAnalysis;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    internal class DbLogger : ILogger
    {
        private readonly string _categoryName;
        private readonly DbLoggingProvider _provider;

        public DbLogger(string categoryName, [NotNull]  DbLoggingProvider provider)
        {
            _categoryName = categoryName;
            _provider = provider;
        }

        public static Guid CorelationId { get; internal set; }

        public IDisposable BeginScope<TState>(TState state)
        {
            return null!;
        }

        public bool IsEnabled(LogLevel logLevel)
        {
            var levelKey = _provider.Config.LogLevel.Keys.FirstOrDefault(k => _categoryName.Contains(k));
            if (levelKey is null)
            {
                var defaultLevel = _provider.Config.LogLevel["Default"];
                return logLevel >= defaultLevel;
            }

            return logLevel >= _provider.Config.LogLevel[levelKey];
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
                Category = _categoryName,
                LogLevel = logLevel.ToString(),
                Message = !String.IsNullOrWhiteSpace(message) ? message : "",
                ThreadId = threadId,
                CorelationId = CorelationId
            };

            _provider.DbContext.Add(record);
            _provider.DbContext.SaveChanges();
        }
    }
}
