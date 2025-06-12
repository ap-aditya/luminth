"""Hello unit test module."""

from db_core.hello import hello


def test_hello():
    """Test the hello function."""
    assert hello() == "Hello db-core"
