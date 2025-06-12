"""Hello unit test module."""

from rendering_service.hello import hello


def test_hello():
    """Test the hello function."""
    assert hello() == "Hello rendering-service"
