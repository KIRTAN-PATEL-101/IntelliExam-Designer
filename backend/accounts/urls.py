# accounts/urls.py

from django.urls import path
from .views import RegisterView, LoginView, TestMongoView, ForgotPasswordView, ResetPasswordView,AuthCheckView, LogoutView, CheckUserTypeView
from .admin_views import AdminDashboardView, ProfessorListView, CreditManagementView, SystemStatsView
from .question_views import QuestionBankView, QuestionPaperView, AdminAnalyticsView, UserActivityView, log_activity, generate_demo_data
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
    path('check-user-type/', CheckUserTypeView.as_view(), name='check-user-type'),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Admin endpoints
    path('admin/dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('admin/professors/', ProfessorListView.as_view(), name='admin-professors'),
    path('admin/credits/', CreditManagementView.as_view(), name='admin-credits'),
    path('admin/stats/', SystemStatsView.as_view(), name='admin-stats'),
    path('admin/analytics/', AdminAnalyticsView.as_view(), name='admin-analytics'),
    path('admin/user-activity/<int:user_id>/', UserActivityView.as_view(), name='admin-user-activity'),
    
    # Question and Paper Management
    path('questions/', QuestionBankView.as_view(), name='questions'),
    path('papers/', QuestionPaperView.as_view(), name='papers'),
    path('log-activity/', log_activity, name='log-activity'),
    
    # Demo data (for testing)
    path('admin/generate-demo-data/', generate_demo_data, name='generate-demo-data'),
]
