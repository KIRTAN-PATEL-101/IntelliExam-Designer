# Django Integration Example for IntelliExam AI Backend
# Add this to your Django app's views.py

import httpx
import asyncio
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

AI_BACKEND_URL = "http://localhost:8001"

@csrf_exempt
@require_http_methods(["POST"])
def generate_question_paper(request):
    """
    Django view to generate question paper using AI backend
    """
    try:
        # Parse request data
        request_data = json.loads(request.body)
        
        # Call AI backend
        async def call_ai_backend():
            async with httpx.AsyncClient(timeout=120.0) as client:
                response = await client.post(
                    f"{AI_BACKEND_URL}/generate-questions",
                    json=request_data
                )
                response.raise_for_status()
                return response.json()
        
        # Run async function
        question_paper = asyncio.run(call_ai_backend())
        
        return JsonResponse({
            'success': True,
            'question_paper': question_paper
        })
        
    except httpx.HTTPStatusError as e:
        return JsonResponse({
            'success': False,
            'error': f'AI Backend Error: {e.response.status_code}'
        }, status=500)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def export_question_paper_pdf(request):
    """
    Django view to export question paper as PDF
    """
    try:
        request_data = json.loads(request.body)
        question_paper = request_data.get('question_paper')
        include_answers = request_data.get('include_answers', False)
        
        async def call_ai_backend():
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{AI_BACKEND_URL}/export-pdf",
                    json=question_paper,
                    params={'include_answers': include_answers}
                )
                response.raise_for_status()
                return response.content
        
        pdf_content = asyncio.run(call_ai_backend())
        
        # Return PDF as HTTP response
        response = HttpResponse(pdf_content, content_type='application/pdf')
        response['Content-Disposition'] = f'attachment; filename="question_paper.pdf"'
        return response
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def generate_alternative_question(request):
    """
    Django view to generate alternative question
    """
    try:
        request_data = json.loads(request.body)
        
        async def call_ai_backend():
            async with httpx.AsyncClient(timeout=60.0) as client:
                response = await client.post(
                    f"{AI_BACKEND_URL}/generate-alternative",
                    json=request_data
                )
                response.raise_for_status()
                return response.json()
        
        alternative_question = asyncio.run(call_ai_backend())
        
        return JsonResponse({
            'success': True,
            'alternative_question': alternative_question
        })
        
    except Exception as e:
        return JsonResponse({
            'success': False,
            'error': str(e)
        }, status=500)

# Add these to your urls.py:
"""
from django.urls import path
from . import views

urlpatterns = [
    path('api/generate-questions/', views.generate_question_paper, name='generate_questions'),
    path('api/export-pdf/', views.export_question_paper_pdf, name='export_pdf'),
    path('api/generate-alternative/', views.generate_alternative_question, name='generate_alternative'),
]
"""

# Example usage from Django templates or frontend:
"""
// JavaScript example for calling from frontend
async function generateQuestions(requestData) {
    const response = await fetch('/api/generate-questions/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(requestData)
    });
    
    const result = await response.json();
    
    if (result.success) {
        return result.question_paper;
    } else {
        throw new Error(result.error);
    }
}

async function exportToPDF(questionPaper, includeAnswers = false) {
    const response = await fetch('/api/export-pdf/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({
            question_paper: questionPaper,
            include_answers: includeAnswers
        })
    });
    
    if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'question_paper.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
    }
}
"""
