# accounts/urls.py

from django.urls import path
from .views import RegisterView, LoginView, TestMongoView, ForgotPasswordView, ResetPasswordView,AuthCheckView, LogoutView
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view() , name='logout'),
    path('test-mongo/', TestMongoView.as_view(), name='test-mongo'),
    path('forgot-password/', ForgotPasswordView.as_view() , name='forgot-password'),
    path('reset-password/<uidb64>/<token>/', ResetPasswordView.as_view() , name='reset-password'),
    path("auth-check/", AuthCheckView.as_view() , name="auth-check"),
     path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]   
