from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
import uvicorn
import os
from dotenv import load_dotenv

from question_generator import QuestionGeneratorGraph
from pdf_exporter import PDFExporter
from models import (
    QuestionGenerationRequest,
    QuestionPaper,
    AlternativeQuestionRequest
)

load_dotenv()

app = FastAPI(title="IntelliExam AI Backend", version="1.0.0")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the question generator and PDF exporter
question_generator = QuestionGeneratorGraph()
pdf_exporter = PDFExporter()

@app.get("/")
async def root():
    return {"message": "IntelliExam AI Backend is running!"}

@app.post("/generate-questions", response_model=QuestionPaper)
async def generate_questions(request: QuestionGenerationRequest):
    """Generate a complete question paper based on the provided parameters."""
    try:
        question_paper = await question_generator.generate_question_paper(request)
        return question_paper
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-alternative")
async def generate_alternative_question(request: AlternativeQuestionRequest):
    """Generate an alternative question for a specific question."""
    try:
        alternative = await question_generator.generate_alternative_question(request)
        return alternative
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze-similarity")
async def analyze_similarity(question: str, previous_papers: List[str]):
    """Analyze similarity between a question and previous papers."""
    try:
        similarity_score = await question_generator.calculate_similarity(question, previous_papers)
        return {"similarity_percentage": similarity_score}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/export-pdf")
async def export_question_paper_pdf(
    question_paper: QuestionPaper,
    include_answers: bool = False,
    include_explanations: bool = False
):
    """Export question paper to PDF format."""
    try:
        pdf_bytes = await pdf_exporter.export_question_paper(
            question_paper, 
            include_answers, 
            include_explanations
        )
        
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=question_paper_{question_paper.id}.pdf"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ai_backend"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)