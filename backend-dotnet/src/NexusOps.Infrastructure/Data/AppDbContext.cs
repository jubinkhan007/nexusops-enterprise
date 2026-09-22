using Microsoft.EntityFrameworkCore;
using NexusOps.Domain.Entities;

namespace NexusOps.Infrastructure.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Tenant> Tenants => Set<Tenant>();
        public DbSet<User> Users => Set<User>();
        public DbSet<AutomationWorkflow> Workflows => Set<AutomationWorkflow>();
        public DbSet<DocumentPayload> Documents => Set<DocumentPayload>();
        public DbSet<ExecutionLog> ExecutionLogs => Set<ExecutionLog>();
        public DbSet<AIInsight> AIInsights => Set<AIInsight>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Tenant>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(150);
                entity.Property(e => e.Code).IsRequired().HasMaxLength(50);
            });

            modelBuilder.Entity<AutomationWorkflow>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Tenant)
                      .WithMany(t => t.Workflows)
                      .HasForeignKey(e => e.TenantId);
            });

            modelBuilder.Entity<ExecutionLog>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.HasOne(e => e.Workflow)
                      .WithMany(w => w.ExecutionLogs)
                      .HasForeignKey(e => e.WorkflowId);
            });
        }
    }
}
