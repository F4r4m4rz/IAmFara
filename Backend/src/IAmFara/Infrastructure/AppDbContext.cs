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
    internal class AppDbContext : DbContext
    {
        private readonly string _connectionString;

        public AppDbContext(string connectionString)
        {
            _connectionString = connectionString;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder builder)
        {
            builder.UseSqlServer(_connectionString);
        }

        public DbSet<LogRecord> Logs { get; set; }
        public DbSet<IntroductionTextModel> IntroTexts { get; set; }
        public DbSet<SkillModel> Skills { get; set; }
        public DbSet<AppUser> Users { get; set; }
    }
}
