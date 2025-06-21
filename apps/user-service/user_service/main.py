import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv() 
api_key= os.getenv("GEMINI_API_KEY")
if not api_key:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")
genai.configure(api_key=api_key)

def generate_manim_code(prompt):
    """
    Generates Manim Python code based on a natural language prompt using the Gemini API.
    """

    model = genai.GenerativeModel('gemini-1.5-flash')

    # Construct the prompt for code generation
    # Be specific about the output format you expect (e.g., "Python code only")
    full_prompt = f"""
    You are an AI assistant specialized in generating Manim Python code.
    The user will describe an animation, and you will provide only the complete Python code for a Manim scene.
    Do NOT include any explanations, comments (unless they are part of the Manim code), or extra text outside the Python code block.
    Ensure the code is valid Manim code.
    If the user asks for something that Manim cannot do, try to interpret it to the closest possible Manim animation or state that it's beyond Manim's current capabilities.

    User request: {prompt}

    ```python
    # Manim Python code starts here
    """
    # Use generate_content for single turn conversations
    # For multi-turn conversations (like a chat), use model.start_chat()
    response = model.generate_content(full_prompt)

    # Extract the generated code.
    # The response.text might contain the full_prompt leading up to the code,
    # so you'll want to parse it to get just the Python code block.
    generated_text = response.text.strip()

    # Look for the Python code block
    if "```python" in generated_text:
        start_index = generated_text.find("```python") + len("```python")
        end_index = generated_text.find("```", start_index)
        if end_index != -1:
            manim_code = generated_text[start_index:end_index].strip()
        else:
            # If no closing ```, assume the rest is code (less robust)
            manim_code = generated_text[start_index:].strip()
    else:
        # If no code block markers, assume the whole response is code (less robust)
        manim_code = generated_text

    return manim_code

# Example usage:
if __name__ == "__main__":
    user_prompt = "Create a scene with a square transforming into a circle."
    try:
        manim_code_output = generate_manim_code(user_prompt)
        print("Generated Manim Code:")
        print(manim_code_output)
    except ValueError as e:
        print(f"Error: {e}")
    except Exception as e:
        print(f"An error occurred during Gemini API call: {e}")