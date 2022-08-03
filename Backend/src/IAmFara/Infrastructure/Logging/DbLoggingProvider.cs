using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    class DbLoggerConfig
    {
        public const string _section = "DbLogger";
#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public Dictionary<string, LogLevel> LogLevel { get; set; }
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
    }

    internal class DbLoggingProvider : ILoggerProvider
    {
        private readonly LoggingDbContext _loggingDb;
        private IDisposable _onChangConfig;
        private readonly ConcurrentDictionary<string, DbLogger> _loggers = new(StringComparer.OrdinalIgnoreCase);

        public DbLoggingProvider(LoggingDbContext loggingDb, IOptionsMonitor<DbLoggerConfig> options)
        {
            _loggingDb = loggingDb;
            Config = options.CurrentValue;
            _onChangConfig = options.OnChange(updaedConfig => Config = updaedConfig);
        }

        internal DbLoggerConfig Config { get; private set; }
        internal LoggingDbContext DbContext => _loggingDb;

        public ILogger CreateLogger(string categoryName)
        {
            return _loggers.GetOrAdd(categoryName, name => new DbLogger(name, this));
        }

        public void Dispose()
        {

        }
    }
}
