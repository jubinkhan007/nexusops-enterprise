using System;

namespace NexusOps.Infrastructure.Data
{
    public interface ITenantContext
    {
        Guid CurrentTenantId { get; set; }
        string TenantCode { get; set; }
    }

    public class TenantContext : ITenantContext
    {
        public static readonly Guid DefaultTenantId = Guid.Parse("10000000-0000-0000-0000-000000000001");
        
        public Guid CurrentTenantId { get; set; } = DefaultTenantId;
        public string TenantCode { get; set; } = "NEXUS_GLOBAL";
    }
}
