"""Hello unit test module."""

from user_service.hello import hello


def test_hello():
    """Test the hello function."""
    assert hello() == "Hello user-service"
