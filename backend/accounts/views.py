# accounts/views.py

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from accounts.mongodb import users_collection
from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
from rest_framework.permissions import AllowAny

class RegisterView(APIView):
    permission_classes = [AllowAny]  # ✅ anyone can call this

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")
        email = request.data.get("email")

        if not username or not password or not email:
            return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "User already exists"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({"error": "Email already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password, email=email)

        users_collection.insert_one({
            "username": username,
            "email": email, 
            "django_user_id": user.id
        })

        return Response({"message": "User registered successfully"}, status=status.HTTP_201_CREATED)


    
# class LoginView(APIView):
#     def post(self, request):
        
#         email = request.data.get("email")
#         password = request.data.get("password")

#         if not email or not password:
#             return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)
#         try:
#             user = User.objects.get(email=email)
#         except User.DoesNotExist:
#             return Response({"error": "Invalid credentials"}, status=401)

#         # user = authenticate(username=user.username, password=password)

#     # Authenticate using username (required by Django's auth system)
#         user = authenticate(username=user.username, password=password)

#         if not user:
#             return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

#     # Generate refresh and access tokens
#         refresh = RefreshToken.for_user(user)
#         access_token = str(refresh.access_token)
#         refresh_token = str(refresh)

#     # Build the response
#         response = Response({"message": "Login successful"}, status=status.HTTP_200_OK)

#     # Set access token (short-lived)
#         response.set_cookie(
#         key="access_token",
#         value=access_token,
#         httponly=True,
#         secure=False,  # Set to True in production with HTTPS
#         samesite="Lax",
#         max_age=5 * 60  # 5 minutes
#     )

#     # Set refresh token (longer-lived)
#         response.set_cookie(
#         key="refresh_token",
#         value=refresh_token,
#         httponly=True,
#         secure=False,
#         samesite="Lax",
#         max_age=7 * 24 * 60 * 60  # 7 days
#     )

#         return response
class LoginView(APIView):
    permission_classes = [AllowAny]  # ✅ This fixes your 401 issue

    def post(self, request):
        email = request.data.get("email")
        password = request.data.get("password")

        if not email or not password:
            return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Authenticate with username (Django default)
        user = authenticate(username=user.username, password=password)

        if not user:
            return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

        # Create JWT tokens
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)

        # Response with cookies
        response = Response({"message": "Login successful"}, status=status.HTTP_200_OK)

        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            secure=False,  # True in production with HTTPS
            samesite="Lax",
            max_age=5 * 60
        )

        response.set_cookie(
            key="refresh_token",
            value=refresh_token,
            httponly=True,
            secure=False,
            samesite="Lax",
            max_age=7 * 24 * 60 * 60
        )

        return response

        # if not user:
        #     return Response({"error": "Invalid credentials"}, status=401)

        # refresh = RefreshToken.for_user(user)
        # access_token = str(refresh.access_token)

        # response = Response({"message": "Login successful"})
        # # Set access token (optional - usually short lived)
        # response.set_cookie(
        #     key="access_token",
        #     value=access_token,
        #     httponly=True,
        #     secure=False,  # True in production
        #     samesite='Lax',
        #     max_age=300  # 5 minutes
        # )

        # # Set refresh token (longer-lived)
        # response.set_cookie(
        #     key="refresh_token",
        #     value=str(refresh),
        #     httponly=True,
        #     secure=False,
        #     samesite='Lax',
        #     max_age=7 * 24 * 3600  # 7 days
        # )

        # return response
    
# class LoginView(APIView):
#     def post(self, request):
#         email = request.data.get("email")
#         password = request.data.get("password")

#         if not email or not password:  
#             return Response({"error": "Email and password are required"}, status=status.HTTP_400_BAD_REQUEST)  

#         try:
#             user_obj = User.objects.get(email=email)
#         except User.DoesNotExist:
#             return Response({"error": "User does not exist"}, status=status.HTTP_400_BAD_REQUEST)
#         # user_obj = User.objects.get(email=email)  
#     # except User.DoesNotExist:  
#         # return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)  

#         user = authenticate(username=user_obj.username, password=password)  

#         if user:  
#             refresh = RefreshToken.for_user(user)  
#             return Response({  
#             "refresh": str(refresh),  
#             "access": str(refresh.access_token),  
#         })  


#         return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        response = Response({"message": "Logged out successfully"}, status=status.HTTP_200_OK)
        
        cookie_settings = {
            "path": "/",
            "samesite": "Lax",
            "secure": False  # True in production
        }
        response.delete_cookie('access_token',**cookie_settings)
        response.delete_cookie('refresh_token',**cookie_settings)
        return response

class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]   # <-- add this

    def post(self, request):
        email = request.data.get("email")
        if not email:
            return Response({"error": "Email is required"}, status=400)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({"error": "No user found with this email"}, status=404)

        token_generator = PasswordResetTokenGenerator()
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = token_generator.make_token(user)
        reset_link = f"http://localhost:8080/reset-password/{uid}/{token}/"

        send_mail(
            subject="Reset Your Password",
            message=f"Click here to reset your password: {reset_link}",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
        )

        return Response({"message": "Password reset link sent."}, status=200)
    
class ResetPasswordView(APIView):
    permission_classes = [AllowAny]   # <-- add this

    def post(self, request, uidb64, token):
        password = request.data.get("password")
        confirm = request.data.get("confirmPassword")

        if password != confirm:
            return Response({"error": "Passwords do not match"}, status=400)

        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (User.DoesNotExist, ValueError, TypeError):
            return Response({"error": "Invalid link"}, status=400)

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({"error": "Invalid or expired token"}, status=400)

        user.set_password(password)
        user.save()

        return Response({"message": "Password has been reset."}, status=200)
    

class AuthCheckView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            "authenticated": True,
            "email": request.user.email,  # Return email instead of username
            "user_id": request.user.id,
            # "name": request.user.get_full_name()  # Optional if you store names
        })
    
class TestMongoView(APIView):
    def get(self, request):
        user_data = {"name": "Test", "email": "test@example.com"}
        users_collection.insert_one(user_data)
        return Response({"message": "User added to MongoDB!"})
