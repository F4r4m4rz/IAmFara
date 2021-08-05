using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text;

namespace IAmFara.Core.DynamicAddin
{
    public interface IAddinLogs
    {
        void Log();
    }

    internal class AddinLogs : IAddinLogs
    {
        private static IList<AddinLogEntry> _logEntries;
        private readonly ILogger<AddinLogs> _logger;

        static AddinLogs()
        {
            _logEntries = new List<AddinLogEntry>();
        }

        public AddinLogs(ILogger<AddinLogs> logger)
        {
            _logger = logger;
        }

        public void Log()
        {
            foreach (var entry in _logEntries)
            {
                entry.Log(_logger);
            }
        }

        private static void Log(string message, AddinLogEntryLevels level)
        {
            var entry = new AddinLogEntry
            {
                Level = level,
                Message = message
            };
            _logEntries.Add(entry);
        }

        public static void Reset()
        {
            _logEntries.Clear();
        }

        internal static void LogDebug(string message)
        {
            Log(message, AddinLogEntryLevels.Debug);
        }

        internal static void LogInformation(string message)
        {
            Log(message, AddinLogEntryLevels.Information);
        }

        internal static void LogWarning(string message)
        {
            Log(message, AddinLogEntryLevels.Warning);
        }

        internal static void LogError(string message)
        {
            Log(message, AddinLogEntryLevels.Error);
        }

        private enum AddinLogEntryLevels
        {
            Debug, Information, Warning, Error
        }

        private class AddinLogEntry
        {
            public AddinLogEntryLevels Level { get; set; }
            public string Message { get; set; }

            public void Log(ILogger logger)
            {
                switch (Level)
                {
                    case AddinLogEntryLevels.Debug:
                        logger.LogDebug(Message);
                        break;
                    case AddinLogEntryLevels.Information:
                        logger.LogInformation(Message);
                        break;
                    case AddinLogEntryLevels.Warning:
                        logger.LogWarning(Message);
                        break;
                    case AddinLogEntryLevels.Error:
                        logger.LogError(Message);
                        break;
                    default:
                        break;
                }
            }
        }
    }
}
