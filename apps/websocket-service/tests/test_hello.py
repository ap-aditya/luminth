"""Hello unit test module."""

from websocket_service.hello import hello


def test_hello():
    """Test the hello function."""
    assert hello() == "Hello websocket_service"
