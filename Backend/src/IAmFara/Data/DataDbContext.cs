using Data.Model;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Data
{
#nullable disable
    public class DataDbContext : DbContext
    {
        private readonly string _connectionString;

        public DataDbContext(string connectionString)
        {
            _connectionString = connectionString;
        }

        protected override void OnConfiguring(DbContextOptionsBuilder builder)
        {
            builder.UseSqlServer(_connectionString);
        }

        public DbSet<IntroductionTextModel> IntroTexts { get; set; }
        public DbSet<SkillModel> Skills { get; set; }
        public DbSet<AppUser> Users { get; set; }
    }
}
