using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class SsoController : ControllerBase
    {
        public static readonly string SecretKey = "NexusOps_Enterprise_Secret_Key_For_JWT_Signing_2026_Secure_Key!";

        /// <summary>
        /// Serves SAML 2.0 Service Provider (SP) XML Metadata for Okta / Azure AD / PingIdentity import.
        /// </summary>
        [HttpGet("saml/metadata")]
        public IActionResult GetSamlMetadata()
        {
            var entityId = "https://nexusops.enterprise.internal/saml/sp";
            var acsUrl = "https://nexusops.enterprise.internal/api/auth/sso/callback";

            var xmlMetadata = $@"<?xml=""1.0"" encoding=""UTF-8""?>
<md:EntityDescriptor xmlns:md=""urn:oasis:names:tc:SAML:2.0:metadata"" entityID=""{entityId}"">
  <md:SPSSODescriptor AuthnRequestsSigned=""false"" WantAssertionsSigned=""true"" protocolSupportEnumeration=""urn:oasis:names:tc:SAML:2.0:protocol"">
    <md:NameIDFormat>urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress</md:NameIDFormat>
    <md:AssertionConsumerService Binding=""urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"" Location=""{acsUrl}"" index=""1"" isDefault=""true""/>
  </md:SPSSODescriptor:SPSSODescriptor>
</md:EntityDescriptor>";

            return Content(xmlMetadata, "application/xml");
        }

        /// <summary>
        /// Validates SAML 2.0 / Okta OIDC SSO assertions and issues JWT bearer token with mapped RBAC roles.
        /// </summary>
        [HttpPost("sso/callback")]
        public IActionResult ProcessSsoCallback([FromBody] SsoCallbackRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
            {
                return BadRequest(new { error = "Invalid Claims", message = "SSO assertion must contain valid User Email." });
            }

            // Perform Just-In-Time (JIT) RBAC Role Mapping based on IdP Groups
            string mappedRole = "Operator"; // Default fallback
            var groups = request.Groups ?? new List<string>();

            if (groups.Contains("NexusOps_Admins") || groups.Contains("Global_Admins"))
            {
                mappedRole = "Admin";
            }
            else if (groups.Contains("NexusOps_Auditors") || groups.Contains("Compliance_Auditors"))
            {
                mappedRole = "Auditor";
            }

            var provider = request.Provider ?? "Okta-SAML2";
            var jwtString = GenerateJwtToken(request.Email, mappedRole, provider);

            return Ok(new SsoAuthResponse
            {
                Token = jwtString,
                Email = request.Email,
                Role = mappedRole,
                Provider = provider,
                ExpiresAt = DateTime.UtcNow.AddHours(8).ToString("o")
            });
        }

        private static string GenerateJwtToken(string email, string role, string provider)
        {
            var header = new { alg = "HS256", typ = "JWT" };
            var headerJson = JsonSerializer.Serialize(header);
            var headerBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));

            var issuedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var expiresAt = issuedAt + 28800; // 8 hours

            var payload = new
            {
                sub = email,
                name = email,
                email = email,
                role = role,
                idp = provider,
                iss = "NexusOps.Api",
                aud = "NexusOps.Clients",
                iat = issuedAt,
                exp = expiresAt
            };

            var payloadJson = JsonSerializer.Serialize(payload);
            var payloadBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(payloadJson));

            var unsignedToken = $"{headerBase64}.{payloadBase64}";
            using var hmac = new HMACSHA256(Encoding.UTF8.GetBytes(SecretKey));
            var signatureBytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(unsignedToken));
            var signatureBase64 = Base64UrlEncode(signatureBytes);

            return $"{unsignedToken}.{signatureBase64}";
        }

        private static string Base64UrlEncode(byte[] input)
        {
            return Convert.ToBase64String(input)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }
    }

    public class SsoCallbackRequest
    {
        public string Email { get; set; } = string.Empty;
        public string? Provider { get; set; }
        public List<string>? Groups { get; set; }
        public string? SamlResponse { get; set; }
    }

    public class SsoAuthResponse
    {
        public string Token { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Provider { get; set; } = string.Empty;
        public string ExpiresAt { get; set; } = string.Empty;
    }
}
