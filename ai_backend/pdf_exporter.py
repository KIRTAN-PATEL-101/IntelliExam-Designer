import io
import os
from typing import List, Dict
from datetime import datetime
from reportlab.lib.pagesizes import letter, A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT, TA_JUSTIFY
from reportlab.pdfgen import canvas
from reportlab.platypus.tableofcontents import TableOfContents

from models import QuestionPaper, Question, QuestionType

class PDFExporter:
    def __init__(self):
        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Setup custom styles for the PDF."""
        # Header style
        self.styles.add(ParagraphStyle(
            name='CustomHeader',
            parent=self.styles['Heading1'],
            fontSize=16,
            spaceAfter=20,
            alignment=TA_CENTER,
            textColor=colors.darkblue
        ))
        
        # University name style
        self.styles.add(ParagraphStyle(
            name='UniversityName',
            parent=self.styles['Heading1'],
            fontSize=18,
            spaceAfter=10,
            alignment=TA_CENTER,
            textColor=colors.black,
            fontName='Helvetica-Bold'
        ))
        
        # Question style
        self.styles.add(ParagraphStyle(
            name='QuestionText',
            parent=self.styles['Normal'],
            fontSize=11,
            spaceAfter=12,
            spaceBefore=8,
            leftIndent=20,
            fontName='Helvetica'
        ))
        
        # Question number style
        self.styles.add(ParagraphStyle(
            name='QuestionNumber',
            parent=self.styles['Normal'],
            fontSize=12,
            spaceAfter=5,
            fontName='Helvetica-Bold'
        ))
        
        # Options style for MCQs
        self.styles.add(ParagraphStyle(
            name='OptionText',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=4,
            leftIndent=40,
            fontName='Helvetica'
        ))
        
        # Instructions style
        self.styles.add(ParagraphStyle(
            name='Instructions',
            parent=self.styles['Normal'],
            fontSize=10,
            spaceAfter=15,
            spaceBefore=10,
            fontName='Helvetica-Oblique',
            textColor=colors.darkgrey
        ))

    async def export_question_paper(self, question_paper: QuestionPaper, 
                                  include_answers: bool = False,
                                  include_explanations: bool = False) -> bytes:
        """Export question paper to PDF and return as bytes."""
        
        # Create a BytesIO buffer
        buffer = io.BytesIO()
        
        # Create the PDF document
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        # Build the story (content)
        story = []
        
        # Add header
        story.extend(self._create_header(question_paper))
        
        # Add instructions
        story.extend(self._create_instructions(question_paper))
        
        # Add questions
        story.extend(self._create_questions_section(
            question_paper.questions, 
            include_answers, 
            include_explanations
        ))
        
        # Add footer information
        if include_answers:
            story.append(PageBreak())
            story.extend(self._create_answer_key(question_paper.questions))
        
        # Build the PDF
        doc.build(story)
        
        # Get the PDF bytes
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes

    def _create_header(self, question_paper: QuestionPaper) -> List:
        """Create the header section of the question paper."""
        story = []
        header_info = question_paper.header_info
        
        # University name
        story.append(Paragraph(
            header_info.get('university_name', 'University Name'),
            self.styles['UniversityName']
        ))
        
        # Department
        story.append(Paragraph(
            header_info.get('department', 'Department Name'),
            self.styles['CustomHeader']
        ))
        
        # Course information table
        course_data = [
            ['Course Name:', header_info.get('course_name', 'Course Name'),
             'Course Code:', header_info.get('course_code', 'COURSE-001')],
            ['Subject:', header_info.get('subject', 'Subject'),
             'Topic:', header_info.get('topic', 'Topic')],
            ['Duration:', header_info.get('exam_duration', '3 Hours'),
             'Max Marks:', header_info.get('max_marks', '100')],
            ['Date:', datetime.now().strftime('%d/%m/%Y'),
             'Time:', '___________']
        ]
        
        course_table = Table(course_data, colWidths=[1.5*inch, 2*inch, 1.5*inch, 1.5*inch])
        course_table.setStyle(TableStyle([
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (0, -1), 'Helvetica-Bold'),
            ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 10),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(course_table)
        story.append(Spacer(1, 20))
        
        return story

    def _create_instructions(self, question_paper: QuestionPaper) -> List:
        """Create the instructions section."""
        story = []
        
        instructions_text = f"""
        <b>INSTRUCTIONS:</b><br/>
        1. This question paper contains {len(question_paper.questions)} questions.<br/>
        2. Total marks: {question_paper.total_marks}<br/>
        3. Answer all questions.<br/>
        4. Read each question carefully before answering.<br/>
        5. Write your answers clearly and legibly.<br/>
        6. Use of calculators is permitted where applicable.<br/>
        """
        
        story.append(Paragraph(instructions_text, self.styles['Instructions']))
        story.append(Spacer(1, 15))
        
        return story

    def _create_questions_section(self, questions: List[Question], 
                                include_answers: bool = False,
                                include_explanations: bool = False) -> List:
        """Create the questions section."""
        story = []
        
        for i, question in enumerate(questions, 1):
            # Question number and marks
            q_header = f"Q{i}. [{question.marks} Mark{'s' if question.marks > 1 else ''}]"
            if question.difficulty:
                q_header += f" (Difficulty: {question.difficulty.value.title()})"
            if question.blooms_level:
                q_header += f" (Bloom's: {question.blooms_level.value.title()})"
            
            story.append(Paragraph(q_header, self.styles['QuestionNumber']))
            
            # Question text
            question_text = question.question_text
            
            # Handle equations in question text
            if question.has_equations and question.equation_latex:
                # For now, we'll include the LaTeX as text
                # In a production system, you'd want to render the LaTeX to an image
                question_text = question_text.replace(f"${question.equation_latex}$", 
                                                    f"[EQUATION: {question.equation_latex}]")
            
            story.append(Paragraph(question_text, self.styles['QuestionText']))
            
            # Add options for MCQ and True/False
            if question.question_type == QuestionType.MULTIPLE_CHOICE and question.options:
                for j, option in enumerate(question.options):
                    option_letter = chr(65 + j)  # A, B, C, D
                    option_text = f"{option_letter}) {option}"
                    
                    # Highlight correct answer if including answers
                    if include_answers and str(j) == str(question.correct_answer):
                        option_text = f"<b>{option_text}</b> ← CORRECT"
                    
                    story.append(Paragraph(option_text, self.styles['OptionText']))
            
            elif question.question_type == QuestionType.TRUE_FALSE:
                tf_options = "A) True     B) False"
                if include_answers:
                    correct = question.correct_answer.lower() if question.correct_answer else 'true'
                    if correct == 'true':
                        tf_options = "<b>A) True ← CORRECT</b>     B) False"
                    else:
                        tf_options = "A) True     <b>B) False ← CORRECT</b>"
                
                story.append(Paragraph(tf_options, self.styles['OptionText']))
            
            # Add space for answer if not including answers
            if not include_answers:
                if question.question_type in [QuestionType.SHORT_ANSWER, QuestionType.FILL_BLANKS]:
                    story.append(Spacer(1, 30))
                elif question.question_type in [QuestionType.LONG_ANSWER, QuestionType.SUBJECTIVE]:
                    story.append(Spacer(1, 60))
                else:
                    story.append(Spacer(1, 15))
            
            # Add explanation if requested
            if include_explanations and question.explanation:
                story.append(Paragraph(
                    f"<b>Explanation:</b> {question.explanation}",
                    self.styles['Instructions']
                ))
            
            story.append(Spacer(1, 10))
        
        return story

    def _create_answer_key(self, questions: List[Question]) -> List:
        """Create answer key section."""
        story = []
        
        story.append(Paragraph("ANSWER KEY", self.styles['CustomHeader']))
        story.append(Spacer(1, 15))
        
        # Create answer table
        answer_data = [['Question', 'Type', 'Correct Answer', 'Marks']]
        
        for i, question in enumerate(questions, 1):
            answer = self._format_answer_for_table(question)
            answer_data.append([
                f"Q{i}",
                question.question_type.value.replace('_', ' ').title(),
                answer,
                str(question.marks)
            ])
        
        answer_table = Table(answer_data, colWidths=[0.8*inch, 1.5*inch, 3*inch, 0.8*inch])
        answer_table.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.lightgrey),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.black),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, -1), 9),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
        
        story.append(answer_table)
        
        return story

    def _format_answer_for_table(self, question: Question) -> str:
        """Format the answer for display in the answer table."""
        if question.question_type == QuestionType.MULTIPLE_CHOICE:
            if question.correct_answer and question.options:
                try:
                    idx = int(question.correct_answer)
                    if 0 <= idx < len(question.options):
                        return f"{chr(65 + idx)}) {question.options[idx][:30]}..."
                except:
                    pass
            return question.correct_answer or "Not specified"
        
        elif question.question_type == QuestionType.TRUE_FALSE:
            return question.correct_answer.title() if question.correct_answer else "True"
        
        elif isinstance(question.correct_answer, list):
            return "; ".join(question.correct_answer[:3]) + ("..." if len(question.correct_answer) > 3 else "")
        
        elif isinstance(question.correct_answer, str):
            return question.correct_answer[:50] + ("..." if len(question.correct_answer) > 50 else "")
        
        else:
            return "See detailed solution"

    async def export_with_custom_header(self, question_paper: QuestionPaper,
                                      custom_header: Dict[str, str],
                                      include_answers: bool = False) -> bytes:
        """Export question paper with custom header information."""
        # Update the question paper header info
        updated_paper = question_paper.copy()
        updated_paper.header_info.update(custom_header)
        
        return await self.export_question_paper(updated_paper, include_answers)

    def create_question_paper_template(self) -> bytes:
        """Create a blank question paper template."""
        buffer = io.BytesIO()
        
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=18
        )
        
        story = []
        
        # Template header
        template_info = {
            'university_name': '[UNIVERSITY NAME]',
            'department': '[DEPARTMENT NAME]',
            'course_name': '[COURSE NAME]',
            'course_code': '[COURSE CODE]',
            'subject': '[SUBJECT]',
            'topic': '[TOPIC]',
            'exam_duration': '[DURATION]',
            'max_marks': '[MAX MARKS]'
        }
        
        # Create a dummy question paper for template
        from models import QuestionPaper
        template_paper = QuestionPaper(
            id="template",
            title="Question Paper Template",
            header_info=template_info,
            questions=[],
            total_marks=0,
            generated_at=datetime.now().isoformat()
        )
        
        story.extend(self._create_header(template_paper))
        
        # Add sample content
        story.append(Paragraph("Sample Question Format:", self.styles['QuestionNumber']))
        story.append(Paragraph("Q1. [Marks] Question text goes here...", self.styles['QuestionText']))
        story.append(Spacer(1, 30))
        
        doc.build(story)
        
        pdf_bytes = buffer.getvalue()
        buffer.close()
        
        return pdf_bytes
