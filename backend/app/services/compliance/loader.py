"""
Loads rules/*.yaml into typed RuleSchema/ExemptionSchema objects, and runs
each rule's embedded test_cases immediately -- so a rule that would silently
misfire during a demo instead crashes at import time with a clear message.
"""

from __future__ import annotations

from pathlib import Path

import yaml

from .schema import ExemptionSchema, RuleSchema

RULES_DIR = Path(__file__).resolve().parent / "rules"
EXEMPTION_FILES = {"exemptions.yaml"}


def load_rules(rules_dir: Path = RULES_DIR, run_self_tests: bool = True) -> list[RuleSchema]:
    rules: list[RuleSchema] = []
    seen_ids: set[str] = set()

    for path in sorted(rules_dir.glob("*.yaml")):
        if path.name in EXEMPTION_FILES:
            continue
        raw_entries = yaml.safe_load(path.read_text()) or []
        for raw in raw_entries:
            rule = RuleSchema(**raw)
            if rule.id in seen_ids:
                raise ValueError(f"Duplicate rule id '{rule.id}' in {path.name}")
            seen_ids.add(rule.id)
            rules.append(rule)

    if run_self_tests:
        _run_self_tests(rules)

    return rules


def load_exemptions(rules_dir: Path = RULES_DIR) -> list[ExemptionSchema]:
    exemptions: list[ExemptionSchema] = []
    for filename in EXEMPTION_FILES:
        path = rules_dir / filename
        if not path.exists():
            continue
        raw_entries = yaml.safe_load(path.read_text()) or []
        exemptions.extend(ExemptionSchema(**raw) for raw in raw_entries)
    return exemptions


def _run_self_tests(rules: list[RuleSchema]) -> None:
    from .validator import evaluate_single_rule

    failures = []
    for rule in rules:
        for tc in rule.test_cases:
            status, *_ = evaluate_single_rule(rule, tc.fields)
            if status != tc.expect_status:
                failures.append(
                    f"{rule.id} :: test '{tc.name}' expected status="
                    f"'{tc.expect_status}' but got '{status}'"
                )
    if failures:
        raise AssertionError(
            "Rule self-tests failed on load -- fix before deploying:\n  "
            + "\n  ".join(failures)
        )


if __name__ == "__main__":
    loaded_rules = load_rules()
    loaded_exemptions = load_exemptions()
    total_tests = sum(len(r.test_cases) for r in loaded_rules)
    print(
        f"Loaded {len(loaded_rules)} rules, {len(loaded_exemptions)} exemption "
        f"groups. {total_tests} embedded self-tests passed."
    )