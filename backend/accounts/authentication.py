from rest_framework_simplejwt.authentication import JWTAuthentication

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        # Try cookie first
        access_token = request.COOKIES.get("access_token")

        # Fallback to Authorization header
        if access_token is None:
            header = self.get_header(request)
            if header is None:
                return None
            access_token = self.get_raw_token(header)

        if access_token is None:
            return None

        validated_token = self.get_validated_token(access_token)
        return self.get_user(validated_token), validated_token
