# accounts/question_models.py
from mongoengine import Document, StringField, IntField, ListField, EmbeddedDocument, EmbeddedDocumentField, DateTimeField, FloatField, BooleanField
from datetime import datetime
import uuid

class QuestionOption(EmbeddedDocument):
    """For multiple choice questions"""
    option_text = StringField(required=True)
    is_correct = BooleanField(default=False)

class Question(Document):
    """Question Bank Model"""
    question_id = StringField(required=True, unique=True, default=lambda: str(uuid.uuid4()))
    title = StringField(required=True, max_length=500)
    content = StringField(required=True)
    subject = StringField(required=True, max_length=100)
    topic = StringField(required=True, max_length=200)
    subtopic = StringField(max_length=200)
    
    # Question Classification
    question_type = StringField(choices=['multiple_choice', 'essay', 'short_answer', 'numerical', 'true_false'], required=True)
    difficulty_level = StringField(choices=['easy', 'medium', 'hard'], required=True)
    bloom_level = StringField(choices=['remember', 'understand', 'apply', 'analyze', 'evaluate', 'create'], required=True)
    cognitive_level = StringField(choices=['L1', 'L2', 'L3', 'L4'], default='L1')
    
    # Academic Details
    marks = IntField(required=True, min_value=1, max_value=100)
    expected_time_minutes = IntField(default=5)  # Expected solving time
    
    # MCQ specific
    options = ListField(EmbeddedDocumentField(QuestionOption))
    
    # Answer and Explanation
    correct_answer = StringField()
    explanation = StringField()
    keywords = ListField(StringField(max_length=50))
    
    # CO-PO Mapping (Course Outcome - Program Outcome)
    course_outcome = StringField(max_length=10)  # e.g., "CO1", "CO2"
    program_outcome = ListField(StringField(max_length=10))  # e.g., ["PO1", "PO2"]
    
    # Metadata
    created_by = IntField(required=True)  # Django user ID
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)
    is_ai_generated = BooleanField(default=False)
    ai_confidence_score = FloatField(min_value=0.0, max_value=1.0)
    
    # Usage tracking
    usage_count = IntField(default=0)
    last_used = DateTimeField()
    
    # Quality metrics
    review_status = StringField(choices=['pending', 'approved', 'rejected'], default='pending')
    quality_score = FloatField(min_value=0.0, max_value=10.0)
    
    meta = {
        'collection': 'questions',
        'indexes': [
            'subject',
            'topic',
            'difficulty_level',
            'bloom_level',
            'question_type',
            'created_by',
            ('subject', 'topic'),
            ('difficulty_level', 'bloom_level')
        ]
    }

class QuestionPaperQuestion(EmbeddedDocument):
    """Questions included in a question paper"""
    question_id = StringField(required=True)
    question_number = IntField(required=True)
    marks_allocated = IntField(required=True)
    is_compulsory = BooleanField(default=True)
    alternative_to = StringField()  # For choice questions

class QuestionPaper(Document):
    """Question Paper Model"""
    paper_id = StringField(required=True, unique=True, default=lambda: str(uuid.uuid4()))
    title = StringField(required=True, max_length=300)
    subject = StringField(required=True, max_length=100)
    course_code = StringField(max_length=20)
    semester = StringField(max_length=20)
    academic_year = StringField(max_length=20)
    
    # Paper Configuration
    exam_type = StringField(choices=['midterm', 'final', 'quiz', 'assignment', 'practice'], required=True)
    duration_minutes = IntField(required=True)
    total_marks = IntField(required=True)
    passing_marks = IntField()
    
    # Instructions
    general_instructions = ListField(StringField())
    specific_instructions = StringField()
    
    # Questions
    questions = ListField(EmbeddedDocumentField(QuestionPaperQuestion))
    total_questions = IntField(default=0)
    compulsory_questions = IntField(default=0)
    choice_questions = IntField(default=0)
    
    # Difficulty Distribution
    easy_questions_count = IntField(default=0)
    medium_questions_count = IntField(default=0)
    hard_questions_count = IntField(default=0)
    
    # Bloom's Distribution
    bloom_distribution = StringField()  # JSON string storing distribution
    
    # Generation Details
    created_by = IntField(required=True)  # Django user ID
    created_at = DateTimeField(default=datetime.now)
    updated_at = DateTimeField(default=datetime.now)
    generation_method = StringField(choices=['manual', 'template', 'ai_assisted'], default='manual')
    generation_time_seconds = FloatField()
    
    # Template and Pattern
    template_used = StringField()
    difficulty_pattern = StringField()  # e.g., "30% Easy, 50% Medium, 20% Hard"
    
    # Export and Usage
    export_formats = ListField(StringField())  # ['pdf', 'docx', 'txt']
    download_count = IntField(default=0)
    last_downloaded = DateTimeField()
    
    # Quality and Review
    review_status = StringField(choices=['draft', 'reviewed', 'approved', 'published'], default='draft')
    reviewed_by = IntField()  # Admin user ID
    review_comments = StringField()
    
    meta = {
        'collection': 'question_papers',
        'indexes': [
            'subject',
            'exam_type',
            'created_by',
            'created_at',
            ('subject', 'exam_type'),
            ('created_by', 'created_at')
        ]
    }

