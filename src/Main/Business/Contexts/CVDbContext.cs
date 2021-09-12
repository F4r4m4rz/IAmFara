using System;
using System.Linq;
using IAmFara.Domain.CV;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Business.Contexts
{
    public class CVDbContext : DbContext
    {
        public CVDbContext(DbContextOptions<CVDbContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.HasDefaultSchema("CV");

            modelBuilder.Entity<Education>()
                .HasKey(e => e.Id);

            modelBuilder.Entity<Interest>()
                .HasKey(i => i.Title);

            modelBuilder.Entity<Project>()
                .HasKey(p => p.Id);

            modelBuilder.Entity<Introduction>()
                .HasKey(i => i.Title);

            modelBuilder.Entity<Skill>()
                .HasKey(s => s.Title);

            modelBuilder.Entity<WorkExperience>()
                .HasKey(w => w.Id);
        }
    }
}
