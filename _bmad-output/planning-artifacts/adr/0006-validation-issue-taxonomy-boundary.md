# Validation Issue Taxonomy Boundary（验证问题分类契约边界）

SpecLite separates the public JSON shape of `ValidationIssue` from the taxonomy that gives each category and issue id semantic meaning. `_bmad-output/planning-artifacts/specs/01-command-result-json-contract.md` owns the JSON shape. `_bmad-output/planning-artifacts/specs/07-validation-issue-taxonomy.md` owns category boundaries, issue id rules, default severity guidance, and validation fixture ownership.

This decision prevents individual validation rules from inventing category meanings or dynamic issue ids. It also keeps fixture assertions stable: adding a new category requires updating the taxonomy first, and adding a new issue id requires fixture coverage in the same change.

