# accounts/question_views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Count, Sum, Q
from datetime import datetime, timedelta
from django.utils import timezone
from .models import User
from .mongo_models import CustomUser
from .question_models import Question, QuestionPaper, PaperGenerationLog, CreditTransaction, SubjectTemplate
import json
from django.core.paginator import Paginator
from rest_framework.decorators import api_view, permission_classes

class QuestionBankView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get questions for the authenticated user"""
        try:
            # Get query parameters
            subject = request.GET.get('subject')
            topic = request.GET.get('topic')
            difficulty = request.GET.get('difficulty')
            question_type = request.GET.get('type')
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 20))
            
            # Build query
            query = Question.objects(created_by=request.user.id)  # type: ignore
            
            if subject:
                query = query.filter(subject=subject)
            if topic:
                query = query.filter(topic=topic)
            if difficulty:
                query = query.filter(difficulty_level=difficulty)
            if question_type:
                query = query.filter(question_type=question_type)
            
            # Get total count
            total_count = query.count()
            
            # Apply pagination
            skip = (page - 1) * limit
            questions = query.skip(skip).limit(limit).order_by('-created_at')
            
            # Convert to dict
            questions_data = []
            for q in questions:
                questions_data.append({
                    'id': str(q.id),
                    'question_id': q.question_id,
                    'title': q.title,
                    'content': q.content,
                    'subject': q.subject,
                    'topic': q.topic,
                    'question_type': q.question_type,
                    'difficulty_level': q.difficulty_level,
                    'bloom_level': q.bloom_level,
                    'marks': q.marks,
                    'created_at': q.created_at.isoformat(),
                    'usage_count': q.usage_count,
                    'is_ai_generated': q.is_ai_generated
                })
            
            return Response({
                'questions': questions_data,
                'total_count': total_count,
                'page': page,
                'total_pages': (total_count + limit - 1) // limit
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)
    
    def post(self, request):
        """Create a new question"""
        try:
            data = request.data
            
            # Validate required fields
            required_fields = ['title', 'content', 'subject', 'topic', 'question_type', 'difficulty_level', 'bloom_level', 'marks']
            for field in required_fields:
                if not data.get(field):
                    return Response({'error': f'{field} is required'}, status=400)
            
            # Create question
            question = Question(
                title=data['title'],
                content=data['content'],
                subject=data['subject'],
                topic=data['topic'],
                subtopic=data.get('subtopic', ''),
                question_type=data['question_type'],
                difficulty_level=data['difficulty_level'],
                bloom_level=data['bloom_level'],
                marks=int(data['marks']),
                expected_time_minutes=int(data.get('expected_time_minutes', 5)),
                correct_answer=data.get('correct_answer', ''),
                explanation=data.get('explanation', ''),
                keywords=data.get('keywords', []),
                course_outcome=data.get('course_outcome', ''),
                program_outcome=data.get('program_outcome', []),
                created_by=request.user.id,
                is_ai_generated=data.get('is_ai_generated', False)
            )
            
            # Handle MCQ options
            if data['question_type'] == 'multiple_choice' and data.get('options'):
                from .question_models import QuestionOption
                options = []
                for opt in data['options']:
                    options.append(QuestionOption(
                        option_text=opt['text'],
                        is_correct=opt.get('is_correct', False)
                    ))
                question.options = options
            
            question.save()
            
            return Response({
                'message': 'Question created successfully',
                'question_id': question.question_id
            }, status=201)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class QuestionPaperView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        """Get question papers for the authenticated user"""
        try:
            page = int(request.GET.get('page', 1))
            limit = int(request.GET.get('limit', 20))
            
            # Build query
            query = QuestionPaper.objects(created_by=request.user.id)  # type: ignore
            
            # Get total count
            total_count = query.count()
            
            # Apply pagination
            skip = (page - 1) * limit
            papers = query.skip(skip).limit(limit).order_by('-created_at')
            
            # Convert to dict
            papers_data = []
            for p in papers:
                papers_data.append({
                    'id': str(p.id),
                    'paper_id': p.paper_id,
                    'title': p.title,
                    'subject': p.subject,
                    'exam_type': p.exam_type,
                    'duration_minutes': p.duration_minutes,
                    'total_marks': p.total_marks,
                    'total_questions': p.total_questions,
                    'created_at': p.created_at.isoformat(),
                    'review_status': p.review_status,
                    'download_count': p.download_count
                })
            
            return Response({
                'papers': papers_data,
                'total_count': total_count,
                'page': page,
                'total_pages': (total_count + limit - 1) // limit
            }, status=200)
            
        except Exception as e:
            return Response({'error': str(e)}, status=500)

class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def _get_avg_questions_per_paper(self):
        """Helper method to safely get average questions per paper"""
        try:
            papers = QuestionPaper.objects.all()  # type: ignore
            if papers.count() == 0:
                return 0
            total_questions = sum(paper.total_questions for paper in papers)
            return round(total_questions / papers.count(), 2)
        except Exception:
            return 0
    
    def get(self, request):
        """Get comprehensive analytics for admin dashboard"""
        if request.user.user_type != 'admin':
            return Response({"error": "Admin access required"}, status=403)
        
        try:
            # Date ranges
            today = timezone.now().date()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # Question Analytics
            total_questions = Question.objects.count()  # type: ignore
            questions_this_week = Question.objects.filter(created_at__gte=week_ago).count()  # type: ignore
            questions_this_month = Question.objects.filter(created_at__gte=month_ago).count()  # type: ignore
            
            # Question distribution by difficulty
            difficulty_stats = {}
            for level in ['easy', 'medium', 'hard']:
                difficulty_stats[level] = Question.objects.filter(difficulty_level=level).count()  # type: ignore
            
            # Question distribution by subject - using safe aggregation
            try:
                subject_pipeline = [
                    {"$group": {"_id": "$subject", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}},
                    {"$limit": 10}
                ]
                subject_stats = list(Question.objects.aggregate(*subject_pipeline))  # type: ignore
            except Exception as e:
                print(f"Subject stats error: {e}")
                subject_stats = []
            
            # Paper Analytics
            total_papers = QuestionPaper.objects.count()  # type: ignore
            papers_this_week = QuestionPaper.objects.filter(created_at__gte=week_ago).count()  # type: ignore
            papers_this_month = QuestionPaper.objects.filter(created_at__gte=month_ago).count()  # type: ignore
            
            # Papers by exam type - using safe aggregation
            try:
                exam_type_pipeline = [
                    {"$group": {"_id": "$exam_type", "count": {"$sum": 1}}},
                    {"$sort": {"count": -1}}
                ]
                exam_type_stats = list(QuestionPaper.objects.aggregate(*exam_type_pipeline))  # type: ignore
            except Exception as e:
                print(f"Exam type stats error: {e}")
                exam_type_stats = []
            
            # Generation Activity
            generation_logs_week = PaperGenerationLog.objects.filter(timestamp__gte=week_ago).count()  # type: ignore
            ai_usage_week = PaperGenerationLog.objects.filter(  # type: ignore
                timestamp__gte=week_ago,
                action='ai_generation_used'
            ).count()
            
            # Credit Analytics - using safe aggregation
            credit_transactions_week = CreditTransaction.objects.filter(timestamp__gte=week_ago).count()  # type: ignore
            try:
                total_credits_consumed = CreditTransaction.objects.filter(  # type: ignore
                    credits_changed__lt=0
                ).aggregate(
                    {"$group": {"_id": None, "total": {"$sum": {"$abs": "$credits_changed"}}}}
                )
                total_credits_value = total_credits_consumed[0].get('total', 0) if total_credits_consumed else 0
            except Exception as e:
                print(f"Credit analytics error: {e}")
                total_credits_value = 0
            
            # Top Active Users - using safe aggregation
            try:
                active_users_pipeline = [
                    {"$match": {"timestamp": {"$gte": week_ago}}},
                    {"$group": {"_id": "$user_id", "activity_count": {"$sum": 1}}},
                    {"$sort": {"activity_count": -1}},
                    {"$limit": 10}
                ]
                active_users = list(PaperGenerationLog.objects.aggregate(*active_users_pipeline))  # type: ignore
            except Exception as e:
                print(f"Active users error: {e}")
                active_users = []
            
            # Add user details to active users
            for user_data in active_users:
                try:
                    django_user = User.objects.get(id=user_data['_id'])
                    user_data['email'] = django_user.email
                    user_data['name'] = f"{django_user.first_name} {django_user.last_name}"
                except User.DoesNotExist:  # type: ignore
                    user_data['email'] = "Unknown"
                    user_data['name'] = "Unknown User"
            
            # Performance Metrics - using safe aggregation
            try:
                avg_generation_time = PaperGenerationLog.objects.filter(  # type: ignore
                    execution_time_seconds__ne=None
                ).aggregate(
                    {"$group": {"_id": None, "avg_time": {"$avg": "$execution_time_seconds"}}}
                )
                avg_time_value = avg_generation_time[0].get('avg_time', 0) if avg_generation_time else 0
            except Exception as e:
                print(f"Performance metrics error: {e}")
                avg_time_value = 0
            
            response_data = {
                "question_analytics": {
                    "total_questions": total_questions,
                    "questions_this_week": questions_this_week,
                    "questions_this_month": questions_this_month,
                    "difficulty_distribution": difficulty_stats,
                    "subject_distribution": subject_stats,
                    "ai_generated_questions": Question.objects.filter(is_ai_generated=True).count()  # type: ignore
                },
                "paper_analytics": {
                    "total_papers": total_papers,
                    "papers_this_week": papers_this_week,
                    "papers_this_month": papers_this_month,
                    "exam_type_distribution": exam_type_stats,
                    "avg_questions_per_paper": self._get_avg_questions_per_paper(),
                },
                "activity_analytics": {
                    "generation_activities_week": generation_logs_week,
                    "ai_usage_week": ai_usage_week,
                    "credit_transactions_week": credit_transactions_week,
                    "total_credits_consumed": total_credits_value,
                    "avg_generation_time_seconds": avg_time_value
                },
                "top_active_users": active_users,
                "system_health": {
                    "database_status": "Connected",
                    "total_users": User.objects.count(),
                    "active_professors_week": User.objects.filter(
                        last_login__gte=week_ago,
                        user_type='professor'
                    ).count()
                }
            }
            
            return Response(response_data, status=200)
            
        except Exception as e:
            print(f"Analytics error: {e}")
            return Response({"error": str(e)}, status=500)

class UserActivityView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request, user_id=None):
        """Get detailed activity for a specific user (admin only)"""
        if request.user.user_type != 'admin':
            return Response({"error": "Admin access required"}, status=403)
        
        try:
            target_user_id = user_id or request.GET.get('user_id')
            if not target_user_id:
                return Response({"error": "User ID required"}, status=400)
            
            # Get user info
            try:
                user = User.objects.get(id=target_user_id)
                mongo_user = CustomUser.objects.get(django_user_id=target_user_id)  # type: ignore
            except (User.DoesNotExist, CustomUser.DoesNotExist):  # type: ignore
                return Response({"error": "User not found"}, status=404)
            
            # Get activity logs
            activities = list(PaperGenerationLog.objects.filter(  # type: ignore
                user_id=target_user_id
            ).order_by('-timestamp')[:50])
            
            # Get credit transactions
            credit_history = list(CreditTransaction.objects.filter(  # type: ignore
                user_id=target_user_id
            ).order_by('-timestamp')[:20])
            
            # Get user's questions and papers count
            questions_count = Question.objects.filter(created_by=target_user_id).count()  # type: ignore
            papers_count = QuestionPaper.objects.filter(created_by=target_user_id).count()  # type: ignore
            
            # Convert activities to dict
            activities_data = []
            for activity in activities:
                activities_data.append({
                    'action': activity.action,
                    'timestamp': activity.timestamp.isoformat(),
                    'credits_consumed': activity.credits_consumed,
                    'questions_generated': activity.questions_generated,
                    'execution_time': activity.execution_time_seconds,
                    'paper_id': activity.paper_id
                })
            
            # Convert credit history to dict
            credit_history_data = []
            for transaction in credit_history:
                credit_history_data.append({
                    'transaction_type': transaction.transaction_type,
                    'credits_changed': transaction.credits_changed,
                    'credits_before': transaction.credits_before,
                    'credits_after': transaction.credits_after,
                    'timestamp': transaction.timestamp.isoformat(),
                    'description': transaction.activity_description
                })
            
            response_data = {
                "user_info": {
                    "id": user.id,
                    "email": user.email,
                    "name": f"{user.first_name} {user.last_name}",
                    "institution": mongo_user.institution,
                    "current_credits": mongo_user.credits,
                    "user_type": user.user_type,
                    "date_joined": user.date_joined.isoformat(),
                    "last_login": user.last_login.isoformat() if user.last_login else None
                },
                "activity_summary": {
                    "total_questions_created": questions_count,
                    "total_papers_created": papers_count,
                    "total_activities": len(activities),
                    "total_credit_transactions": len(credit_history)
                },
                "recent_activities": activities_data,
                "credit_history": credit_history_data
            }
            
            return Response(response_data, status=200)
            
        except Exception as e:
            return Response({"error": str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def generate_demo_data(request):
    """Generate demo data for testing (admin only)"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=403)
    
    try:
        from .demo_data import DemoDataGenerator
        
        # Generate demo data for all professors
        total_created = DemoDataGenerator.populate_demo_data_for_all_professors()
        
        return Response({
            'message': f'Successfully generated demo data. Total items created: {total_created}',
            'total_items': total_created
        }, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def clear_demo_data(request):
    """Clear all demo data (admin only)"""
    if request.user.user_type != 'admin':
        return Response({'error': 'Admin access required'}, status=403)
    
    try:
        from .demo_data import DemoDataGenerator
        
        success = DemoDataGenerator.clear_demo_data()
        
        if success:
            return Response({'message': 'Successfully cleared all demo data'}, status=200)
        else:
            return Response({'error': 'Failed to clear demo data'}, status=500)
            
    except Exception as e:
        return Response({'error': str(e)}, status=500)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_activity(request):
    """Log user activity for tracking"""
    try:
        data = request.data
        
        log = PaperGenerationLog(
            user_id=request.user.id,
            paper_id=data.get('paper_id'),
            action=data['action'],
            generation_config=data.get('config', ''),
            credits_consumed=data.get('credits_consumed', 0),
            execution_time_seconds=data.get('execution_time', 0),
            questions_generated=data.get('questions_generated', 0),
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')[:200]
        )
        log.save()
        
        return Response({'message': 'Activity logged'}, status=200)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)