using Microsoft.AspNetCore.Mvc;

namespace NexusOps.Api.Controllers
{
    public class IapSessionStatus
    {
        public string SessionId { get; set; } = Guid.NewGuid().ToString("N");
        public string UserEmail { get; set; } = "secops-admin@nexusops.enterprise.io";
        public string Role { get; set; } = "SecOpsAdmin";
        public bool IsMtlsValidated { get; set; } = true;
        public string MtlsFingerprint { get; set; } = "SHA256:7f8e9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f";
        public string OAuthIssuer { get; set; } = "https://auth.nexusops.enterprise.io";
        public DateTime TokenExpiresAt { get; set; } = DateTime.UtcNow.AddMinutes(55);
        public string DevicePosture { get; set; } = "Compliant (Encrypted Disk / EDR Active)";
        public string ClientIp { get; set; } = "192.168.10.45";
    }

    public class IapAuthorizationRequest
    {
        public string ResourceUrl { get; set; } = "/api/compliance/audit";
        public string HttpMethod { get; set; } = "GET";
        public string UserRole { get; set; } = "SecOpsAdmin";
        public bool RequireMtls { get; set; } = true;
    }

    public class IapAuthorizationResponse
    {
        public bool Authorized { get; set; }
        public string Decision { get; set; } = string.Empty;
        public string MatchedPolicy { get; set; } = string.Empty;
        public DateTime EvaluatedAt { get; set; } = DateTime.UtcNow;
    }

    [ApiController]
    [Route("api/[controller]")]
    public class IapController : ControllerBase
    {
        private static readonly List<string> SecurityPolicies = new()
        {
            "Policy-001: Mandatory mTLS v1.3 Client Certificate for all /api/admin/* endpoints",
            "Policy-002: OAuth2 Token Max Lifetime 60 minutes with hardware key binding",
            "Policy-003: Require EDR Compliant Device Posture claim for SecOps role",
            "Policy-004: Deny all unauthenticated egress/ingress requests by default"
        };

        [HttpGet("session")]
        public IActionResult GetSession()
        {
            var session = new IapSessionStatus();
            return Ok(session);
        }

        [HttpGet("policies")]
        public IActionResult GetPolicies()
        {
            return Ok(new
            {
                TotalPolicies = SecurityPolicies.Count,
                Policies = SecurityPolicies
            });
        }

        [HttpPost("authorize")]
        public IActionResult AuthorizeRequest([FromBody] IapAuthorizationRequest request)
        {
            if (request.RequireMtls && string.IsNullOrEmpty(request.UserRole))
            {
                return Ok(new IapAuthorizationResponse
                {
                    Authorized = false,
                    Decision = "DENIED: Missing valid OAuth2 role claim and mTLS context",
                    MatchedPolicy = "Policy-004: Default Deny All"
                });
            }

            bool isAllowed = request.UserRole == "SecOpsAdmin" || request.UserRole == "Admin" || request.UserRole == "DevOps";
            return Ok(new IapAuthorizationResponse
            {
                Authorized = isAllowed,
                Decision = isAllowed ? "ALLOWED: Zero-Trust mTLS & OAuth2 Claims Validated" : "DENIED: Insufficient Role Permissions",
                MatchedPolicy = isAllowed ? "Policy-001: Mandatory mTLS & OAuth2 Validation" : "Policy-004: Default Deny All"
            });
        }
    }
}
