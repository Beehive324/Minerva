import json
import os
from io import BytesIO
from typing import Dict, List, Optional

try:
    # Preferred PDF reader
    from PyPDF2 import PdfReader  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    PdfReader = None  # type: ignore

try:
    # Preferred with modern LangChain
    from langchain_openai import ChatOpenAI  # type: ignore
except ImportError:
    try:
        # Fallback for older LangChain versions
        from langchain.chat_models import ChatOpenAI  # type: ignore
    except Exception:  # pragma: no cover - very defensive
        ChatOpenAI = None  # type: ignore

try:
    from dotenv import load_dotenv  # type: ignore
except ImportError:  # pragma: no cover - optional dependency
    load_dotenv = None  # type: ignore


class CurriculumAgent:
    """
    Agent responsible for extracting high‑level curriculum information
    (topics and learning objectives) from an uploaded PDF.
    """

    def __init__(self) -> None:
        # Best‑effort .env loading (optional)
        if load_dotenv is not None:
            load_dotenv()

        api_key = os.getenv("OPENAI_API_KEY")
        self._llm = None

        # Initialize an OpenAI chat model if dependencies and key are available.
        if ChatOpenAI is not None and api_key:
            try:
                # Newer langchain‑openai signature
                self._llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.1)
            except TypeError:
                # Older langchain signature
                self._llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.1)

    def extract_curriculum(
        self, pdf_bytes: bytes, filename: Optional[str] = None
    ) -> Dict[str, List[str]]:
        """
        Given raw PDF bytes, return a dictionary:
        {
            "topics": [str, ...],
            "learningObjectives": [str, ...]
        }

        Uses the LLM (and PDF text when available) with a safe fallback
        to static mock values if anything fails.
        """
        text = self._extract_text(pdf_bytes)

        if self._llm is not None and text.strip():
            try:
                # Truncate to keep prompts small while remaining useful
                truncated = text[:6000]
                name_part = f" titled '{filename}'" if filename else ""
                prompt = (
                    "You are an assistant that reads a school curriculum PDF "
                    "and summarizes its structure.\n\n"
                    f"PDF{name_part} contents (possibly truncated):\n"
                    "----------------\n"
                    f"{truncated}\n"
                    "----------------\n\n"
                    "From this, identify:\n"
                    "1. 4‑8 high‑level topics (short phrases).\n"
                    "2. 4‑8 concise learning objectives (student‑friendly).\n\n"
                    "Return JSON ONLY with this exact structure:\n"
                    '{\"topics\": [\"...\"], \"learningObjectives\": [\"...\"]}\n'
                    "- Do not include any explanation or text outside the JSON.\n"
                    "- Keep each string short (max ~120 characters)."
                )
                response = self._llm.invoke(prompt)  # type: ignore[arg-type]
                content = getattr(response, "content", str(response))
                parsed = self._parse_llm_output(content)
                if parsed:
                    return parsed
            except Exception:
                # Fall back to deterministic mocks if anything goes wrong
                pass

        # Fallback: simple static curriculum so the UI keeps working.
        return {
            "topics": [
                "Algebra",
                "Geometry",
                "Statistics",
                "Trigonometry",
                "Calculus Basics",
            ],
            "learningObjectives": [
                "Understand basic algebraic expressions",
                "Learn geometric shapes and properties",
                "Analyze statistical data",
                "Master trigonometric functions",
                "Gain an introduction to calculus concepts",
            ],
        }

    def _extract_text(self, pdf_bytes: bytes) -> str:
        """
        Extract raw text from the PDF using PyPDF2 when available.
        Returns an empty string on failure.
        """
        if not pdf_bytes or PdfReader is None:
            return ""

        try:
            reader = PdfReader(BytesIO(pdf_bytes))
            chunks: List[str] = []
            # Limit to first few pages for speed and token safety
            for page in reader.pages[:5]:
                try:
                    page_text = page.extract_text() or ""
                except Exception:
                    page_text = ""
                if page_text:
                    chunks.append(page_text)
            return "\n\n".join(chunks)
        except Exception:
            return ""

    def _parse_llm_output(self, content: str) -> Optional[Dict[str, List[str]]]:
        """
        Parse the LLM JSON output into:
        { "topics": [...], "learningObjectives": [...] }.
        Returns None on any parse/validation error.
        """
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            return None

        if not isinstance(data, dict):
            return None

        topics_raw = data.get("topics") or []
        learning_raw = data.get("learningObjectives") or []

        if not isinstance(topics_raw, list) or not isinstance(learning_raw, list):
            return None

        topics = [
            str(t).strip() for t in topics_raw if str(t).strip()
        ]
        objectives = [
            str(obj).strip() for obj in learning_raw if str(obj).strip()
        ]

        if not topics or not objectives:
            return None

        return {
            "topics": topics,
            "learningObjectives": objectives,
        }

