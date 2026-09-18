using IAmFara.Data.Abstractions.Identity;
using Microsoft.EntityFrameworkCore;

namespace IAmFara.Data.SqlServer.Identity;

public class IdentityDbContext(DbContextOptions<IdentityDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<PasskeyCredential> PasskeyCredentials => Set<PasskeyCredential>();
    public DbSet<Invitation> Invitations => Set<Invitation>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.HasDefaultSchema("identity");

        modelBuilder.Entity<User>(entity =>
        {
            entity.ToTable("Users");
            entity.HasKey(u => u.Id);
            entity.Property(u => u.DisplayName).HasMaxLength(200).IsRequired();
            entity.Property(u => u.Email).HasMaxLength(320).IsRequired();
        });

        modelBuilder.Entity<PasskeyCredential>(entity =>
        {
            entity.ToTable("PasskeyCredentials");
            entity.HasKey(p => p.Id);
            entity.HasIndex(p => p.CredentialId).IsUnique();
            entity.HasIndex(p => p.UserId);

            // A user's credentials are part of their identity, but deleting a
            // user isn't a supported operation yet — Restrict rather than
            // Cascade so that decision isn't made implicitly by this FK.
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Restrict);
        });

        modelBuilder.Entity<Invitation>(entity =>
        {
            entity.ToTable("Invitations");
            entity.HasKey(i => i.Id);
            entity.HasIndex(i => i.TokenHash).IsUnique();

            // CreatedByUserId is audit-only (never an authorization basis), so
            // losing it on user deletion is acceptable — SetNull keeps the
            // invitation itself intact.
            entity.HasOne<User>()
                .WithMany()
                .HasForeignKey(i => i.CreatedByUserId)
                .OnDelete(DeleteBehavior.SetNull);
        });
    }
}
