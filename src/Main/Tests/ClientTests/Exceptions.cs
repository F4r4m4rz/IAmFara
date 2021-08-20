using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Runtime.Serialization;
using System.Text;
using System.Threading.Tasks;
using IAmFara.Core.Dynamic.Abstractions;
using Microsoft.Extensions.Logging;

namespace IAmFara.ClientTests.Exceptions
{
    public abstract class ClientTestBaseException : Exception
    {
        protected ClientTestBaseException()
        {
        }

        protected ClientTestBaseException(string message) : base(message)
        {
        }

        protected ClientTestBaseException(SerializationInfo info, StreamingContext context) : base(info, context)
        {
        }

        protected ClientTestBaseException(string message, Exception innerException) : base(message, innerException)
        {
        }

        public abstract void LogPretty(ILogger logger);

        protected virtual void LogPretty(ILogger logger, IEnumerable<Exception> additionalExceptions)
        {
            var logEntry = Message;
            if (additionalExceptions?.Count() != 0)
            {
                var additionalEntries = new List<string>();
                foreach (var exception in additionalExceptions)
                {
                    additionalEntries.Add(exception.Message);
                }
                logEntry += "\n" + string.Join("\n", additionalEntries);
            }

            logger.LogWarning(logEntry);
        }
    }

    public class AssemblyLoadException : ClientTestBaseException
    {
        public AssemblyLoadException(string message, Exception innerException) : base(message, innerException)
        {

        }

        public AssemblyLoadException(string message, IEnumerable<AssemblyLoadException> loadExceptions) : base(message)
        {
            LoadExceptions = loadExceptions;
        }

        public IEnumerable<AssemblyLoadException> LoadExceptions { get; }

        public override void LogPretty(ILogger logger)
        {
            base.LogPretty(logger, LoadExceptions);
        }
    }

    public class PluginInstansiationException : ClientTestBaseException
    {
        public PluginInstansiationException(Type type, Exception innerException)
            : base($"Could not load plugin: {type.Name}", innerException)
        {
            Type = type;
        }

        public PluginInstansiationException(IEnumerable<PluginInstansiationException> instansiationExceptions)
            : base("Could not load one or more plugins")
        {
            InstansiationExceptions = instansiationExceptions;
        }

        public Type Type { get; }
        public IEnumerable<PluginInstansiationException> InstansiationExceptions { get; }

        public override void LogPretty(ILogger logger)
        {
            base.LogPretty(logger, InstansiationExceptions);
        }
    }

    public class PluginNotValidException : ClientTestBaseException
    {
        public PluginNotValidException(IPlugin plugin, ValidationException validationException)
            : base($"Plugin is not valid {(string.IsNullOrWhiteSpace(plugin.Name) ? plugin.GetType().Name : plugin.Name)}", validationException)
        {
            Plugin = plugin;
        }

        public PluginNotValidException(IEnumerable<PluginNotValidException> validattionExceptions)
            : base("One or more plugins are not valid")
        {
            ValidattionExceptions = validattionExceptions;
        }

        public IPlugin Plugin { get; }
        public IEnumerable<PluginNotValidException> ValidattionExceptions { get; }

        public override void LogPretty(ILogger logger)
        {
            base.LogPretty(logger, ValidattionExceptions);
        }
    }
}
