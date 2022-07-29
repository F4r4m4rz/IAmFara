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

        public LoggingDbContext(string conStr)
        {
            _conStr = conStr;
        }

        public LoggingDbContext(DbContextOptions<LoggingDbContext> options) : base(options)
        {

        }

        protected override void OnConfiguring(DbContextOptionsBuilder options)
        {
            if (!string.IsNullOrWhiteSpace(_conStr))
                options.UseSqlServer(_conStr);
        }

        public DbSet<LogRecord> LogRecords { get; set; }
    }
}
