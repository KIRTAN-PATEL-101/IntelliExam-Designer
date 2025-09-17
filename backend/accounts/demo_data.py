# accounts/demo_data.py
from datetime import datetime, timedelta
from django.utils import timezone
from .models import User
from .mongo_models import CustomUser
from .question_models import Question, QuestionPaper, PaperGenerationLog, CreditTransaction
import uuid
import random

class DemoDataGenerator:
    """Generate demo data for testing admin dashboard"""
    
    @staticmethod
    def create_demo_questions(user_id, count=20):
        """Create demo questions for testing"""
        subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science', 'Biology']
        topics = ['Algebra', 'Calculus', 'Mechanics', 'Thermodynamics', 'Organic Chemistry', 
                 'Data Structures', 'Algorithms', 'Genetics', 'Cell Biology']
        difficulties = ['easy', 'medium', 'hard']
        bloom_levels = ['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create']
        question_types = ['multiple_choice', 'essay', 'short_answer', 'numerical']
        
        questions = []
        for i in range(count):
            question = Question(
                title=f"Demo Question {i+1}",
                content=f"This is a demo question about {random.choice(topics)}. What is the correct approach to solve this problem?",
                subject=random.choice(subjects),
                topic=random.choice(topics),
                question_type=random.choice(question_types),
                difficulty_level=random.choice(difficulties),
                bloom_level=random.choice(bloom_levels),
                marks=random.randint(1, 10),
                expected_time_minutes=random.randint(2, 15),
                correct_answer="This is a demo answer",
                explanation="This is a demo explanation",
                keywords=[random.choice(topics), "demo"],
                created_by=user_id,
                is_ai_generated=random.choice([True, False]),
                usage_count=random.randint(0, 5),
                created_at=timezone.now() - timedelta(days=random.randint(0, 30))
            )
            questions.append(question)
        
        # Bulk save
        Question.objects.insert(questions)
        return len(questions)
    
    @staticmethod
    def create_demo_papers(user_id, count=10):
        """Create demo question papers"""
        subjects = ['Mathematics', 'Physics', 'Chemistry', 'Computer Science']
        exam_types = ['midterm', 'final', 'quiz', 'assignment']
        
        papers = []
        for i in range(count):
            paper = QuestionPaper(
                title=f"Demo Exam Paper {i+1}",
                subject=random.choice(subjects),
                course_code=f"CS{random.randint(100, 599)}",
                semester=random.choice(['Fall 2024', 'Spring 2024', 'Summer 2024']),
                exam_type=random.choice(exam_types),
                duration_minutes=random.choice([60, 90, 120, 180]),
                total_marks=random.choice([50, 75, 100, 150]),
                total_questions=random.randint(5, 25),
                easy_questions_count=random.randint(1, 5),
                medium_questions_count=random.randint(2, 8),
                hard_questions_count=random.randint(1, 4),
                created_by=user_id,
                generation_method=random.choice(['manual', 'template', 'ai_assisted']),
                generation_time_seconds=random.uniform(2.5, 45.0),
                download_count=random.randint(0, 10),
                created_at=timezone.now() - timedelta(days=random.randint(0, 60))
            )
            papers.append(paper)
        
        QuestionPaper.objects.insert(papers)
        return len(papers)
    
    @staticmethod
    def create_demo_activities(user_id, count=30):
        """Create demo activity logs"""
        actions = ['paper_created', 'paper_generated', 'paper_exported', 
                  'questions_added', 'ai_generation_used', 'template_applied']
        
        activities = []
        for i in range(count):
            activity = PaperGenerationLog(
                user_id=user_id,
                paper_id=str(uuid.uuid4()) if random.choice([True, False]) else None,
                action=random.choice(actions),
                generation_config='{"difficulty": "mixed", "count": 10}',
                credits_consumed=random.randint(1, 5),
                execution_time_seconds=random.uniform(1.0, 30.0),
                questions_generated=random.randint(0, 20),
                timestamp=timezone.now() - timedelta(days=random.randint(0, 7)),
                ip_address=f"192.168.1.{random.randint(1, 254)}",
                user_agent="Demo User Agent"
            )
            activities.append(activity)
        
        PaperGenerationLog.objects.insert(activities)
        return len(activities)
    
    @staticmethod
    def create_demo_credit_transactions(user_id, count=15):
        """Create demo credit transactions"""
        transaction_types = ['credit_added', 'paper_generation', 'ai_question_generation', 'export_download']
        
        current_credits = 50  # Starting balance
        transactions = []
        
        for i in range(count):
            transaction_type = random.choice(transaction_types)
            
            if transaction_type == 'credit_added':
                credits_changed = random.randint(10, 50)
            else:
                credits_changed = -random.randint(1, 5)
            
            credits_before = current_credits
            current_credits += credits_changed
            
            transaction = CreditTransaction(
                user_id=user_id,
                transaction_type=transaction_type,
                credits_before=credits_before,
                credits_after=current_credits,
                credits_changed=credits_changed,
                activity_description=f"Demo {transaction_type}",
                auto_processed=transaction_type != 'credit_added',
                timestamp=timezone.now() - timedelta(days=random.randint(0, 30))
            )
            transactions.append(transaction)
        
        CreditTransaction.objects.insert(transactions)
        
        # Update user's current credits
        try:
            mongo_user = CustomUser.objects.get(django_user_id=user_id)
            mongo_user.credits = current_credits
            mongo_user.save()
        except:
            pass
        
        return len(transactions)
    
    @staticmethod
    def populate_demo_data_for_all_professors():
        """Populate demo data for all professors"""
        professors = User.objects.filter(user_type='professor')
        total_created = 0
        
        for professor in professors:
            try:
                # Create questions
                questions_count = DemoDataGenerator.create_demo_questions(professor.id, random.randint(5, 20))
                
                # Create papers
                papers_count = DemoDataGenerator.create_demo_papers(professor.id, random.randint(3, 10))
                
                # Create activities
                activities_count = DemoDataGenerator.create_demo_activities(professor.id, random.randint(10, 30))
                
                # Create credit transactions
                transactions_count = DemoDataGenerator.create_demo_credit_transactions(professor.id, random.randint(5, 15))
                
                total_created += questions_count + papers_count + activities_count + transactions_count
                
                print(f"Created demo data for {professor.email}: {questions_count} questions, {papers_count} papers, {activities_count} activities, {transactions_count} transactions")
                
            except Exception as e:
                print(f"Error creating demo data for {professor.email}: {e}")
        
        return total_created
    
    @staticmethod
    def clear_demo_data():
        """Clear all demo data (use with caution!)"""
        try:
            Question.objects.delete()
            QuestionPaper.objects.delete()
            PaperGenerationLog.objects.delete()
            CreditTransaction.objects.delete()
            print("All demo data cleared successfully")
            return True
        except Exception as e:
            print(f"Error clearing demo data: {e}")
            return False