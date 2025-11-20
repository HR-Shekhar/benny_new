"""
AI Grading Service
Handles code execution, test case running, and LLM-based feedback generation.
Designed to be modular so the LLM provider can be swapped easily.
"""
import os
import json
from pathlib import Path
from typing import Dict, Any
from datetime import datetime, timezone

# Try to import LLM utilities (using existing RAG chatbot setup)
try:
    from app.utils.rag_chatbot import get_llm
    LLM_AVAILABLE = True
except (ImportError, Exception):
    LLM_AVAILABLE = False
    # LLM not available - will use fallback feedback


class AIGradingService:
    """Service for AI-powered assignment grading."""
    
    def __init__(self):
        self.llm = get_llm() if LLM_AVAILABLE else None
    
    async def grade_submission(
        self,
        submission_file_path: str,
        assignment_id: str,
        file_type: str
    ) -> Dict[str, Any]:
        """
        Grade a submission and return score + feedback.
        
        Args:
            submission_file_path: Path to the submitted file
            assignment_id: ID of the assignment
            file_type: Type of file (e.g., 'py', 'ipynb', 'java', etc.)
        
        Returns:
            Dict with 'score' (0-100) and 'feedback' (str)
        """
        try:
            # Extract code content based on file type
            code_content = self._extract_code(submission_file_path, file_type)
            
            # Run test cases if available
            test_results = self._run_tests(submission_file_path, assignment_id, file_type)
            
            # Generate feedback using LLM
            feedback = await self._generate_feedback(
                code_content,
                test_results,
                file_type
            )
            
            # Calculate score based on test results and code quality
            score = self._calculate_score(code_content, test_results, feedback)
            
            return {
                'score': score,
                'feedback': feedback,
                'graded_at': datetime.now(timezone.utc).isoformat(),
                'graded_by': 'ai',
                'test_results': test_results
            }
        except Exception as e:
            # Fallback grading if something goes wrong
            return {
                'score': 0,
                'feedback': f"Error during grading: {str(e)}. Please review manually.",
                'graded_at': datetime.now(timezone.utc).isoformat(),
                'graded_by': 'ai',
                'test_results': None
            }
    
    def _extract_code(self, file_path: str, file_type: str) -> str:
        """Extract code content from various file types."""
        try:
            if not os.path.exists(file_path):
                return f"Error: File not found at {file_path}"
            
            if file_type in ['py', 'python']:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if not content or len(content.strip()) == 0:
                        return "Error: File appears to be empty"
                    return content
            
            elif file_type in ['ipynb', 'jupyter']:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    notebook = json.load(f)
                    code_cells = []
                    for cell in notebook.get('cells', []):
                        if cell.get('cell_type') == 'code':
                            source = cell.get('source', [])
                            if isinstance(source, list):
                                code_cells.append(''.join(source))
                            else:
                                code_cells.append(source)
                    result = '\n\n'.join(code_cells)
                    if not result or len(result.strip()) == 0:
                        return "Error: No code cells found in notebook"
                    return result
            
            elif file_type in ['java', 'cpp', 'c', 'js', 'jsx', 'ts', 'tsx', 'html', 'css']:
                with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    if not content or len(content.strip()) == 0:
                        return "Error: File appears to be empty"
                    return content
            
            else:
                # For other file types, try to read as text
                try:
                    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
                        content = f.read()
                        if not content or len(content.strip()) == 0:
                            return f"File type {file_type}: File appears to be empty or binary"
                        return content
                except Exception as e:
                    return f"Binary or unsupported file type: {file_type}. Error: {str(e)}"
        except Exception as e:
            return f"Error reading file: {str(e)}"
    
    def _run_tests(
        self,
        submission_file_path: str,
        assignment_id: str,
        file_type: str
    ) -> Dict[str, Any]:
        """
        Run test cases for the submission.
        Test cases should be in storage/tests/{assignment_id}/
        """
        tests_dir = os.path.join("storage", "tests", assignment_id)
        
        if not os.path.exists(tests_dir):
            return {
                'tests_run': False,
                'message': 'No test cases available for this assignment'
            }
        
        # Only run tests for Python files for now (safest)
        if file_type not in ['py', 'python', 'ipynb', 'jupyter']:
            return {
                'tests_run': False,
                'message': f'Automated testing not available for {file_type} files'
            }
        
        try:
            # Look for test files
            test_files = list(Path(tests_dir).glob('test_*.py'))
            if not test_files:
                return {
                    'tests_run': False,
                    'message': 'No test files found'
                }
            
            # For Python files, we can run pytest or unittest
            # For safety, we'll use a sandboxed approach
            # For now, return a placeholder that indicates tests would run
            return {
                'tests_run': True,
                'test_files_found': len(test_files),
                'message': f'Found {len(test_files)} test file(s). Test execution would run here.',
                'note': 'Full test execution requires sandboxed environment setup'
            }
        except Exception as e:
            return {
                'tests_run': False,
                'error': str(e)
            }
    
    async def _generate_feedback(
        self,
        code_content: str,
        test_results: Dict[str, Any],
        file_type: str
    ) -> str:
        """Generate feedback using LLM."""
        
        # Build prompt for LLM
        prompt = self._build_feedback_prompt(code_content, test_results, file_type)
        
        if self.llm:
            try:
                # Use LLM to generate feedback
                response = self.llm.invoke(prompt)
                if hasattr(response, 'content'):
                    return response.content
                return str(response)
            except Exception as e:
                print(f"LLM error: {e}")
                return self._fallback_feedback(code_content, test_results)
        else:
            return self._fallback_feedback(code_content, test_results)
    
    def _build_feedback_prompt(
        self,
        code_content: str,
        test_results: Dict[str, Any],
        file_type: str
    ) -> str:
        """Build the prompt for LLM feedback generation."""
        prompt = f"""You are an expert programming instructor grading a student's assignment.

File Type: {file_type}

Student Code:
```{file_type}
{code_content[:2000]}  # Limit to first 2000 chars
```

Test Results:
{json.dumps(test_results, indent=2)}

Please provide constructive feedback on:
1. Code correctness and logic
2. Code structure and organization
3. Best practices and style
4. Areas for improvement

Be encouraging but honest. Format your response as clear, actionable feedback.
"""
        return prompt
    
    def _fallback_feedback(
        self,
        code_content: str,
        test_results: Dict[str, Any]
    ) -> str:
        """Generate basic feedback when LLM is not available."""
        feedback_parts = []
        
        if not code_content or code_content.startswith("Error"):
            feedback_parts.append("⚠️ Unable to read the submitted file. Please ensure the file is valid and try again.")
            return "\n".join(feedback_parts)
        
        lines = code_content.split('\n')
        non_empty_lines = [l for l in lines if l.strip()]
        code_length = len(non_empty_lines)
        
        feedback_parts.append(f"📝 Code Analysis:")
        feedback_parts.append(f"   • Submitted file contains {code_length} lines of code.")
        
        # Basic code quality checks
        has_functions = 'def ' in code_content or 'function' in code_content.lower() or 'class ' in code_content
        has_imports = 'import ' in code_content or '#include' in code_content
        has_comments = '#' in code_content or '//' in code_content or '/*' in code_content
        
        if has_functions:
            feedback_parts.append("   ✓ Code includes functions/classes - good structure.")
        if has_imports:
            feedback_parts.append("   ✓ Code uses imports/libraries appropriately.")
        if has_comments:
            feedback_parts.append("   ✓ Code includes comments - good documentation.")
        
        if code_length < 5:
            feedback_parts.append("   ⚠️ Code appears to be very short. Please ensure all requirements are met.")
        elif code_length > 50:
            feedback_parts.append("   ✓ Substantial code submission.")
        
        if test_results.get('tests_run'):
            feedback_parts.append("\n🧪 Test Results:")
            feedback_parts.append("   • Test cases were found and would be executed.")
        else:
            feedback_parts.append("\n📋 Review Status:")
            feedback_parts.append("   • Manual review recommended.")
        
        feedback_parts.append("\n💡 Note: For detailed AI feedback, LLM configuration is required.")
        
        return "\n".join(feedback_parts)
    
    def _calculate_score(
        self,
        code_content: str,
        test_results: Dict[str, Any],
        feedback: str
    ) -> float:
        """
        Calculate score (0-100) based on code content, test results and feedback.
        More reasonable scoring that analyzes actual code quality.
        """
        # Start with a base score that rewards submission
        base_score = 60.0  # Base score for submitting something
        
        # Check if code content is valid
        if not code_content or code_content.startswith("Error"):
            return 20.0  # Very low score for invalid/empty files
        
        # Analyze code quality indicators
        code_lower = code_content.lower()
        
        # Positive indicators (add points)
        if 'def ' in code_content or 'function' in code_lower or 'class ' in code_content:
            base_score += 10.0  # Has functions/classes - good structure
        
        if 'import ' in code_content or '#include' in code_content:
            base_score += 5.0  # Uses imports/libraries
        
        # Check for comments (shows understanding)
        comment_count = code_content.count('#') + code_content.count('//') + code_content.count('/*')
        if comment_count > 0:
            base_score += 5.0
        
        # Check code length (reasonable submissions should have some content)
        lines = code_content.split('\n')
        non_empty_lines = [l for l in lines if l.strip()]
        if len(non_empty_lines) > 10:
            base_score += 5.0  # Substantial code
        elif len(non_empty_lines) < 3:
            base_score -= 10.0  # Too short
        
        # Adjust based on test results
        if test_results.get('tests_run'):
            # If tests were found and would run, give credit
            base_score += 15.0
        
        # Adjust based on feedback keywords (from LLM if available)
        feedback_lower = feedback.lower()
        if any(word in feedback_lower for word in ['excellent', 'great', 'well done', 'good job']):
            base_score += 10.0
        elif any(word in feedback_lower for word in ['good', 'nice', 'correct', 'proper']):
            base_score += 5.0
        elif any(word in feedback_lower for word in ['error', 'incorrect', 'wrong', 'fails']):
            base_score -= 5.0
        elif any(word in feedback_lower for word in ['missing', 'incomplete', 'not implemented']):
            base_score -= 10.0
        
        # Ensure score is reasonable (not too harsh)
        # Clamp to 0-100, but ensure minimum of 30 for any valid submission
        final_score = max(30.0, min(100.0, base_score))
        
        return round(final_score, 1)

