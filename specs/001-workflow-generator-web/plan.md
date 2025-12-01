# Implementation Plan: Workflow Generator Web Service

**Branch**: `001-workflow-generator-web` | **Date**: 2025-11-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-workflow-generator-web/spec.md`

## Summary

Build a web service that generates AI verification workflows (workflow.md) from policy documents. The application provides a three-panel interface: system-prompt editor (upper-left), meta-prompt editor (lower-left), and read-only workflow output (right). Users upload policy documents (.doc, .txt, .md, .pdf) which are processed through Claude Opus 4.5 to produce structured workflow files combining the configured prompts with policy analysis.

## Technical Context

**Language/Version**: TypeScript (Latest stable, strict mode)
**Framework**: Next.js 15.3.5 with App Router
**UI Library**: React 19
**Styling**: TailwindCSS
**Components**: Radix UI primitives, Lucide React icons
**Primary Dependencies**: @anthropic-ai/sdk (Claude API), pdf-parse, mammoth (docx parsing)
**Storage**: File system for prompts (./prompt/), no database required
**Testing**: Jest + React Testing Library for unit tests, Playwright for E2E
**Target Platform**: Web (modern browsers: Chrome, Firefox, Safari, Edge)
**Project Type**: Web application (Next.js full-stack)
**Performance Goals**: Workflow generation <60s for documents under 20 pages
**Constraints**: Max 10MB file upload, single-user sessions
**Scale/Scope**: Single-page application, 4 main user stories

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Implementation Approach |
|-----------|--------|------------------------|
| I. Next.js App Router First | PASS | App Router for routing, Server Components default, Route Handlers for API |
| II. Type Safety Mandate | PASS | TypeScript strict mode, Zod for API validation, no `any` types |
| III. Component Architecture | PASS | Radix UI for accessible editors/dialogs, TailwindCSS styling, Lucide icons |
| IV. LLM Integration Standards | PASS | System prompts in version control, token logging, error handling, rate limiting |
| V. Testing Discipline | PASS | Integration tests for workflow generation, collocated test files |

**Gate Status**: All principles satisfied. No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/001-workflow-generator-web/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API contracts)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
app/
├── api/
│   ├── prompts/
│   │   └── route.ts          # GET/PUT prompts (system/meta)
│   └── generate/
│       └── route.ts          # POST workflow generation
├── page.tsx                  # Main page (Server Component)
├── layout.tsx                # Root layout
└── globals.css               # Tailwind base styles

components/
├── ui/
│   ├── button.tsx            # Radix Button wrapper
│   ├── textarea.tsx          # Radix TextArea wrapper
│   ├── toast.tsx             # Radix Toast for notifications
│   └── loading-spinner.tsx   # Loading indicator
├── prompt-editor/
│   ├── prompt-editor.tsx     # Editable prompt panel (Client Component)
│   └── use-prompt.ts         # Custom hook for prompt state
├── workflow-output/
│   ├── workflow-output.tsx   # Read-only output panel (Client Component)
│   └── copy-button.tsx       # Copy to clipboard button
└── file-upload/
    ├── file-upload.tsx       # Document upload component
    └── use-file-upload.ts    # File handling hook

lib/
├── llm/
│   ├── claude-client.ts      # Anthropic SDK wrapper with logging
│   ├── workflow-generator.ts # Workflow generation logic
│   └── token-logger.ts       # Token usage tracking
├── parsers/
│   ├── pdf-parser.ts         # PDF text extraction
│   ├── docx-parser.ts        # DOCX text extraction
│   └── text-parser.ts        # TXT/MD passthrough
├── api/
│   └── prompts.ts            # Prompt file operations
└── utils/
    ├── file-validators.ts    # File type validation
    └── clipboard.ts          # Clipboard utilities

types/
├── prompts.ts                # Prompt types
├── workflow.ts               # Workflow types
└── api.ts                    # API request/response types

prompt/                       # Existing prompt files (preserved)
├── system-prompt.md
└── meta-prompt.md

tests/
├── integration/
│   └── workflow-generation.test.ts
└── unit/
    ├── parsers/
    └── components/
```

**Structure Decision**: Next.js App Router structure with `app/` for routes, `components/` for UI, `lib/` for utilities. This follows the constitution's file organization standards and keeps prompt files in their existing location (`./prompt/`).

## Complexity Tracking

> No complexity violations identified. All requirements can be met with the specified technology stack.

| Item | Decision | Rationale |
|------|----------|-----------|
| File parsing libraries | mammoth + pdf-parse | Standard, well-maintained libraries for document text extraction |
| State management | React hooks (useState/useCallback) | Simple enough for single-page app; no Redux needed |
| Storage | File system only | No database needed per spec; prompts stored as markdown files |
