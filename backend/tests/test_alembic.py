import os

from alembic.config import Config
from alembic.script import ScriptDirectory

from app.database.models import Base


def test_alembic_configuration_exists():
    """Verify that alembic.ini and the alembic directory exist."""
    assert os.path.exists("alembic.ini")
    assert os.path.exists("alembic")
    assert os.path.exists("alembic/env.py")

def test_alembic_can_load_environment():
    """Verify that Alembic can parse its config and locate the script directory."""
    alembic_cfg = Config("alembic.ini")
    script = ScriptDirectory.from_config(alembic_cfg)
    
    # Check that it loaded a valid version directory
    assert script.dir is not None

def test_sqlalchemy_metadata_contains_models():
    """Verify that Base.metadata has the correct PackWise MVP models registered."""
    tables = Base.metadata.tables.keys()
    expected_tables = {
        "inspections",
        "images",
        "ocr_results",
        "extracted_products",
        "compliance_results",
        "compliance_violations"
    }
    
    # Check that every expected MVP table is mapped in SQLAlchemy metadata
    for table in expected_tables:
        assert table in tables
