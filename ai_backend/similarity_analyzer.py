import asyncio
import re
from typing import List, Dict, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import PorterStemmer

class SimilarityAnalyzer:
    def __init__(self):
        self.vectorizer = TfidfVectorizer(
            stop_words='english',
            max_features=1000,
            ngram_range=(1, 2)
        )
        self.stemmer = PorterStemmer()
        self._download_nltk_data()

    def _download_nltk_data(self):
        """Download required NLTK data."""
        try:
            import nltk
            nltk.download('punkt', quiet=True)
            nltk.download('stopwords', quiet=True)
        except:
            pass  # Handle if NLTK is not available

    def preprocess_text(self, text: str) -> str:
        """Preprocess text for similarity analysis."""
        # Convert to lowercase
        text = text.lower()
        
        # Remove special characters except spaces
        text = re.sub(r'[^a-zA-Z0-9\s]', ' ', text)
        
        # Remove extra whitespace
        text = ' '.join(text.split())
        
        # Tokenize and stem
        try:
            tokens = word_tokenize(text)
            stemmed_tokens = [self.stemmer.stem(token) for token in tokens]
            return ' '.join(stemmed_tokens)
        except:
            # Fallback if NLTK is not available
            return text

    async def calculate_similarity(self, question: str, previous_papers: List[str]) -> float:
        """Calculate similarity percentage between a question and previous papers."""
        if not previous_papers:
            return 0.0
        
        # Preprocess the question
        processed_question = self.preprocess_text(question)
        
        # Preprocess all previous papers
        processed_papers = [self.preprocess_text(paper) for paper in previous_papers]
        
        # Combine all texts for vectorization
        all_texts = [processed_question] + processed_papers
        
        try:
            # Create TF-IDF vectors
            tfidf_matrix = self.vectorizer.fit_transform(all_texts)
            
            # Calculate cosine similarity between question and each paper
            question_vector = tfidf_matrix[0:1]
            paper_vectors = tfidf_matrix[1:]
            
            similarities = cosine_similarity(question_vector, paper_vectors)[0]
            
            # Return the maximum similarity as percentage
            max_similarity = float(np.max(similarities)) * 100
            return min(max_similarity, 100.0)
            
        except Exception as e:
            # Fallback to simple word overlap if TF-IDF fails
            return self._calculate_word_overlap_similarity(question, previous_papers)

    def _calculate_word_overlap_similarity(self, question: str, previous_papers: List[str]) -> float:
        """Fallback method using word overlap similarity."""
        question_words = set(self.preprocess_text(question).split())
        
        max_overlap = 0.0
        for paper in previous_papers:
            paper_words = set(self.preprocess_text(paper).split())
            
            if len(question_words) == 0:
                continue
                
            overlap = len(question_words.intersection(paper_words))
            overlap_percentage = (overlap / len(question_words)) * 100
            max_overlap = max(max_overlap, overlap_percentage)
        
        return min(max_overlap, 100.0)

    async def analyze_question_uniqueness(self, question: str, existing_questions: List[str]) -> Dict:
        """Analyze how unique a question is compared to existing questions."""
        similarities = []
        
        for existing in existing_questions:
            similarity = await self.calculate_similarity(question, [existing])
            similarities.append(similarity)
        
        if not similarities:
            return {
                "is_unique": True,
                "max_similarity": 0.0,
                "average_similarity": 0.0,
                "similar_questions": []
            }
        
        max_sim = max(similarities)
        avg_sim = sum(similarities) / len(similarities)
        
        # Find highly similar questions (>70% similarity)
        similar_questions = [
            existing_questions[i] for i, sim in enumerate(similarities) 
            if sim > 70
        ]
        
        return {
            "is_unique": max_sim < 70,  # Consider unique if < 70% similar
            "max_similarity": max_sim,
            "average_similarity": avg_sim,
            "similar_questions": similar_questions
        }

    def extract_key_concepts(self, text: str) -> List[str]:
        """Extract key concepts from text for similarity analysis."""
        processed_text = self.preprocess_text(text)
        words = processed_text.split()
        
        # Remove very short words
        key_words = [word for word in words if len(word) > 3]
        
        # Return unique words
        return list(set(key_words))

    async def batch_similarity_analysis(self, questions: List[str], 
                                      previous_papers: List[str]) -> Dict[int, float]:
        """Analyze similarity for multiple questions in batch."""
        results = {}
        
        for i, question in enumerate(questions):
            similarity = await self.calculate_similarity(question, previous_papers)
            results[i] = similarity
        
        return results
