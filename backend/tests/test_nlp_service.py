import pytest

from app.services.nlp_service import nlp_service


@pytest.fixture
def anyio_backend():
    return 'asyncio'

@pytest.mark.anyio
async def test_deterministic_mrp_normalization():
    """Test deterministic extraction properly extracts and normalizes MRP."""
    test_cases = [
        ("MRP Rs. 199", "199", "MRP Rs. 199"),
        ("MRP ₹199", "199", "MRP ₹199"),
        ("MRPRs 199", "199", "MRPRs 199"),
        ("MRP 199/-", "199", "MRP 199/-"),
        ("Net Qty 500g\nMRP Rs. 199\nSugar 28g", "199", "MRP Rs. 199")
    ]
    
    for case, exp_val, exp_evid in test_cases:
        res = await nlp_service.extract_from_ocr(case)
        assert res.metrology.mrp == exp_val
        assert res.metrology.mrp_evidence == exp_evid

@pytest.mark.anyio
async def test_deterministic_bb_normalization():
    """Test deterministic extraction properly extracts and normalizes Best Before."""
    test_cases_bb = [
        ("BEST BEFORE 31/12/2026", "31/12/2026"),
        ("BEST BEFORE: 31-12-2026", "31-12-2026"),
        ("BEST BEFORE 31.12.2026", "31.12.2026"),
        ("BEST BEFORE 31 AUG 2026", "31 AUG 2026"),
        ("BEST BEFORE AUG 2026", "AUG 2026"),
        ("BEST BEFORE 6 MONTHS FROM MFG", "6 MONTHS FROM MFG"),
        ("BEST BEFORE 180 DAYS FROM MFG", "180 DAYS FROM MFG"),
        ("BEST BEFORE6 MONTHS FROM MFG", "6 MONTHS FROM MFG"),
        ("BEST BEFORE31/12/2026", "31/12/2026")
    ]
    
    for case, exp_val in test_cases_bb:
        res = await nlp_service.extract_from_ocr(case)
        assert res.metrology.best_before == exp_val

@pytest.mark.anyio
async def test_deterministic_no_false_positives():
    """Test deterministic extraction does not invent values from unrelated numbers."""
    case = "Net Qty 500g\nEnergy 450 kcal\nSugar 28g"
    res = await nlp_service.extract_from_ocr(case)
    assert res.metrology.mrp is None
    assert res.metrology.best_before is None
