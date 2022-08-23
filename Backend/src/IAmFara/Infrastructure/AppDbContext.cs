using Data;
using Data.Model;
using Infrastructure.Logging;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Infrastructure
{
#nullable disable
    internal class AppDbContext : DataDbContext
    {
        public AppDbContext(string connectionString) : base(connectionString)
        {

        }

        public DbSet<LogRecord> Logs { get; set; }
    }
}
