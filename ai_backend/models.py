from pydantic import BaseModel, Field
from typing import List, Dict, Optional, Union
from enum import Enum

class DifficultyLevel(str, Enum):
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"

class QuestionType(str, Enum):
    OBJECTIVE = "objective"
    SUBJECTIVE = "subjective"
    MULTIPLE_CHOICE = "multiple_choice"
    TRUE_FALSE = "true_false"
    FILL_BLANKS = "fill_blanks"
    SHORT_ANSWER = "short_answer"
    LONG_ANSWER = "long_answer"

class BloomsTaxonomy(str, Enum):
    REMEMBER = "remember"
    UNDERSTAND = "understand"
    APPLY = "apply"
    ANALYZE = "analyze"
    EVALUATE = "evaluate"
    CREATE = "create"

class Question(BaseModel):
    id: str
    question_text: str
    question_type: QuestionType
    difficulty: DifficultyLevel
    blooms_level: BloomsTaxonomy
    marks: int
    options: Optional[List[str]] = None  # For MCQ
    correct_answer: Optional[Union[str, List[str]]] = None
    explanation: Optional[str] = None
    course_outcome: Optional[str] = None
    program_outcome: Optional[str] = None
    has_equations: bool = False
    equation_latex: Optional[str] = None

class QuestionGenerationRequest(BaseModel):
    subject: str
    topic: str
    syllabus_content: str
    
    # Question specifications
    total_questions: int = Field(ge=1, le=50)
    question_types: List[QuestionType]
    difficulty_distribution: Dict[DifficultyLevel, int]
    
    # Bloom's taxonomy
    blooms_distribution: Dict[BloomsTaxonomy, int]
    
    # Course and program outcomes
    course_outcomes: List[str] = []
    program_outcomes: List[str] = []
    
    # Similarity control
    similarity_threshold: float = Field(ge=0, le=100, default=70)
    previous_papers: List[str] = []
    
    # Additional options
    include_equations: bool = False
    marks_per_question: Dict[QuestionType, int] = {}
    
    # Header information for PDF
    university_name: str
    department: str
    course_name: str
    course_code: str
    exam_duration: str
    max_marks: int

class QuestionPaper(BaseModel):
    id: str
    title: str
    header_info: Dict[str, str]
    questions: List[Question]
    total_marks: int
    generated_at: str
    similarity_scores: Dict[str, float] = {}

class AlternativeQuestionRequest(BaseModel):
    original_question_id: str
    original_question: Question
    context: QuestionGenerationRequest
    reason: Optional[str] = None  # Why alternative is needed

class SimilarityAnalysis(BaseModel):
    question_id: str
    similarity_percentage: float
    similar_questions: List[str] = []
    recommendations: List[str] = []