class PaperGenerationLog(Document):
    """Track paper generation activities for admin analytics"""
    log_id = StringField(required=True, unique=True, default=lambda: str(uuid.uuid4()))
    
    # User and Paper Info
    user_id = IntField(required=True)
    paper_id = StringField()
    
    # Generation Details
    action = StringField(choices=[
        'paper_created', 'paper_generated', 'paper_exported', 
        'questions_added', 'ai_generation_used', 'template_applied'
    ], required=True)
    
    generation_config = StringField()  # JSON string of generation parameters
    ai_model_used = StringField()
    credits_consumed = IntField(default=0)
    
    # Performance Metrics
    execution_time_seconds = FloatField()
    questions_generated = IntField(default=0)
    success_rate = FloatField(min_value=0.0, max_value=1.0)
    
    # Timestamps
    timestamp = DateTimeField(default=datetime.now)
    
    # Additional Context
    ip_address = StringField()
    user_agent = StringField()
    session_id = StringField()
    
    meta = {
        'collection': 'paper_generation_logs',
        'indexes': [
            'user_id',
            'action',
            'timestamp',
            ('user_id', 'timestamp'),
            ('action', 'timestamp')
        ]
    }

class CreditTransaction(Document):
    """Track credit usage for admin monitoring"""
    transaction_id = StringField(required=True, unique=True, default=lambda: str(uuid.uuid4()))
    
    # User and Transaction Info
    user_id = IntField(required=True)
    transaction_type = StringField(choices=[
        'credit_added', 'credit_deducted', 'paper_generation', 
        'ai_question_generation', 'template_usage', 'export_download'
    ], required=True)
    
    # Credit Details
    credits_before = IntField(required=True)
    credits_after = IntField(required=True)
    credits_changed = IntField(required=True)  # Positive for add, negative for deduct
    
    # Related Activity
    related_paper_id = StringField()
    related_question_count = IntField(default=0)
    activity_description = StringField()
    
    # Administrative
    processed_by = IntField()  # Admin user ID if manually processed
    auto_processed = BooleanField(default=True)
    
    # Timestamp
    timestamp = DateTimeField(default=datetime.now)
    
    meta = {
        'collection': 'credit_transactions',
        'indexes': [
            'user_id',
            'transaction_type',
            'timestamp',
            ('user_id', 'timestamp')
        ]
    }

class SubjectTemplate(Document):
    """Pre-defined templates for different subjects"""
    template_id = StringField(required=True, unique=True, default=lambda: str(uuid.uuid4()))
    template_name = StringField(required=True, max_length=200)
    subject = StringField(required=True, max_length=100)
    
    # Template Configuration
    exam_type = StringField(choices=['midterm', 'final', 'quiz', 'assignment'], required=True)
    duration_minutes = IntField(required=True)
    total_marks = IntField(required=True)
    
    # Question Distribution
    question_distribution = StringField()  # JSON string
    difficulty_distribution = StringField()  # JSON string
    bloom_distribution = StringField()  # JSON string
    
    # Template Rules
    rules = StringField()  # JSON string of generation rules
    instructions_template = StringField()
    
    # Metadata
    created_by = IntField(required=True)
    created_at = DateTimeField(default=datetime.now)
    is_public = BooleanField(default=False)
    usage_count = IntField(default=0)
    
    meta = {
        'collection': 'subject_templates',
        'indexes': ['subject', 'exam_type', 'created_by']
    }