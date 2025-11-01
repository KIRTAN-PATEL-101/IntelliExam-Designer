import asyncio
import json
import uuid
from datetime import datetime
from typing import List, Dict, Any, Optional
import re

from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from pydantic import BaseModel

from models import (
    QuestionGenerationRequest, QuestionPaper, Question, 
    AlternativeQuestionRequest, QuestionType, DifficultyLevel, BloomsTaxonomy
)
from similarity_analyzer import SimilarityAnalyzer
from equation_handler import EquationHandler
from .gemini_client import chat_completion
import os

class QuestionGeneratorState(BaseModel):
    request: QuestionGenerationRequest
    generated_questions: List[Question] = []
    current_question_index: int = 0
    similarity_scores: Dict[str, float] = {}
    validation_results: Dict[str, Any] = {}
    final_paper: Optional[QuestionPaper] = None

class QuestionGeneratorGraph:
    def __init__(self):
        self.llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.7,
            max_tokens=2000
        )
        self.similarity_analyzer = SimilarityAnalyzer()
        self.equation_handler = EquationHandler()
        self.graph = self._build_graph()

    def _build_graph(self) -> StateGraph:
        """Build the LangGraph workflow for question generation."""
        workflow = StateGraph(QuestionGeneratorState)
        
        # Define nodes
        workflow.add_node("plan_generation", self._plan_generation)
        workflow.add_node("generate_question", self._generate_question)
        workflow.add_node("validate_question", self._validate_question)
        workflow.add_node("check_similarity", self._check_similarity)
        workflow.add_node("finalize_paper", self._finalize_paper)
        
        # Define edges
        workflow.set_entry_point("plan_generation")
        workflow.add_edge("plan_generation", "generate_question")
        workflow.add_edge("generate_question", "validate_question")
        workflow.add_edge("validate_question", "check_similarity")
        
        # Conditional routing based on similarity check
        workflow.add_conditional_edges(
            "check_similarity",
            self._should_regenerate,
            {
                "regenerate": "generate_question",
                "continue": "finalize_paper",
                "next_question": "generate_question"
            }
        )
        
        workflow.add_edge("finalize_paper", END)
        
        return workflow.compile()

    async def _plan_generation(self, state: QuestionGeneratorState) -> QuestionGeneratorState:
        """Plan the question generation strategy."""
        request = state.request
        
        # Create a generation plan
        plan_prompt = ChatPromptTemplate.from_messages([
            ("system", """You are an expert educator creating a comprehensive question generation plan.
            Based on the requirements, create a detailed strategy for generating questions that:
            1. Follow Bloom's taxonomy distribution
            2. Meet difficulty requirements
            3. Cover course and program outcomes
            4. Maintain appropriate similarity thresholds
            
            Return a JSON plan with question specifications."""),
            ("human", f"""Create a question generation plan for:
            Subject: {request.subject}
            Topic: {request.topic}
            Total Questions: {request.total_questions}
            Question Types: {request.question_types}
            Difficulty Distribution: {request.difficulty_distribution}
            Bloom's Distribution: {request.blooms_distribution}
            Course Outcomes: {request.course_outcomes}
            Program Outcomes: {request.program_outcomes}
            Include Equations: {request.include_equations}
            """)
        ])
        
        response = await self.llm.ainvoke(plan_prompt.format_messages())
        # Process the plan (simplified for now)
        state.validation_results["plan"] = response.content
        
        return state

    async def _generate_question(self, state: QuestionGeneratorState) -> QuestionGeneratorState:
        """Generate a single question based on current requirements."""
        request = state.request
        current_index = state.current_question_index
        
        if current_index >= request.total_questions:
            return state
        
        # Determine question type for current index
        question_type = self._get_next_question_type(request, current_index)
        difficulty = self._get_next_difficulty(request, current_index)
        blooms_level = self._get_next_blooms_level(request, current_index)
        
        # Generate question based on type
        if question_type == QuestionType.MULTIPLE_CHOICE:
            question = await self._generate_mcq(request, difficulty, blooms_level)
        elif question_type == QuestionType.TRUE_FALSE:
            question = await self._generate_true_false(request, difficulty, blooms_level)
        elif question_type == QuestionType.SHORT_ANSWER:
            question = await self._generate_short_answer(request, difficulty, blooms_level)
        elif question_type == QuestionType.LONG_ANSWER:
            question = await self._generate_long_answer(request, difficulty, blooms_level)
        else:
            question = await self._generate_subjective(request, difficulty, blooms_level)
        
        # Handle equations if needed
        if request.include_equations and self._should_include_equation(question_type, difficulty):
            question = await self.equation_handler.add_equation_to_question(question)
        
        state.generated_questions.append(question)
        state.current_question_index += 1
        
        return state

    async def _generate_mcq(self, request: QuestionGenerationRequest, 
                           difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        """Generate a multiple choice question."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", f"""You are an expert educator creating multiple choice questions.
            Generate a high-quality MCQ that:
            - Tests {blooms_level.value} level of Bloom's taxonomy
            - Has {difficulty.value} difficulty
            - Is relevant to the topic and syllabus
            - Has 4 options with only one correct answer
            - Includes a clear explanation
            
            Return the response in JSON format with fields:
            question_text, options (array of 4), correct_answer (index 0-3), explanation"""),
            ("human", f"""Generate an MCQ for:
            Subject: {request.subject}
            Topic: {request.topic}
            Syllabus: {request.syllabus_content[:500]}...
            Difficulty: {difficulty.value}
            Bloom's Level: {blooms_level.value}
            """)
        ])
        
        response = await self.llm.ainvoke(prompt.format_messages())
        
        try:
            question_data = json.loads(response.content)
            question = Question(
                id=str(uuid.uuid4()),
                question_text=question_data["question_text"],
                question_type=QuestionType.MULTIPLE_CHOICE,
                difficulty=difficulty,
                blooms_level=blooms_level,
                marks=request.marks_per_question.get(QuestionType.MULTIPLE_CHOICE, 2),
                options=question_data["options"],
                correct_answer=str(question_data["correct_answer"]),
                explanation=question_data.get("explanation", "")
            )
            return question
        except:
            # Fallback question if JSON parsing fails
            return self._create_fallback_mcq(request, difficulty, blooms_level)

    async def _generate_subjective(self, request: QuestionGenerationRequest,
                                 difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        """Generate a subjective question."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", f"""You are an expert educator creating subjective questions.
            Generate a high-quality subjective question that:
            - Tests {blooms_level.value} level of Bloom's taxonomy
            - Has {difficulty.value} difficulty
            - Requires analytical thinking and detailed explanation
            - Is relevant to the topic and syllabus
            
            Return the response in JSON format with fields:
            question_text, explanation, suggested_answer_points"""),
            ("human", f"""Generate a subjective question for:
            Subject: {request.subject}
            Topic: {request.topic}
            Syllabus: {request.syllabus_content[:500]}...
            Difficulty: {difficulty.value}
            Bloom's Level: {blooms_level.value}
            """)
        ])
        
        response = await self.llm.ainvoke(prompt.format_messages())
        
        try:
            question_data = json.loads(response.content)
            question = Question(
                id=str(uuid.uuid4()),
                question_text=question_data["question_text"],
                question_type=QuestionType.SUBJECTIVE,
                difficulty=difficulty,
                blooms_level=blooms_level,
                marks=request.marks_per_question.get(QuestionType.SUBJECTIVE, 10),
                explanation=question_data.get("explanation", ""),
                correct_answer=question_data.get("suggested_answer_points", [])
            )
            return question
        except:
            return self._create_fallback_subjective(request, difficulty, blooms_level)

    async def _generate_true_false(self, request: QuestionGenerationRequest,
                                 difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        """Generate a true/false question."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", f"""Create a true/false question that tests {blooms_level.value} level understanding 
            with {difficulty.value} difficulty. Return JSON with: question_text, correct_answer (true/false), explanation"""),
            ("human", f"""Topic: {request.topic}, Syllabus: {request.syllabus_content[:300]}""")
        ])
        
        response = await self.llm.ainvoke(prompt.format_messages())
        
        try:
            question_data = json.loads(response.content)
            return Question(
                id=str(uuid.uuid4()),
                question_text=question_data["question_text"],
                question_type=QuestionType.TRUE_FALSE,
                difficulty=difficulty,
                blooms_level=blooms_level,
                marks=request.marks_per_question.get(QuestionType.TRUE_FALSE, 1),
                correct_answer=str(question_data["correct_answer"]).lower(),
                explanation=question_data.get("explanation", "")
            )
        except:
            return self._create_fallback_true_false(request, difficulty, blooms_level)

    async def _generate_short_answer(self, request: QuestionGenerationRequest,
                                   difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        """Generate a short answer question."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", f"""Create a short answer question (2-3 sentences expected) that tests {blooms_level.value} 
            level with {difficulty.value} difficulty. Return JSON with: question_text, key_points, explanation"""),
            ("human", f"""Topic: {request.topic}, Syllabus: {request.syllabus_content[:300]}""")
        ])
        
        response = await self.llm.ainvoke(prompt.format_messages())
        
        try:
            question_data = json.loads(response.content)
            return Question(
                id=str(uuid.uuid4()),
                question_text=question_data["question_text"],
                question_type=QuestionType.SHORT_ANSWER,
                difficulty=difficulty,
                blooms_level=blooms_level,
                marks=request.marks_per_question.get(QuestionType.SHORT_ANSWER, 5),
                correct_answer=question_data.get("key_points", []),
                explanation=question_data.get("explanation", "")
            )
        except:
            return self._create_fallback_short_answer(request, difficulty, blooms_level)

    async def _generate_long_answer(self, request: QuestionGenerationRequest,
                                  difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        """Generate a long answer question."""
        prompt = ChatPromptTemplate.from_messages([
            ("system", f"""Create a comprehensive long answer question that tests {blooms_level.value} 
            level with {difficulty.value} difficulty. Return JSON with: question_text, answer_structure, explanation"""),
            ("human", f"""Topic: {request.topic}, Syllabus: {request.syllabus_content[:300]}""")
        ])
        
        response = await self.llm.ainvoke(prompt.format_messages())
        
        try:
            question_data = json.loads(response.content)
            return Question(
                id=str(uuid.uuid4()),
                question_text=question_data["question_text"],
                question_type=QuestionType.LONG_ANSWER,
                difficulty=difficulty,
                blooms_level=blooms_level,
                marks=request.marks_per_question.get(QuestionType.LONG_ANSWER, 15),
                correct_answer=question_data.get("answer_structure", []),
                explanation=question_data.get("explanation", "")
            )
        except:
            return self._create_fallback_long_answer(request, difficulty, blooms_level)

    async def _validate_question(self, state: QuestionGeneratorState) -> QuestionGeneratorState:
        """Validate the generated question for quality and requirements."""
        if not state.generated_questions:
            return state
            
        current_question = state.generated_questions[-1]
        
        # Basic validation
        validation_score = 0
        issues = []
        
        # Check question text quality
        if len(current_question.question_text) > 10:
            validation_score += 25
        else:
            issues.append("Question text too short")
        
        # Check if it matches the required type
        if current_question.question_type in state.request.question_types:
            validation_score += 25
        else:
            issues.append("Question type mismatch")
        
        # Check for appropriate options (MCQ)
        if current_question.question_type == QuestionType.MULTIPLE_CHOICE:
            if current_question.options and len(current_question.options) == 4:
                validation_score += 25
            else:
                issues.append("Invalid MCQ options")
        else:
            validation_score += 25
        
        # Check explanation quality
        if current_question.explanation and len(current_question.explanation) > 20:
            validation_score += 25
        else:
            issues.append("Poor or missing explanation")
        
        state.validation_results[current_question.id] = {
            "score": validation_score,
            "issues": issues,
            "passed": validation_score >= 75
        }
        
        return state

    async def _check_similarity(self, state: QuestionGeneratorState) -> QuestionGeneratorState:
        """Check similarity with previous papers and existing questions."""
        if not state.generated_questions:
            return state
        
        current_question = state.generated_questions[-1]
        
        # Check similarity with previous papers
        if state.request.previous_papers:
            similarity_score = await self.similarity_analyzer.calculate_similarity(
                current_question.question_text,
                state.request.previous_papers
            )
            state.similarity_scores[current_question.id] = similarity_score
        
        return state

    def _should_regenerate(self, state: QuestionGeneratorState) -> str:
        """Determine if question should be regenerated based on validation and similarity."""
        if not state.generated_questions:
            return "next_question"
        
        current_question = state.generated_questions[-1]
        
        # Check validation results
        validation = state.validation_results.get(current_question.id, {})
        if not validation.get("passed", False):
            # Remove the failed question and regenerate
            state.generated_questions.pop()
            return "regenerate"
        
        # Check similarity threshold
        similarity_score = state.similarity_scores.get(current_question.id, 0)
        if similarity_score > state.request.similarity_threshold:
            # Remove the similar question and regenerate
            state.generated_questions.pop()
            return "regenerate"
        
        # Check if we need more questions
        if len(state.generated_questions) < state.request.total_questions:
            return "next_question"
        
        return "continue"

    async def _finalize_paper(self, state: QuestionGeneratorState) -> QuestionGeneratorState:
        """Create the final question paper."""
        total_marks = sum(q.marks for q in state.generated_questions)
        
        header_info = {
            "university_name": state.request.university_name,
            "department": state.request.department,
            "course_name": state.request.course_name,
            "course_code": state.request.course_code,
            "exam_duration": state.request.exam_duration,
            "max_marks": str(total_marks),
            "subject": state.request.subject,
            "topic": state.request.topic
        }
        
        question_paper = QuestionPaper(
            id=str(uuid.uuid4()),
            title=f"{state.request.course_name} - {state.request.subject}",
            header_info=header_info,
            questions=state.generated_questions,
            total_marks=total_marks,
            generated_at=datetime.now().isoformat(),
            similarity_scores=state.similarity_scores
        )
        
        state.final_paper = question_paper
        return state

    # Utility methods
    def _get_next_question_type(self, request: QuestionGenerationRequest, index: int) -> QuestionType:
        """Determine the question type for the current index."""
        # Simple round-robin distribution
        types = request.question_types
        return types[index % len(types)]

    def _get_next_difficulty(self, request: QuestionGenerationRequest, index: int) -> DifficultyLevel:
        """Determine the difficulty for the current index."""
        # Distribute based on difficulty_distribution
        difficulties = []
        for difficulty, count in request.difficulty_distribution.items():
            difficulties.extend([difficulty] * count)
        
        if index < len(difficulties):
            return difficulties[index]
        return DifficultyLevel.MEDIUM

    def _get_next_blooms_level(self, request: QuestionGenerationRequest, index: int) -> BloomsTaxonomy:
        """Determine the Bloom's level for the current index."""
        # Distribute based on blooms_distribution
        blooms_levels = []
        for level, count in request.blooms_distribution.items():
            blooms_levels.extend([level] * count)
        
        if index < len(blooms_levels):
            return blooms_levels[index]
        return BloomsTaxonomy.UNDERSTAND

    def _should_include_equation(self, question_type: QuestionType, difficulty: DifficultyLevel) -> bool:
        """Determine if equation should be included based on question type and difficulty."""
        if question_type in [QuestionType.MULTIPLE_CHOICE, QuestionType.SHORT_ANSWER, QuestionType.LONG_ANSWER]:
            return difficulty in [DifficultyLevel.MEDIUM, DifficultyLevel.HARD]
        return False

    # Fallback question creators
    def _create_fallback_mcq(self, request: QuestionGenerationRequest, 
                           difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        return Question(
            id=str(uuid.uuid4()),
            question_text=f"What is the main concept related to {request.topic}?",
            question_type=QuestionType.MULTIPLE_CHOICE,
            difficulty=difficulty,
            blooms_level=blooms_level,
            marks=2,
            options=["Option A", "Option B", "Option C", "Option D"],
            correct_answer="0",
            explanation="This is a fallback question."
        )

    def _create_fallback_subjective(self, request: QuestionGenerationRequest,
                                  difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        return Question(
            id=str(uuid.uuid4()),
            question_text=f"Explain the key concepts and applications of {request.topic} in detail.",
            question_type=QuestionType.SUBJECTIVE,
            difficulty=difficulty,
            blooms_level=blooms_level,
            marks=10,
            explanation="This is a fallback subjective question."
        )

    def _create_fallback_true_false(self, request: QuestionGenerationRequest,
                                  difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        return Question(
            id=str(uuid.uuid4()),
            question_text=f"{request.topic} is an important concept in {request.subject}.",
            question_type=QuestionType.TRUE_FALSE,
            difficulty=difficulty,
            blooms_level=blooms_level,
            marks=1,
            correct_answer="true",
            explanation="This is a fallback true/false question."
        )

    def _create_fallback_short_answer(self, request: QuestionGenerationRequest,
                                    difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        return Question(
            id=str(uuid.uuid4()),
            question_text=f"Briefly describe {request.topic}.",
            question_type=QuestionType.SHORT_ANSWER,
            difficulty=difficulty,
            blooms_level=blooms_level,
            marks=5,
            explanation="This is a fallback short answer question."
        )

    def _create_fallback_long_answer(self, request: QuestionGenerationRequest,
                                   difficulty: DifficultyLevel, blooms_level: BloomsTaxonomy) -> Question:
        return Question(
            id=str(uuid.uuid4()),
            question_text=f"Provide a comprehensive analysis of {request.topic} including its principles, applications, and significance.",
            question_type=QuestionType.LONG_ANSWER,
            difficulty=difficulty,
            blooms_level=blooms_level,
            marks=15,
            explanation="This is a fallback long answer question."
        )

    # Public API methods
    async def generate_question_paper(self, request: QuestionGenerationRequest) -> QuestionPaper:
        """Generate a complete question paper using the LangGraph workflow."""
        initial_state = QuestionGeneratorState(request=request)
        
        # Run the graph
        final_state = await self.graph.ainvoke(initial_state)
        
        if final_state.final_paper:
            return final_state.final_paper
        else:
            raise Exception("Failed to generate question paper")

    async def generate_alternative_question(self, request: AlternativeQuestionRequest) -> Question:
        """Generate an alternative for a specific question."""
        # Create a simplified request for single question generation
        simple_request = QuestionGenerationRequest(
            subject=request.context.subject,
            topic=request.context.topic,
            syllabus_content=request.context.syllabus_content,
            total_questions=1,
            question_types=[request.original_question.question_type],
            difficulty_distribution={request.original_question.difficulty: 1},
            blooms_distribution={request.original_question.blooms_level: 1},
            university_name=request.context.university_name,
            department=request.context.department,
            course_name=request.context.course_name,
            course_code=request.context.course_code,
            exam_duration=request.context.exam_duration,
            max_marks=request.original_question.marks
        )
        
        # Generate alternative using the appropriate method
        if request.original_question.question_type == QuestionType.MULTIPLE_CHOICE:
            alternative = await self._generate_mcq(
                simple_request, 
                request.original_question.difficulty,
                request.original_question.blooms_level
            )
        elif request.original_question.question_type == QuestionType.TRUE_FALSE:
            alternative = await self._generate_true_false(
                simple_request,
                request.original_question.difficulty,
                request.original_question.blooms_level
            )
        elif request.original_question.question_type == QuestionType.SHORT_ANSWER:
            alternative = await self._generate_short_answer(
                simple_request,
                request.original_question.difficulty,
                request.original_question.blooms_level
            )
        elif request.original_question.question_type == QuestionType.LONG_ANSWER:
            alternative = await self._generate_long_answer(
                simple_request,
                request.original_question.difficulty,
                request.original_question.blooms_level
            )
        else:
            alternative = await self._generate_subjective(
                simple_request,
                request.original_question.difficulty,
                request.original_question.blooms_level
            )
        
        return alternative

    async def calculate_similarity(self, question: str, previous_papers: List[str]) -> float:
        """Calculate similarity between a question and previous papers."""
        return await self.similarity_analyzer.calculate_similarity(question, previous_papers)
