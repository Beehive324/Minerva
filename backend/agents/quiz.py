import json
import os
from typing import Dict, List, Optional

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


class QuizAgent:
    """
    Simple quiz generation agent.

    This is intentionally framework‑agnostic so it can be
    swapped to a LangChain / LLM‑backed implementation later
    without changing the rest of the app.
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
                self._llm = ChatOpenAI(model="gpt-4o-mini", temperature=0.2)
            except TypeError:
                # Older langchain signature
                self._llm = ChatOpenAI(model_name="gpt-4o-mini", temperature=0.2)

    def generate_questions(
        self,
        title: str,
        subject: str,
        difficulty: str,
        num_questions: int,
        preview_questions: Optional[List[Dict]] = None,
    ) -> List[Dict]:
        """
        Return a list of questions in the format:

        {
            "question": str,
            "answer": str,
            "options": List[str]  # may be empty for written answers
        }

        If preview_questions are provided, they are normalized and returned.
        Otherwise, the LLM is used when available; if not, fallback mock
        questions are generated.
        """
        if preview_questions:
            normalized: List[Dict] = []
            for q in preview_questions:
                options = q.get("options") or []
                if isinstance(options, str):
                    options = [
                        opt.strip() for opt in options.split(",") if opt.strip()
                    ]
                normalized.append(
                    {
                        "question": q.get("question", ""),
                        "answer": q.get("answer", ""),
                        "options": options,
                    }
                )
            return normalized

        # Try to use the LLM if configured
        if self._llm is not None and num_questions > 0:
            try:
                prompt = (
                    "You are an assistant that writes quiz questions.\n"
                    f"Create {num_questions} questions for a {difficulty} "
                    f"{subject} quiz titled '{title}'.\n"
                    "Return JSON ONLY with this exact structure:\n"
                    '[{"question": "...", "answer": "...", "options": ["..."]}]\n'
                    "- Use an empty list for options if it is an open‑ended question.\n"
                    "- Do not include any explanation or text outside the JSON."
                )
                response = self._llm.invoke(prompt)  # type: ignore[arg-type]
                content = getattr(response, "content", str(response))
                parsed = self._parse_llm_output(content, num_questions)
                if parsed:
                    return parsed
            except Exception:
                # Fall back to deterministic mocks if anything goes wrong
                pass

        # Fallback: generate simple placeholder questions so the
        # rest of the app functions end‑to‑end.
        questions: List[Dict] = []
        for i in range(num_questions):
            questions.append(
                {
                    "question": f"Sample question {i + 1} for {title} ({subject}, {difficulty})",
                    "answer": f"Sample answer {i + 1}",
                    "options": [f"Option {chr(65 + j)}" for j in range(4)],
                }
            )
        return questions

    def _parse_llm_output(
        self, content: str, num_questions: int
    ) -> Optional[List[Dict]]:
        """
        Parse the LLM JSON output into the internal question format.
        Returns None on any parse/validation error.
        """
        try:
            data = json.loads(content)
        except json.JSONDecodeError:
            return None

        if isinstance(data, dict) and "questions" in data:
            data = data["questions"]

        if not isinstance(data, list):
            return None

        questions: List[Dict] = []
        for raw in data[:num_questions]:
            if not isinstance(raw, dict):
                continue
            question_text = str(raw.get("question", "")).strip()
            if not question_text:
                continue
            answer_text = str(raw.get("answer", "")).strip()
            options = raw.get("options") or []
            if isinstance(options, str):
                options = [
                    opt.strip() for opt in options.split(",") if opt.strip()
                ]
            elif isinstance(options, list):
                options = [str(opt).strip() for opt in options if str(opt).strip()]
            else:
                options = []

            questions.append(
                {
                    "question": question_text,
                    "answer": answer_text,
                    "options": options,
                }
            )

        return questions or None
