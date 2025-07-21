import re
import sympy as sp
from sympy import symbols, latex, simplify, expand, factor
from typing import List, Dict, Optional
import random

from models import Question

class EquationHandler:
    def __init__(self):
        self.common_symbols = ['x', 'y', 'z', 'a', 'b', 'c', 'n', 't', 'θ', 'α', 'β']
        self.equation_templates = {
            'linear': ['ax + b = 0', 'mx + c = y'],
            'quadratic': ['ax^2 + bx + c = 0', 'y = ax^2 + bx + c'],
            'exponential': ['y = a*e^(bx)', 'y = a*b^x'],
            'logarithmic': ['y = a*log(bx)', 'y = log_a(x)'],
            'trigonometric': ['sin(x) = a', 'cos(x) + sin(x) = 1', 'tan(x) = y'],
            'calculus': ['dy/dx = ax + b', '∫(ax + b)dx', 'd²y/dx² = ax'],
            'physics': ['F = ma', 'E = mc²', 'v = u + at', 'PV = nRT'],
            'chemistry': ['pH = -log[H+]', 'PV = nRT', 'ΔG = ΔH - TΔS'],
            'statistics': ['μ = Σx/n', 'σ² = Σ(x-μ)²/n']
        }

    async def add_equation_to_question(self, question: Question) -> Question:
        """Add an appropriate equation to a question based on its content."""
        
        # Determine equation type based on question content
        equation_type = self._determine_equation_type(question.question_text)
        
        # Generate equation
        equation_latex = self._generate_equation(equation_type, question.difficulty.value)
        
        if equation_latex:
            # Modify question text to include equation
            modified_text = self._integrate_equation_into_question(
                question.question_text, 
                equation_latex,
                equation_type
            )
            
            question.question_text = modified_text
            question.has_equations = True
            question.equation_latex = equation_latex
        
        return question

    def _determine_equation_type(self, question_text: str) -> str:
        """Determine the type of equation to generate based on question content."""
        text_lower = question_text.lower()
        
        # Keywords mapping to equation types
        keyword_mapping = {
            'derivative': 'calculus',
            'integral': 'calculus',
            'differential': 'calculus',
            'limit': 'calculus',
            'quadratic': 'quadratic',
            'linear': 'linear',
            'exponential': 'exponential',
            'logarithm': 'logarithmic',
            'log': 'logarithmic',
            'sin': 'trigonometric',
            'cos': 'trigonometric',
            'tan': 'trigonometric',
            'trigonometry': 'trigonometric',
            'force': 'physics',
            'velocity': 'physics',
            'acceleration': 'physics',
            'energy': 'physics',
            'momentum': 'physics',
            'pressure': 'physics',
            'chemistry': 'chemistry',
            'reaction': 'chemistry',
            'ph': 'chemistry',
            'concentration': 'chemistry',
            'statistics': 'statistics',
            'probability': 'statistics',
            'mean': 'statistics',
            'variance': 'statistics',
            'standard deviation': 'statistics'
        }
        
        for keyword, eq_type in keyword_mapping.items():
            if keyword in text_lower:
                return eq_type
        
        # Default to linear equations
        return 'linear'

    def _generate_equation(self, equation_type: str, difficulty: str) -> str:
        """Generate a LaTeX equation based on type and difficulty."""
        
        try:
            if equation_type == 'linear':
                return self._generate_linear_equation(difficulty)
            elif equation_type == 'quadratic':
                return self._generate_quadratic_equation(difficulty)
            elif equation_type == 'calculus':
                return self._generate_calculus_equation(difficulty)
            elif equation_type == 'trigonometric':
                return self._generate_trigonometric_equation(difficulty)
            elif equation_type == 'exponential':
                return self._generate_exponential_equation(difficulty)
            elif equation_type == 'logarithmic':
                return self._generate_logarithmic_equation(difficulty)
            elif equation_type == 'physics':
                return self._generate_physics_equation(difficulty)
            elif equation_type == 'chemistry':
                return self._generate_chemistry_equation(difficulty)
            elif equation_type == 'statistics':
                return self._generate_statistics_equation(difficulty)
            else:
                return self._generate_linear_equation(difficulty)
        except:
            # Fallback to simple equation
            return r"x + 2 = 5"

    def _generate_linear_equation(self, difficulty: str) -> str:
        """Generate linear equations."""
        x = symbols('x')
        
        if difficulty == 'easy':
            a, b = random.randint(1, 5), random.randint(1, 10)
            eq = sp.Eq(a*x + b, 0)
        elif difficulty == 'medium':
            a, b, c = random.randint(2, 8), random.randint(5, 15), random.randint(1, 20)
            eq = sp.Eq(a*x + b, c)
        else:  # hard
            a, b, c, d = random.randint(3, 10), random.randint(2, 12), random.randint(1, 15), random.randint(5, 25)
            eq = sp.Eq(a*x + b, c*x + d)
        
        return latex(eq)

    def _generate_quadratic_equation(self, difficulty: str) -> str:
        """Generate quadratic equations."""
        x = symbols('x')
        
        if difficulty == 'easy':
            a, b, c = 1, random.randint(-5, 5), random.randint(-10, 10)
        elif difficulty == 'medium':
            a, b, c = random.randint(1, 3), random.randint(-8, 8), random.randint(-15, 15)
        else:  # hard
            a, b, c = random.randint(2, 5), random.randint(-12, 12), random.randint(-25, 25)
        
        eq = sp.Eq(a*x**2 + b*x + c, 0)
        return latex(eq)

    def _generate_calculus_equation(self, difficulty: str) -> str:
        """Generate calculus equations."""
        x = symbols('x')
        
        if difficulty == 'easy':
            # Simple derivative
            expr = x**2 + 3*x + 1
            return r"\frac{d}{dx}(" + latex(expr) + ")"
        elif difficulty == 'medium':
            # Chain rule or product rule
            expr = sp.sin(x**2) + sp.exp(x)
            return r"\frac{d}{dx}(" + latex(expr) + ")"
        else:  # hard
            # Integration or complex derivative
            expr = x**3 * sp.sin(x)
            return r"\int " + latex(expr) + " dx"

    def _generate_trigonometric_equation(self, difficulty: str) -> str:
        """Generate trigonometric equations."""
        x = symbols('x')
        
        equations = {
            'easy': [sp.sin(x), sp.cos(x), sp.tan(x)],
            'medium': [sp.sin(2*x) + sp.cos(x), sp.sin(x)**2 + sp.cos(x)**2],
            'hard': [sp.sin(x) * sp.cos(x) + sp.tan(x), sp.sin(x + sp.pi/4)]
        }
        
        expr = random.choice(equations.get(difficulty, equations['easy']))
        return latex(sp.Eq(expr, random.randint(-1, 1)))

    def _generate_exponential_equation(self, difficulty: str) -> str:
        """Generate exponential equations."""
        x = symbols('x')
        
        if difficulty == 'easy':
            a = random.randint(2, 5)
            return latex(sp.Eq(a**x, random.randint(8, 32)))
        elif difficulty == 'medium':
            a, b = random.randint(2, 4), random.randint(1, 3)
            return latex(sp.Eq(a * sp.exp(b*x), random.randint(20, 100)))
        else:  # hard
            a, b, c = random.randint(2, 5), random.randint(1, 3), random.randint(1, 4)
            return latex(sp.Eq(a * sp.exp(b*x) + c, random.randint(50, 200)))

    def _generate_logarithmic_equation(self, difficulty: str) -> str:
        """Generate logarithmic equations."""
        x = symbols('x')
        
        if difficulty == 'easy':
            return latex(sp.Eq(sp.log(x), random.randint(1, 5)))
        elif difficulty == 'medium':
            a = random.randint(2, 5)
            return latex(sp.Eq(sp.log(a*x), random.randint(2, 8)))
        else:  # hard
            a, b = random.randint(2, 5), random.randint(1, 3)
            return latex(sp.Eq(a * sp.log(x) + b, random.randint(5, 15)))

    def _generate_physics_equation(self, difficulty: str) -> str:
        """Generate physics equations."""
        equations = {
            'easy': [r"F = ma", r"v = u + at", r"s = ut + \frac{1}{2}at^2"],
            'medium': [r"E = \frac{1}{2}mv^2", r"P = \frac{F}{A}", r"W = Fd\cos\theta"],
            'hard': [r"E = mc^2", r"F = G\frac{m_1m_2}{r^2}", r"\nabla \cdot \mathbf{E} = \frac{\rho}{\epsilon_0}"]
        }
        
        return random.choice(equations.get(difficulty, equations['easy']))

    def _generate_chemistry_equation(self, difficulty: str) -> str:
        """Generate chemistry equations."""
        equations = {
            'easy': [r"pH = -\log[H^+]", r"PV = nRT", r"C = \frac{n}{V}"],
            'medium': [r"\Delta G = \Delta H - T\Delta S", r"K = \frac{[C]^c[D]^d}{[A]^a[B]^b}", r"E = E^0 - \frac{RT}{nF}\ln Q"],
            'hard': [r"\frac{d[A]}{dt} = -k[A]^n", r"\Delta G^0 = -RT\ln K", r"E_{cell} = E_{cathode} - E_{anode}"]
        }
        
        return random.choice(equations.get(difficulty, equations['easy']))

    def _generate_statistics_equation(self, difficulty: str) -> str:
        """Generate statistics equations."""
        equations = {
            'easy': [r"\mu = \frac{\sum x}{n}", r"\sigma^2 = \frac{\sum (x-\mu)^2}{n}"],
            'medium': [r"z = \frac{x - \mu}{\sigma}", r"P(A|B) = \frac{P(A \cap B)}{P(B)}"],
            'hard': [r"t = \frac{\bar{x} - \mu}{\frac{s}{\sqrt{n}}}", r"\chi^2 = \sum \frac{(O_i - E_i)^2}{E_i}"]
        }
        
        return random.choice(equations.get(difficulty, equations['easy']))

    def _integrate_equation_into_question(self, question_text: str, equation_latex: str, equation_type: str) -> str:
        """Integrate the equation naturally into the question text."""
        
        integration_templates = {
            'beginning': f"Given the equation ${equation_latex}$, {question_text.lower()}",
            'middle': f"{question_text.split('.')[0]}. Using the equation ${equation_latex}$, {'. '.join(question_text.split('.')[1:]) if '.' in question_text else 'solve the problem.'}",
            'end': f"{question_text} Use the equation ${equation_latex}$ in your solution.",
            'reference': f"{question_text} Refer to the equation ${equation_latex}$ for your calculations."
        }
        
        # Choose integration style based on question type
        if 'solve' in question_text.lower() or 'calculate' in question_text.lower():
            return integration_templates['beginning']
        elif 'explain' in question_text.lower() or 'describe' in question_text.lower():
            return integration_templates['reference']
        else:
            return integration_templates['middle']

    def validate_equation_syntax(self, equation_latex: str) -> bool:
        """Validate if the LaTeX equation syntax is correct."""
        try:
            # Basic validation - check for balanced braces
            if equation_latex.count('{') != equation_latex.count('}'):
                return False
            if equation_latex.count('[') != equation_latex.count(']'):
                return False
            if equation_latex.count('(') != equation_latex.count(')'):
                return False
            
            # Check for basic LaTeX math commands
            math_commands = ['frac', 'sqrt', 'sum', 'int', 'log', 'sin', 'cos', 'tan', 'exp']
            has_math = any(cmd in equation_latex for cmd in math_commands) or any(char in equation_latex for char in 'xyz+-=^_{}')
            
            return has_math and len(equation_latex.strip()) > 0
        except:
            return False

    def convert_equation_to_image_friendly(self, equation_latex: str) -> str:
        """Convert equation to a format that can be easily rendered in images/PDFs."""
        # Remove extra spaces and normalize
        equation_latex = re.sub(r'\s+', ' ', equation_latex.strip())
        
        # Ensure proper LaTeX math mode
        if not equation_latex.startswith('$') and not equation_latex.startswith(r'\['):
            equation_latex = f"${equation_latex}$"
        
        return equation_latex
