# IntelliExam AI Backend

This is the AI backend service for IntelliExam, a smart question paper generator for university teachers. The backend uses LangGraph to orchestrate intelligent question generation workflows.

## Features

- **Multiple Question Types**: MCQ, True/False, Short Answer, Long Answer, Subjective
- **Bloom's Taxonomy Integration**: Questions mapped to cognitive levels
- **Difficulty Control**: Easy, Medium, Hard difficulty levels
- **Similarity Analysis**: Control similarity with previous papers
- **Equation Support**: Mathematical equations in LaTeX format
- **PDF Export**: Professional question paper formatting
- **Alternative Generation**: Generate alternative questions on demand

## Technology Stack

- **LangGraph**: Workflow orchestration for AI question generation
- **FastAPI**: High-performance web framework
- **LangChain**: LLM integration and prompt management
- **OpenAI GPT-4**: Primary language model for question generation
- **Pydantic**: Data validation and serialization
- **ReportLab**: PDF generation
- **scikit-learn**: Text similarity analysis
- **SymPy**: Mathematical equation handling

## Quick Start

1. **Install dependencies:**
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env file and add your OpenAI API key
   ```

3. **Run the server:**
   ```bash
   python main.py
   ```

The server will start on `http://localhost:8001`

## API Endpoints

### Generate Questions
```http
POST /generate-questions
```

Generate a complete question paper based on specifications.

**Request Body:**
```json
{
  "subject": "Computer Science",
  "topic": "Data Structures",
  "syllabus_content": "Arrays, Linked Lists, Stacks, Queues...",
  "total_questions": 10,
  "question_types": ["multiple_choice", "short_answer", "long_answer"],
  "difficulty_distribution": {
    "easy": 3,
    "medium": 4,
    "hard": 3
  },
  "blooms_distribution": {
    "remember": 2,
    "understand": 3,
    "apply": 3,
    "analyze": 2
  },
  "course_outcomes": ["CO1", "CO2"],
  "program_outcomes": ["PO1", "PO2"],
  "similarity_threshold": 70,
  "previous_papers": [],
  "include_equations": true,
  "marks_per_question": {
    "multiple_choice": 2,
    "short_answer": 5,
    "long_answer": 10
  },
  "university_name": "ABC University",
  "department": "Computer Science",
  "course_name": "Data Structures and Algorithms",
  "course_code": "CS201",
  "exam_duration": "3 Hours",
  "max_marks": 100
}
```

### Generate Alternative Question
```http
POST /generate-alternative
```

Generate an alternative for a specific question.

### Export to PDF
```http
POST /export-pdf
```

Export question paper to PDF format.

### Analyze Similarity
```http
POST /analyze-similarity
```

Check similarity between questions and previous papers.

## Project Structure

```
ai_backend/
├── main.py                 # FastAPI application entry point
├── models.py               # Pydantic data models
├── question_generator.py   # LangGraph-based question generation
├── similarity_analyzer.py  # Text similarity analysis
├── equation_handler.py     # Mathematical equation processing
├── pdf_exporter.py         # PDF generation functionality
├── requirements.txt        # Python dependencies
├── setup.sh               # Setup script
├── .env.example           # Environment configuration template
└── README.md              # This file
```

## LangGraph Workflow

The question generation uses a sophisticated LangGraph workflow:

1. **Plan Generation**: Analyze requirements and create generation strategy
2. **Question Generation**: Generate questions based on type and difficulty
3. **Validation**: Validate question quality and requirements
4. **Similarity Check**: Ensure uniqueness compared to previous papers
5. **Finalization**: Create final question paper with proper formatting

## Environment Variables

```bash
# Required
OPENAI_API_KEY=your_openai_api_key_here

# Optional
ANTHROPIC_API_KEY=your_anthropic_api_key_here
DATABASE_URL=sqlite:///./ai_backend.db
AI_BACKEND_HOST=0.0.0.0
AI_BACKEND_PORT=8001
ENABLE_EQUATION_GENERATION=true
ENABLE_SIMILARITY_ANALYSIS=true
MAX_QUESTIONS_PER_PAPER=50
DEFAULT_SIMILARITY_THRESHOLD=70
```

## Integration with Django Backend

The AI backend is designed to work with the Django SaaS backend:

```python
# Example integration from Django
import httpx

async def generate_questions(request_data):
    async with httpx.AsyncClient() as client:
        response = await client.post(
            "http://localhost:8001/generate-questions",
            json=request_data
        )
        return response.json()
```

## Bloom's Taxonomy Integration

Questions are mapped to Bloom's taxonomy levels:

- **Remember**: Recall facts and basic concepts
- **Understand**: Explain ideas or concepts
- **Apply**: Use information in new situations
- **Analyze**: Draw connections among ideas
- **Evaluate**: Justify a stand or decision
- **Create**: Produce new or original work

## Equation Handling

The system supports mathematical equations in LaTeX format:

- Automatic equation generation based on subject matter
- Integration with question text
- Support for various mathematical domains (calculus, algebra, physics, etc.)
- LaTeX rendering in PDF exports

## Similarity Analysis

Advanced similarity checking:

- TF-IDF vectorization
- Cosine similarity calculation
- Configurable similarity thresholds
- Batch analysis for multiple questions

## PDF Export Features

Professional question paper formatting:

- University header information
- Proper question numbering
- Answer key generation
- Custom styling and layouts
- Support for equations and special formatting

## Development

### Running Tests
```bash
# Install test dependencies
pip install pytest pytest-asyncio

# Run tests
pytest
```

### Adding New Question Types

1. Update the `QuestionType` enum in `models.py`
2. Add generation logic in `question_generator.py`
3. Update PDF formatting in `pdf_exporter.py`

### Extending LangGraph Workflow

The workflow is highly extensible. Add new nodes:

```python
# In question_generator.py
workflow.add_node("new_validation_step", self._new_validation_step)
workflow.add_edge("validate_question", "new_validation_step")
```

## Troubleshooting

### Common Issues

1. **API Key Error**: Ensure OpenAI API key is set in `.env`
2. **Import Errors**: Install all requirements: `pip install -r requirements.txt`
3. **Port Conflicts**: Change port in `.env` if 8001 is occupied
4. **PDF Generation Issues**: Ensure ReportLab is properly installed

### Logging

Enable detailed logging:

```bash
export LOG_LEVEL=DEBUG
python main.py
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For issues and questions, please create an issue in the repository or contact the development team.
