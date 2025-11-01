# accounts/credit_service.py
from datetime import datetime
from .mongo_models import CustomUser
from .question_models import CreditTransaction, PaperGenerationLog

class CreditService:
    """Service for managing credit transactions and tracking"""
    
    # Credit costs for different operations
    CREDIT_COSTS = {
        'question_creation': 1,
        'ai_question_generation': 2,
        'paper_generation': 3,
        'ai_paper_generation': 5,
        'template_usage': 1,
        'bulk_import': 2,
        'pdf_export': 1,
        'docx_export': 1
    }
    
    @staticmethod
    def get_user_credits(user_id):
        """Get current credit balance for a user"""
        try:
            mongo_user = CustomUser.objects.get(django_user_id=user_id)
            return mongo_user.credits
        except CustomUser.DoesNotExist:
            return 0
    
    @staticmethod
    def deduct_credits(user_id, operation_type, amount=None, description="", related_paper_id=None):
        """
        Deduct credits from user account and log transaction
        Returns (success: bool, new_balance: int, message: str)
        """
        try:
            # Get amount if not specified
            if amount is None:
                amount = CreditService.CREDIT_COSTS.get(operation_type, 1)
            
            # Get user
            mongo_user = CustomUser.objects.get(django_user_id=user_id)
            
            # Check if user has enough credits
            if mongo_user.credits < amount:
                return False, mongo_user.credits, f"Insufficient credits. Required: {amount}, Available: {mongo_user.credits}"
            
            # Store previous balance
            credits_before = mongo_user.credits
            
            # Deduct credits
            mongo_user.credits -= amount
            mongo_user.save()
            
            # Log transaction
            transaction = CreditTransaction(
                user_id=user_id,
                transaction_type=operation_type,
                credits_before=credits_before,
                credits_after=mongo_user.credits,
                credits_changed=-amount,
                related_paper_id=related_paper_id,
                activity_description=description or f"Credits deducted for {operation_type}",
                auto_processed=True
            )
            transaction.save()
            
            return True, mongo_user.credits, f"Successfully deducted {amount} credits"
            
        except CustomUser.DoesNotExist:
            return False, 0, "User not found"
        except Exception as e:
            return False, 0, f"Error processing credit transaction: {str(e)}"
    
    @staticmethod
    def add_credits(user_id, amount, description="", processed_by=None):
        """
        Add credits to user account and log transaction
        Returns (success: bool, new_balance: int, message: str)
        """
        try:
            # Get user
            mongo_user = CustomUser.objects.get(django_user_id=user_id)
            
            # Store previous balance
            credits_before = mongo_user.credits
            
            # Add credits
            mongo_user.credits += amount
            mongo_user.save()
            
            # Log transaction
            transaction = CreditTransaction(
                user_id=user_id,
                transaction_type='credit_added',
                credits_before=credits_before,
                credits_after=mongo_user.credits,
                credits_changed=amount,
                activity_description=description or f"Credits added: {amount}",
                processed_by=processed_by,
                auto_processed=processed_by is None
            )
            transaction.save()
            
            return True, mongo_user.credits, f"Successfully added {amount} credits"
            
        except CustomUser.DoesNotExist:
            return False, 0, "User not found"
        except Exception as e:
            return False, 0, f"Error processing credit transaction: {str(e)}"
    
    @staticmethod
    def log_activity(user_id, action, paper_id=None, credits_consumed=0, execution_time=0, 
                    questions_generated=0, config="", ip_address="", user_agent=""):
        """Log user activity for admin monitoring"""
        try:
            log = PaperGenerationLog(
                user_id=user_id,
                paper_id=paper_id,
                action=action,
                generation_config=config,
                credits_consumed=credits_consumed,
                execution_time_seconds=execution_time,
                questions_generated=questions_generated,
                ip_address=ip_address[:45] if ip_address else "",  # IP field limit
                user_agent=user_agent[:200] if user_agent else ""  # User agent field limit
            )
            log.save()
            return True
        except Exception as e:
            print(f"Failed to log activity: {e}")
            return False
    
    @staticmethod
    def get_credit_history(user_id, limit=20):
        """Get credit transaction history for a user"""
        try:
            transactions = CreditTransaction.objects.filter(
                user_id=user_id
            ).order_by('-timestamp')[:limit]
            
            history = []
            for transaction in transactions:
                history.append({
                    'id': str(transaction.id),
                    'transaction_type': transaction.transaction_type,
                    'credits_changed': transaction.credits_changed,
                    'credits_before': transaction.credits_before,
                    'credits_after': transaction.credits_after,
                    'description': transaction.activity_description,
                    'timestamp': transaction.timestamp.isoformat(),
                    'auto_processed': transaction.auto_processed
                })
            
            return history
        except Exception as e:
            print(f"Failed to get credit history: {e}")
            return []
    
    @staticmethod
    def get_usage_analytics(user_id, days=30):
        """Get usage analytics for a user"""
        from datetime import timedelta
        from django.utils import timezone
        
        try:
            # Date range
            end_date = timezone.now()
            start_date = end_date - timedelta(days=days)
            
            # Get activities in date range
            activities = PaperGenerationLog.objects.filter(
                user_id=user_id,
                timestamp__gte=start_date
            )
            
            # Calculate statistics
            total_activities = activities.count()
            total_credits_used = sum([log.credits_consumed for log in activities])
            total_questions_generated = sum([log.questions_generated for log in activities])
            
            # Activity breakdown
            activity_breakdown = {}
            for activity in activities:
                action = activity.action
                if action in activity_breakdown:
                    activity_breakdown[action] += 1
                else:
                    activity_breakdown[action] = 1
            
            return {
                'period_days': days,
                'total_activities': total_activities,
                'total_credits_used': total_credits_used,
                'total_questions_generated': total_questions_generated,
                'activity_breakdown': activity_breakdown,
                'avg_credits_per_activity': total_credits_used / total_activities if total_activities > 0 else 0
            }
            
        except Exception as e:
            print(f"Failed to get usage analytics: {e}")
            return {}

    @staticmethod
    def check_and_warn_low_credits(user_id, threshold=5):
        """Check if user has low credits and return warning if needed"""
        try:
            current_credits = CreditService.get_user_credits(user_id)
            
            if current_credits <= threshold:
                return {
                    'warning': True,
                    'current_credits': current_credits,
                    'threshold': threshold,
                    'message': f"Warning: You have only {current_credits} credits remaining. Consider purchasing more credits to continue using the system."
                }
            
            return {
                'warning': False,
                'current_credits': current_credits,
                'threshold': threshold,
                'message': f"You have {current_credits} credits available."
            }
            
        except Exception as e:
            return {
                'warning': True,
                'current_credits': 0,
                'threshold': threshold,
                'message': "Unable to check credit balance."
            }