using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    internal class LogRecord
    {
        public int Id { get; set; }
        public string? LogLevel { get; set; }
        public int ThreadId { get; set; }
        public string? EventId { get; set; }
        public Guid? CorelationId { get; set; }
        public string? Message { get; set; }
        public string? ExceptionMessage { get; set; }
        public string? ExceptionStackTrace { get; set; }
    }
}
