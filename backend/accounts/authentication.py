from rest_framework_simplejwt.authentication import JWTAuthentication
import logging

logger = logging.getLogger(__name__)

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        print(f"🔐 CustomJWT: Authenticating request to {request.path}")
        
        # Try cookie first
        access_token = request.COOKIES.get("access_token")
        print(f"🍪 Cookie access_token: {'Present' if access_token else 'Missing'}")
        
        # Fallback to Authorization header
        if access_token is None:
            header = self.get_header(request)
            print(f"📋 Auth header: {'Present' if header else 'Missing'}")
            if header is None:
                print("❌ No authentication found")
                return None
            access_token = self.get_raw_token(header)

        if access_token is None:
            print("❌ No valid token found")
            return None

        try:
            validated_token = self.get_validated_token(access_token)
            user = self.get_user(validated_token)
            print(f"✅ Authentication successful for user: {user.email} (type: {user.user_type})")
            return user, validated_token
        except Exception as e:
            print(f"❌ Token validation failed: {str(e)}")
            return None
