using Microsoft.AspNetCore.Mvc;
using System;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace NexusOps.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        public static readonly string SecretKey = "NexusOps_Enterprise_Secret_Key_For_JWT_Signing_2026_Secure_Key!";

        public class LoginRequest
        {
            public string Username { get; set; } = string.Empty;
            public string Password { get; set; } = string.Empty;
            public string Role { get; set; } = "Admin";
        }

        [HttpPost("token")]
        public IActionResult GenerateToken([FromBody] LoginRequest request)
        {
            var username = string.IsNullOrEmpty(request.Username) ? "enterprise_admin" : request.Username;
            var role = string.IsNullOrEmpty(request.Role) ? "Admin" : request.Role;

            var header = new { alg = "HS256", typ = "JWT" };
            var headerJson = JsonSerializer.Serialize(header);
            var headerBase64 = Base64UrlEncode(Encoding.UTF8.GetBytes(headerJson));

            var issuedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            var expiresAt = issuedAt + 86400;

            var payload = new
            {
                sub = username,
                name = username,
                email = $"{username}@nexusops.enterprise.internal",
                role = role,
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

            var jwtToken = $"{unsignedToken}.{signatureBase64}";

            return Ok(new
            {
                accessToken = jwtToken,
                tokenType = "Bearer",
                expiresIn = 86400,
                username = username,
                role = role,
                issuedAt = DateTime.UtcNow.ToString("o")
            });
        }

        private static string Base64UrlEncode(byte[] input)
        {
            return Convert.ToBase64String(input)
                .TrimEnd('=')
                .Replace('+', '-')
                .Replace('/', '_');
        }
    }
}
