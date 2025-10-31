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
    model = genai.GenerativeModel("gemini-2.5-flash")
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
    1.  **Output Format:** 
        * Your output must be ONLY the Python code, with no other text.
        * Wrap the entire code output in a single markdown block: ```python ... ```
    2.  **Imports:**
        * You MUST import all necessary components from `manim` 
            (e.g., `from manim import Scene, Square, Create`).
        * You MUST also import any required Python standard libraries 
            (e.g., `import random`, `import math`).
        * `numpy` is also allowed as Manim depends on it.
        * **FORBIDDEN IMPORTS:** 
        - `os`, `sys`, `subprocess`, `pathlib`, `shutil`, or any other library 
           that interacts with the file system or operating system.  
    3.  **Structure:** 
    - The code must define a single class that inherits from `manim.Scene`.
    4.  **No Comments:** Do NOT include any comments in the generated code.
    5.  **Self-Correction:** 
    - Before finishing, double-check your code. 
    - Ensure that every function or module you use 
      (like `random.choice` or `math.cos`) has a corresponding import 
      statement (like `import random` or `import math`) at the top.

    EXAMPLE of a good response for a prompt "a square with a random color":
    ```python
    from manim import Scene, Square, Create, RED, GREEN, BLUE
    import random

    class RandomSquareScene(Scene):
        def construct(self):
            color = random.choice([RED, GREEN, BLUE])
            square = Square(color=color)
            self.play(Create(square))
            self.wait()
    ```
    """ # noqa: E501

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
