---
description: Explain code structure, logic, and data flow in detail. Use when the user asks to explain, understand, or walk through code.
---

# Code Explanation Skill

When explaining code, follow this structure:

## 1. Overview
- What does this code do? (one sentence)
- Where does it fit in the project?

## 2. Key Components
For each major function/class/module:
- **Purpose**: What it does
- **Inputs**: Parameters and their types
- **Outputs**: Return values
- **Side effects**: File I/O, network calls, state changes

## 3. Data Flow
Trace the data from entry to exit:
1. Input arrives here...
2. Gets transformed by...
3. Passed to...
4. Result returned as...

## 4. Dependencies
- What external modules/files does this code depend on?
- What depends on this code?

## 5. Key Decisions
- Why was it written this way? (if apparent)
- Any tradeoffs or patterns used?

Use Read, Glob, and Grep to examine the code before explaining. Always reference specific file:line locations.
