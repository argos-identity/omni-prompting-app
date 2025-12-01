<!--
=============================================================================
SYNC IMPACT REPORT
=============================================================================
Version Change: 0.0.0 → 1.0.0 (Initial constitution creation)

Modified Principles: N/A (Initial creation)

Added Sections:
- Core Principles (5 principles defined)
- Technology Stack section
- Code Standards section
- Governance section

Removed Sections: N/A (Initial creation)

Templates Requiring Updates:
- .specify/templates/plan-template.md ✅ Compatible (Constitution Check section exists)
- .specify/templates/spec-template.md ✅ Compatible (Requirements format aligns)
- .specify/templates/tasks-template.md ✅ Compatible (Phase structure aligns)

Follow-up TODOs: None
=============================================================================
-->

# Omni Prompting Test Constitution

## Core Principles

### I. Next.js App Router First
All page routing and data fetching MUST leverage Next.js 15 App Router conventions.
Server Components are the default; Client Components require explicit `"use client"`
directive with documented justification. API routes use Route Handlers in `app/api/`.

**Rationale**: App Router provides optimal performance through server-side rendering,
streaming, and built-in data caching. Consistent patterns reduce cognitive load.

### II. Type Safety Mandate
TypeScript MUST be used for all application code. `any` type is prohibited except
when interfacing with untyped third-party libraries (requires inline comment
justification). Strict mode enabled in `tsconfig.json`. Zod schemas SHOULD validate
all external data boundaries (API responses, form inputs, environment variables).

**Rationale**: Type safety catches errors at compile time, improves IDE support,
and serves as living documentation for data structures.

### III. Component Architecture
UI components MUST use Radix UI primitives for accessibility-critical elements
(dialogs, dropdowns, tooltips). Custom components MUST follow composition pattern.
Styling uses TailwindCSS utility classes exclusively; no CSS modules or styled-components.
Lucide React for all iconography.

**Rationale**: Radix provides WCAG-compliant primitives. TailwindCSS enables consistent
design tokens and eliminates CSS specificity conflicts.

### IV. LLM Integration Standards
Claude Opus 4.5 is the designated LLM. All LLM calls MUST include:
- Explicit system prompts stored in version control
- Token usage logging for cost monitoring
- Error handling with graceful degradation
- Rate limiting at application boundary

**Rationale**: LLM costs and behavior must be observable and controllable.
Prompts as code enables versioning and review.

### V. Testing Discipline
Critical paths MUST have integration tests. UI components SHOULD have visual
regression coverage. Tests run on PR via CI. Test files colocated with source
using `*.test.ts(x)` or `*.spec.ts(x)` naming.

**Rationale**: Tests protect against regressions and document expected behavior.
Colocation improves discoverability.

## Technology Stack

| Category | Technology | Version |
|----------|------------|---------|
| Framework | Next.js | 15.3.5 |
| UI Library | React | 19 |
| Language | TypeScript | Latest stable |
| Styling | TailwindCSS | Latest stable |
| Components | Radix UI | Latest stable |
| Icons | Lucide React | Latest stable |
| LLM | Claude Opus 4.5 | API |
| Package Manager | pnpm (preferred) / npm | Latest stable |

## Code Standards

### Naming Conventions

| Convention | Application |
|------------|-------------|
| `kebab-case` | URL paths, folder names, file names |
| `camelCase` | Variables, functions, request/response parameters |
| `UPPER_SNAKE_CASE` | Constants, environment variables |
| `PascalCase` | Classes, interfaces, types, React components |

### File Organization

```text
app/                    # Next.js App Router pages and layouts
├── api/               # Route Handlers (API endpoints)
├── (routes)/          # Route groups
└── layout.tsx         # Root layout

components/            # Reusable UI components
├── ui/               # Radix-based primitives
└── [feature]/        # Feature-specific components

lib/                   # Utilities and shared logic
├── api/              # API client functions
├── llm/              # LLM integration utilities
└── utils/            # General utilities

types/                 # TypeScript type definitions
```

### Import Order

1. React/Next.js imports
2. Third-party libraries
3. Internal aliases (`@/components`, `@/lib`)
4. Relative imports
5. Type imports (grouped with `type` keyword)

## Governance

This constitution supersedes all other development practices for this project.
Amendments require:

1. Written proposal documenting change rationale
2. Impact assessment on existing code
3. Migration plan if breaking changes introduced
4. Version increment following semantic versioning:
   - MAJOR: Breaking governance/principle changes
   - MINOR: New principles or expanded guidance
   - PATCH: Clarifications and non-semantic updates

All pull requests MUST verify compliance with these principles. Deviations require
explicit justification in PR description with constitution principle reference.

Complexity additions (new dependencies, architectural patterns) MUST be justified
against simpler alternatives per the Complexity Tracking section in plan templates.

**Version**: 1.0.0 | **Ratified**: 2025-11-27 | **Last Amended**: 2025-11-27
