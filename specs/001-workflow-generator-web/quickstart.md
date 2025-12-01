# Quickstart: Workflow Generator Web Service

**Feature**: 001-workflow-generator-web
**Date**: 2025-11-27

## Prerequisites

- Node.js 18.17+ (for Next.js 15)
- pnpm (preferred) or npm
- Anthropic API key for Claude Opus 4.5

## Setup

### 1. Install Dependencies

```bash
# Using pnpm (preferred)
pnpm install

# Or using npm
npm install
```

### 2. Configure Environment

Create `.env.local` at project root:

```env
# Required: Anthropic API key
ANTHROPIC_API_KEY=sk-ant-your-api-key-here
```

### 3. Verify Prompt Files

Ensure prompt files exist at:
- `./prompt/system-prompt.md`
- `./prompt/meta-prompt.md`

### 4. Start Development Server

```bash
# Using pnpm
pnpm dev

# Or using npm
npm run dev
```

Application runs at `http://localhost:3000`

## Usage

### Generate a Workflow

1. **Open the application** in your browser
2. **Review the prompts**:
   - Upper-left panel: System prompt (agent configuration)
   - Lower-left panel: Meta prompt (workflow template)
3. **Upload a policy document**:
   - Click the upload area or drag-and-drop
   - Supported formats: .txt, .md, .pdf, .docx
   - Maximum size: 10MB
4. **Wait for generation** (typically 30-60 seconds)
5. **View and copy the result**:
   - Right panel shows generated workflow.md
   - Click "Copy" button to copy to clipboard

### Edit Prompts

1. **Modify content** in either editor panel
2. **Click "Save"** to persist changes
3. Changes apply to subsequent generations
4. **Warning**: Unsaved changes trigger browser confirmation on navigation

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/prompts?type=system` | GET | Get system prompt content |
| `/api/prompts?type=meta` | GET | Get meta prompt content |
| `/api/prompts` | PUT | Save prompt content |
| `/api/generate` | POST | Generate workflow from document |

## File Structure

```
.
├── app/
│   ├── api/
│   │   ├── prompts/route.ts    # Prompt CRUD API
│   │   └── generate/route.ts   # Workflow generation API
│   ├── page.tsx                # Main page
│   └── layout.tsx              # Root layout
├── components/
│   ├── ui/                     # Radix UI primitives
│   ├── prompt-editor/          # Editable prompt panels
│   ├── workflow-output/        # Read-only output panel
│   └── file-upload/            # Document upload
├── lib/
│   ├── llm/                    # Claude API integration
│   ├── parsers/                # Document text extraction
│   └── utils/                  # Utilities
├── types/                      # TypeScript definitions
└── prompt/                     # Prompt markdown files
    ├── system-prompt.md
    └── meta-prompt.md
```

## Common Issues

### "ANTHROPIC_API_KEY not configured"

Ensure `.env.local` exists with valid API key.

### "Invalid file type"

Only .txt, .md, .pdf, and .docx files are supported.

### "File too large"

Documents must be under 10MB.

### "Generation timeout"

Large documents (100+ pages) may exceed timeout. Try a smaller document or excerpt.

### "Rate limited"

Too many requests to Claude API. Wait a moment and retry.

## Testing

```bash
# Run unit tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Type check
pnpm typecheck
```

## Build for Production

```bash
# Build
pnpm build

# Start production server
pnpm start
```

## Related Documentation

- [Feature Specification](./spec.md)
- [Implementation Plan](./plan.md)
- [Research Notes](./research.md)
- [Data Model](./data-model.md)
- [API Contracts](./contracts/api.yaml)
