"""
Sample API client for IntelliExam AI Backend
Demonstrates how to interact with the AI backend API
"""
import asyncio
import httpx
import json
from typing import Dict, Any

# Sample request data
SAMPLE_REQUEST = {
    "subject": "Computer Science",
    "topic": "Data Structures and Algorithms",
    "syllabus_content": """
    Introduction to Data Structures:
    - Arrays and their operations
    - Linked Lists (Singly, Doubly, Circular)
    - Stacks and Queues
    - Trees (Binary Trees, BST, AVL)
    - Graphs and Graph Algorithms
    - Sorting Algorithms (Bubble, Selection, Insertion, Merge, Quick)
    - Searching Algorithms (Linear, Binary)
    - Hashing and Hash Tables
    - Dynamic Programming
    - Time and Space Complexity Analysis
    """,
    "total_questions": 5,
    "question_types": ["multiple_choice", "short_answer", "long_answer"],
    "difficulty_distribution": {
        "easy": 1,
        "medium": 2,
        "hard": 2
    },
    "blooms_distribution": {
        "remember": 1,
        "understand": 2,
        "apply": 1,
        "analyze": 1
    },
    "course_outcomes": [
        "CO1: Understand fundamental data structures",
        "CO2: Implement basic algorithms",
        "CO3: Analyze time and space complexity"
    ],
    "program_outcomes": [
        "PO1: Engineering Knowledge",
        "PO2: Problem Analysis"
    ],
    "similarity_threshold": 70.0,
    "previous_papers": [],
    "include_equations": True,
    "marks_per_question": {
        "multiple_choice": 2,
        "short_answer": 5,
        "long_answer": 10
    },
    "university_name": "ABC University",
    "department": "Computer Science and Engineering",
    "course_name": "Data Structures and Algorithms",
    "course_code": "CS201",
    "exam_duration": "3 Hours",
    "max_marks": 100
}

class IntelliExamClient:
    def __init__(self, base_url: str = "http://localhost:8001"):
        self.base_url = base_url
        
    async def test_connection(self) -> bool:
        """Test if the AI backend is running."""
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(f"{self.base_url}/")
                return response.status_code == 200
        except:
            return False
    
    async def generate_questions(self, request_data: Dict[str, Any]) -> Dict[str, Any]:
        """Generate a question paper."""
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"{self.base_url}/generate-questions",
                json=request_data
            )
            response.raise_for_status()
            return response.json()
    
    async def generate_alternative(self, alternative_request: Dict[str, Any]) -> Dict[str, Any]:
        """Generate an alternative question."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/generate-alternative",
                json=alternative_request
            )
            response.raise_for_status()
            return response.json()
    
    async def analyze_similarity(self, question: str, previous_papers: list) -> Dict[str, Any]:
        """Analyze similarity of a question."""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/analyze-similarity",
                params={"question": question, "previous_papers": previous_papers}
            )
            response.raise_for_status()
            return response.json()
    
    async def export_pdf(self, question_paper: Dict[str, Any], 
                        include_answers: bool = False) -> bytes:
        """Export question paper to PDF."""
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/export-pdf",
                json=question_paper,
                params={
                    "include_answers": include_answers,
                    "include_explanations": False
                }
            )
            response.raise_for_status()
            return response.content

async def demo_api_usage():
    """Demonstrate API usage."""
    client = IntelliExamClient()
    
    print("🔍 Testing connection to AI backend...")
    if not await client.test_connection():
        print("❌ AI backend is not running. Please start it with: python main.py")
        return
    
    print("✅ Connection successful!")
    print("\n📝 Generating sample question paper...")
    
    try:
        # Generate questions
        question_paper = await client.generate_questions(SAMPLE_REQUEST)
        
        print(f"✅ Generated {len(question_paper['questions'])} questions")
        print(f"📊 Total marks: {question_paper['total_marks']}")
        
        # Display questions
        for i, question in enumerate(question_paper['questions'], 1):
            print(f"\nQ{i}. [{question['marks']} marks] ({question['difficulty']}, {question['blooms_level']})")
            print(f"    {question['question_text'][:100]}...")
            
            if question['question_type'] == 'multiple_choice' and question.get('options'):
                for j, option in enumerate(question['options']):
                    print(f"    {chr(65+j)}) {option}")
        
        # Test similarity analysis
        print("\n🔍 Testing similarity analysis...")
        if question_paper['questions']:
            first_question = question_paper['questions'][0]['question_text']
            similarity_result = await client.analyze_similarity(
                first_question, 
                ["What is the time complexity of binary search?"]
            )
            print(f"✅ Similarity score: {similarity_result['similarity_percentage']:.1f}%")
        
        # Test PDF export
        print("\n📄 Testing PDF export...")
        pdf_content = await client.export_pdf(question_paper, include_answers=True)
        
        # Save PDF
        with open("sample_question_paper.pdf", "wb") as f:
            f.write(pdf_content)
        print(f"✅ PDF exported successfully ({len(pdf_content)} bytes)")
        print("📁 Saved as: sample_question_paper.pdf")
        
        # Test alternative question generation
        if question_paper['questions']:
            print("\n🔄 Testing alternative question generation...")
            original_question = question_paper['questions'][0]
            alternative_request = {
                "original_question_id": original_question['id'],
                "original_question": original_question,
                "context": SAMPLE_REQUEST,
                "reason": "Question too difficult for target audience"
            }
            
            alternative = await client.generate_alternative(alternative_request)
            print(f"✅ Generated alternative question:")
            print(f"    Original: {original_question['question_text'][:80]}...")
            print(f"    Alternative: {alternative['question_text'][:80]}...")
        
        print("\n🎉 All API endpoints tested successfully!")
        
    except httpx.HTTPStatusError as e:
        print(f"❌ HTTP Error: {e.response.status_code} - {e.response.text}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")

async def main():
    """Main function."""
    print("🚀 IntelliExam AI Backend API Demo")
    print("=" * 50)
    print("This script demonstrates how to use the AI backend API.")
    print("Make sure the AI backend is running on localhost:8001")
    print("=" * 50)
    
    await demo_api_usage()

if __name__ == "__main__":
    asyncio.run(main())
