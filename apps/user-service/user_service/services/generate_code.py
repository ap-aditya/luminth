import asyncio
import logging

import google.generativeai as genai

from ..dependencies.config import settings
from .code_validator import is_code_safe, parse_manim_code

model = None
try:
    if not settings.GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set.")

    genai.configure(api_key=settings.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-1.5-flash")
    logging.info("Gemini API client configured successfully.")

except Exception as e:
    logging.critical(f"FATAL ERROR: Could not initialize Gemini API: {e}")


async def generate_manim_code(prompt: str, max_retries: int = 3) -> str:
    if not model:
        raise ConnectionError(
            "Gemini API client is not initialized. Check server logs."
        )

    system_prompt = """You are a Manim expert. Your task is to write clean, 
    correct, and complete Python code for a Manim scene based on the user's request.
    GUIDELINES:
    - Your output must be ONLY the Python code, with no other text.
    - Wrap the entire code output in a single markdown block: ```python ... ```
    - The code must import all necessary components from `manim`.
    - The code must define a single class that inherits from `manim.Scene`.
    - Do NOT include any comments in the generated code.
    - Do NOT include any `os` or `sys` imports or any other system commands.
    - Do NOT use any external libraries that are not part of the standard Manim installation.""" #noqa: E501

    current_prompt = f'{system_prompt}\n\nUSER REQUEST:\n"{prompt}"'

    for attempt in range(max_retries):
        logging.info(f"Generating Manim code... (Attempt {attempt + 1}/{max_retries})")
        try:
            response = await asyncio.to_thread(model.generate_content, current_prompt)
            generated_text = response.text
            manim_code = parse_manim_code(generated_text)

            if not manim_code:
                logging.warning("AI model returned an empty response. Retrying...")
                continue
            is_safe, reason = is_code_safe(manim_code)
            if is_safe:
                logging.info("Generated code passed safety validation.")
                return manim_code
            logging.warning(
                f"Attempt {attempt + 1} failed validation: {reason}. Regenerating..."
            )
            current_prompt += f"""\n\n---PREVIOUS ATTEMPT FAILED.REASON: {reason}
                Please correct the code and strictly adhere to all guidelines.
                Do not repeat the mistake."""

        except Exception as e:
            logging.error(
                f"An exception occurred during generation attempt {attempt + 1}: {e}"
            )
            if attempt == max_retries - 1:
                raise

    raise ValueError(
        f"Failed to generate safe and valid Manim code after {max_retries} attempts."
    )
