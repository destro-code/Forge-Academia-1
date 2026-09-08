# Authoritative Curriculum Inventory

- **Source File**: `src/data/lessons.json` (READ-ONLY)
- **Source SHA256**: `5edde0b667d2574f355d4edcb5ed531a6b47590c6f63ce9c9e830732cf577523`
- **Total Discovered**: 96
- **Total Inventoried**: 96
- **Missing**: 0
- **Duplicate IDs**: 0
- **Unresolved References**: 0
- **Canonical Count**: 27
- **Legacy-Only Count**: 69
- **Coverage**: 100%

## Summary
The master inventory maps all 96 legacy lessons across their respective modules, topics, levels, and prerequisites. It tracks transformation status between `LEGACY_ONLY` and `CANONICAL`.

The legacy `lessons.json` file is treated as a read-only source archive. Canonical transformations write strictly to `src/data/canonical/lessons/`.
