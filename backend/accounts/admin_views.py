# accounts/admin_views.py

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Q
from datetime import datetime, timedelta
from django.utils import timezone
from .models import User
from .mongo_models import CustomUser
from .question_models import Question, QuestionPaper, PaperGenerationLog, CreditTransaction
from rest_framework.decorators import api_view, permission_classes

class AdminDashboardView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Check if user is admin
        if request.user.user_type != 'admin':
            return Response({"error": "Admin access required"}, status=403)
        
        try:
            print("🔍 AdminDashboard: Starting data collection...")
            
            # Get date ranges
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # Basic statistics
            print("📊 Getting Django user stats...")
            total_professors = User.objects.filter(user_type='professor').count()
            total_admins = User.objects.filter(user_type='admin').count()
            print(f"✅ Django stats - Professors: {total_professors}, Admins: {total_admins}")
            
            # MongoDB statistics - with error handling
            print("🍃 Getting MongoDB stats...")
            try:
                total_mongo_users = CustomUser.objects.count()  # type: ignore
                professor_mongo_users = CustomUser.objects.filter(user_type='professor')  # type: ignore
                professor_mongo_count = professor_mongo_users.count()
                print(f"✅ MongoDB stats - Total: {total_mongo_users}, Professors: {professor_mongo_count}")
                
                # Credit statistics
                total_credits = 0
                low_credit_count = 0
                high_usage_count = 0
                
                for user in professor_mongo_users:
                    total_credits += user.credits
                    if user.credits < 5:
                        low_credit_count += 1
                    if user.credits < 3:
                        high_usage_count += 1
                        
            except Exception as mongo_error:
                print(f"❌ MongoDB error: {mongo_error}")
                # Fallback values
                total_mongo_users = 0
                professor_mongo_count = 0
                total_credits = 0
                low_credit_count = 0
                high_usage_count = 0
            
            # Recent registrations
            recent_professors = User.objects.filter(
                user_type='professor',
                date_joined__gte=week_ago
            ).count()
            
            # Calculate average credits
            avg_credits = total_credits / total_professors if total_professors > 0 else 0
            
            dashboard_data = {
                "overview": {
                    "total_professors": total_professors,
                    "total_admins": total_admins,
                    "total_users": total_professors + total_admins,
                    "recent_professors_this_week": recent_professors,
                    "total_credits_issued": total_credits,
                    "average_credits_per_professor": round(avg_credits, 2)
                },
                "credit_analytics": {
                    "total_credits_in_system": total_credits,
                    "professors_with_low_credits": low_credit_count,
                    "professors_with_high_usage": high_usage_count
                },
                "system_health": {
                    "active_professors": professor_mongo_count,
                    "inactive_professors": total_professors - professor_mongo_count,
                    "database_status": "Connected"
                }
            }
            
            return Response(dashboard_data, status=200)
            
        except Exception as e:
            print(f"❌ AdminDashboard critical error: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


class ProfessorListView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({"error": "Admin access required"}, status=403)
        
        try:
            print("🔍 ProfessorList: Getting professor data...")
            # Get all professors from Django
            professors = User.objects.filter(user_type='professor').order_by('-date_joined')
            print(f"✅ Found {professors.count()} professors in Django")
            
            professor_data = []
            for prof in professors:
                try:
                    # Get corresponding MongoDB user with better error handling
                    try:
                        mongo_user = CustomUser.objects.get(django_user_id=prof.id)  # type: ignore
                        credits = mongo_user.credits
                        institution = mongo_user.institution
                    except CustomUser.DoesNotExist:  # type: ignore
                        print(f"⚠️ MongoDB user not found for {prof.email}")
                        credits = 0
                        institution = "Not set"
                    except Exception as mongo_error:
                        print(f"❌ MongoDB error for {prof.email}: {mongo_error}")
                        credits = 0
                        institution = "Error loading"
                    
                    professor_info = {
                        "id": prof.id,
                        "email": prof.email,
                        "first_name": prof.first_name,
                        "last_name": prof.last_name,
                        "institution": institution,
                        "credits": credits,
                        "date_joined": prof.date_joined.strftime("%Y-%m-%d"),
                        "last_login": prof.last_login.strftime("%Y-%m-%d %H:%M") if prof.last_login else "Never",
                        "is_active": prof.is_active
                    }
                    
                except Exception as prof_error:
                    print(f"❌ Error processing professor {prof.email}: {prof_error}")
                    # Still add basic info even if there's an error
                    professor_info = {
                        "id": prof.id,
                        "email": prof.email,
                        "first_name": prof.first_name,
                        "last_name": prof.last_name,
                        "institution": "Error loading",
                        "credits": 0,
                        "date_joined": prof.date_joined.strftime("%Y-%m-%d"),
                        "last_login": prof.last_login.strftime("%Y-%m-%d %H:%M") if prof.last_login else "Never",
                        "is_active": prof.is_active
                    }
                
                professor_data.append(professor_info)
            
            print(f"✅ Successfully processed {len(professor_data)} professors")
            return Response({
                "professors": professor_data,
                "total_count": len(professor_data)
            }, status=200)
            
        except Exception as e:
            print(f"❌ ProfessorList critical error: {e}")
            import traceback
            traceback.print_exc()
            return Response({"error": str(e)}, status=500)


class CreditManagementView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        if request.user.user_type != 'admin':
            return Response({"error": "Admin access required"}, status=403)
        
        try:
            professor_id = request.data.get('professor_id')
            action = request.data.get('action')  # 'add' or 'deduct'
            amount = int(request.data.get('amount', 0))
            
            if not professor_id or not action or amount <= 0:
                return Response({"error": "Invalid data provided"}, status=400)
            
            # Get the professor
            professor = User.objects.get(id=professor_id, user_type='professor')
            mongo_user = CustomUser.objects.get(django_user_id=professor.id)  # type: ignore
            
            if action == 'add':
                mongo_user.credits += amount
                message = f"Added {amount} credits to {professor.email}"
            elif action == 'deduct':
                if mongo_user.credits >= amount:
                    mongo_user.credits -= amount
                    message = f"Deducted {amount} credits from {professor.email}"
                else:
                    return Response({"error": "Insufficient credits to deduct"}, status=400)
            else:
                return Response({"error": "Invalid action"}, status=400)
            
            mongo_user.save()
            
            return Response({
                "message": message,
                "new_credit_balance": mongo_user.credits
            }, status=200)
            
        except User.DoesNotExist:  # type: ignore
            return Response({"error": "Professor not found"}, status=404)
        except CustomUser.DoesNotExist:  # type: ignore
            return Response({"error": "Professor MongoDB record not found"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)


class SystemStatsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        if request.user.user_type != 'admin':
            return Response({"error": "Admin access required"}, status=403)
        
        try:
            # Get various system statistics
            stats = {
                "user_stats": {
                    "total_users": User.objects.count(),
                    "active_users": User.objects.filter(is_active=True).count(),
                    "professors": User.objects.filter(user_type='professor').count(),
                    "admins": User.objects.filter(user_type='admin').count()
                },
                "recent_activity": {
                    "new_registrations_today": User.objects.filter(
                        date_joined__date=timezone.now().date()
                    ).count(),
                    "new_registrations_this_week": User.objects.filter(
                        date_joined__gte=timezone.now().date() - timedelta(days=7)
                    ).count(),
                    "new_registrations_this_month": User.objects.filter(
                        date_joined__gte=timezone.now().date() - timedelta(days=30)
                    ).count()
                },
                "institution_breakdown": self._get_institution_stats()
            }
            
            return Response(stats, status=200)
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
    def _get_institution_stats(self):
        """Get breakdown of users by institution"""
        try:
            institutions = {}
            mongo_users = CustomUser.objects.all()  # type: ignore
            
            for user in mongo_users:
                institution = user.institution or "Not specified"
                if institution in institutions:
                    institutions[institution] += 1
                else:
                    institutions[institution] = 1
            
            # Convert to list of dictionaries for easier frontend handling
            institution_list = [
                {"name": name, "count": count} 
                for name, count in institutions.items()
            ]
            
            return sorted(institution_list, key=lambda x: x['count'], reverse=True)
        except:
            return []