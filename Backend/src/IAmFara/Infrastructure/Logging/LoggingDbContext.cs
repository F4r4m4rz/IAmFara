using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure.Logging
{
    internal interface ILoggingDbContextFactory
    {
        LoggingDbContext GetInstance();
    }

    internal class LoggingDbContextFactory : ILoggingDbContextFactory
    {
        private readonly string _conStr;

        public LoggingDbContextFactory(string conStr)
        {
            _conStr = conStr;
        }

        public LoggingDbContext GetInstance()
        {
            return new LoggingDbContext(_conStr);
        }
    }

    internal class LoggingDbContext : DbContext
    {
        private readonly string? _conStr;

#pragma warning disable CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        public LoggingDbContext(string conStr)
#pragma warning restore CS8618 // Non-nullable field must contain a non-null value when exiting constructor. Consider declaring as nullable.
        {
            _conStr = conStr;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            if (!string.IsNullOrWhiteSpace(_conStr))
                options.UseSqlServer(_conStr);
        }

        public DbSet<LogRecord> LogRecords { get; set; }
    }
}
