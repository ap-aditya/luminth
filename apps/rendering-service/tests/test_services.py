import pytest

from rendering_service import services

SAMPLE_CODE_VALID = """
from manim import *

class MyFirstScene(Scene):
    def construct(self):
        circle = Circle()
        self.play(Create(circle))
"""

SAMPLE_CODE_NO_SCENE = """
import os

def my_function():
    print("Hello, World!")
"""


def test_extract_first_scene_name_success():
    """
    Tests that the function correctly extracts the scene name from valid code.
    """
    scene_name = services.extract_first_scene_name(SAMPLE_CODE_VALID)
    assert scene_name == "MyFirstScene"


def test_extract_first_scene_name_failure():
    """
    Tests that the function correctly raises a ValueError when no scene is found.
    """
    with pytest.raises(
        ValueError, match="Could not find any class inheriting from 'Scene'"
    ):
        services.extract_first_scene_name(SAMPLE_CODE_NO_SCENE)
