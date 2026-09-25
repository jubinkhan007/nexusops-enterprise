import re
import time
from typing import Dict, Tuple
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import JSONResponse

# WAF Regex Signatures
SQLI_PATTERN = re.compile(
    r"(?i)(\b(UNION\s+SELECT|SELECT\s+.*\s+FROM|INSERT\s+INTO|DELETE\s+FROM|DROP\s+TABLE|ALTER\s+TABLE|EXEC(UTE)?\s+)\b|' OR '1'='1|--|;\s*SHUTDOWN)"
)
XSS_PATTERN = re.compile(
    r"(?i)(<script[^>]*>|javascript:|vbscript:|onload\s*=|onerror\s*=|document\.cookie|<iframe|<object|<embed)"
)
PATH_TRAVERSAL_PATTERN = re.compile(
    r"(?i)(\.\./\.\./|\.\.\\\.\.\\|/etc/passwd|/etc/shadow|c:\\windows\\system32)"
)

# In-memory sliding window store
RATE_LIMIT_STORE: Dict[str, Tuple[float, int]] = {}
RATE_LIMIT_MAX = 100
RATE_LIMIT_WINDOW = 60.0 # seconds


def inspect_payload(text: str) -> Tuple[bool, str]:
    if not text:
        return False, ""
    if SQLI_PATTERN.search(text):
        return True, "SQL Injection Signature"
    if XSS_PATTERN.search(text):
        return True, "Cross-Site Scripting (XSS) Signature"
    if PATH_TRAVERSAL_PATTERN.search(text):
        return True, "Path Traversal Signature"
    return False, ""


class WafAndRateLimitMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        client_ip = request.client.host if request.client else "127.0.0.1"
        tenant_id = request.headers.get("X-Tenant-ID", "")
        client_key = f"{tenant_id}:{client_ip}" if tenant_id else client_ip

        # 1. WAF Payload Inspection (Query Parameters & Headers)
        query_str = str(request.query_params)
        is_malicious, rule = inspect_payload(query_str)
        if is_malicious:
            return JSONResponse(
                status_code=403,
                content={
                    "error": "Forbidden",
                    "message": "Request blocked by NexusOps FastAPI Web Application Firewall (WAF).",
                    "rule": rule,
                    "location": "Query Parameters"
                }
            )

        for header_name, header_value in request.headers.items():
            is_malicious, rule = inspect_payload(header_value)
            if is_malicious:
                return JSONResponse(
                    status_code=403,
                    content={
                        "error": "Forbidden",
                        "message": "Request blocked by NexusOps FastAPI Web Application Firewall (WAF).",
                        "rule": rule,
                        "location": f"Header ({header_name})"
                    }
                )

        # 2. Sliding Window Rate Limiting
        now = time.time()
        if client_key in RATE_LIMIT_STORE:
            window_start, count = RATE_LIMIT_STORE[client_key]
            if now - window_start > RATE_LIMIT_WINDOW:
                RATE_LIMIT_STORE[client_key] = (now, 1)
                count = 1
            else:
                count += 1
                RATE_LIMIT_STORE[client_key] = (window_start, count)
        else:
            RATE_LIMIT_STORE[client_key] = (now, 1)
            count = 1

        remaining = max(0, RATE_LIMIT_MAX - count)

        if count > RATE_LIMIT_MAX:
            return JSONResponse(
                status_code=429,
                headers={
                    "Retry-After": "60",
                    "X-RateLimit-Limit": str(RATE_LIMIT_MAX),
                    "X-RateLimit-Remaining": "0"
                },
                content={
                    "error": "Too Many Requests",
                    "message": "Rate limit exceeded on FastAPI AI service. Please retry in 60 seconds.",
                    "limit": RATE_LIMIT_MAX
                }
            )

        response = await call_next(request)
        response.headers["X-RateLimit-Limit"] = str(RATE_LIMIT_MAX)
        response.headers["X-RateLimit-Remaining"] = str(remaining)
        return response
