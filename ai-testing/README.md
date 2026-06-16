# AI-Assisted Test Design

This folder contains design artifacts generated with AI assistance.
They are **not wired to a test runner** — they are inputs to the
test authoring process, not executable tests.

## Contents

### gherkin/login.feature
BDD-style feature file used to define test scope for the login module.
The scenarios here were used as a specification to write the automated
tests in `tests/ui/login.spec.js`.

### prompts/generate-negative-tests.txt
Prompt used with Claude to generate negative test scenarios for the
checkout flow. The output was reviewed and implemented manually in
`tests/ui/login.spec.js` and `tests/integration/`.

## Workflow
1. Write or generate a Gherkin feature file to define scope
2. Use the prompt file with an AI assistant to generate test ideas
3. Review, refine, and implement as Playwright specs
4. The feature file acts as living documentation of what is covered