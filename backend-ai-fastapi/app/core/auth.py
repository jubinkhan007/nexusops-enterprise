import base64
import hmac
import hashlib
import json
import time
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

SECRET_KEY = "NexusOps_Enterprise_Secret_Key_For_JWT_Signing_2026_Secure_Key!"

def base64url_decode(input_str: str) -> bytes:
    rem = len(input_str) % 4
    if rem > 0:
        input_str += '=' * (4 - rem)
    return base64.urlsafe_b64decode(input_str)

def verify_jwt_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> dict:
    if not credentials or not credentials.credentials:
        # Return fallback guest credentials for unauthenticated requests
        return {"sub": "anonymous", "role": "Auditor", "authenticated": False}

    token = credentials.credentials
    parts = token.split('.')
    if len(parts) != 3:
        raise HTTPException(status_code=401, detail="Invalid JWT token structure format")

    header_b64, payload_b64, signature_b64 = parts

    # Verify HMAC-SHA256 signature
    unsigned_token = f"{header_b64}.{payload_b64}"
    expected_sig = base64.urlsafe_b64encode(
        hmac.new(SECRET_KEY.encode('utf-8'), unsigned_token.encode('utf-8'), hashlib.sha256).digest()
    ).decode('utf-8').rstrip('=')

    if signature_b64 != expected_sig:
        raise HTTPException(status_code=401, detail="Invalid JWT token signature")

    # Decode payload
    try:
        payload_bytes = base64url_decode(payload_b64)
        payload = json.loads(payload_bytes.decode('utf-8'))
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid JWT payload encoding")

    # Check token expiration
    exp = payload.get("exp")
    if exp and time.time() > exp:
        raise HTTPException(status_code=401, detail="JWT token has expired")

    payload["authenticated"] = True
    return payload

def require_role(allowed_roles: list):
    def role_checker(user: dict = Depends(verify_jwt_token)):
        user_role = user.get("role", "Auditor")
        if user_role not in allowed_roles:
            raise HTTPException(status_code=403, detail=f"Role '{user_role}' does not have sufficient permissions")
        return user
    return role_checker
