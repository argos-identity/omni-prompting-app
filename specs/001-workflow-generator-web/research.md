# Research: Workflow Generator Web Service

**Feature**: 001-workflow-generator-web
**Date**: 2025-11-27
**Status**: Complete

## Research Topics

### 1. Document Parsing Libraries

**Decision**: Use `mammoth` for .docx and `pdf-parse` for .pdf

**Rationale**:
- `mammoth` (v1.8.0): Lightweight DOCX-to-text converter, well-maintained, pure JavaScript
- `pdf-parse` (v1.1.1): Built on pdf.js, handles PDF text extraction reliably
- Both libraries work in Node.js (Next.js API routes)
- Simple APIs with Promise-based interfaces

**Alternatives Considered**:
| Library | Pros | Cons | Decision |
|---------|------|------|----------|
| docx-parser | Native .docx support | Less maintained, complex API | Rejected |
| pdf-lib | Full PDF manipulation | Overkill for text extraction only | Rejected |
| pdfjs-dist | Official Mozilla lib | Complex setup, larger bundle | Rejected |
| mammoth | Simple, well-documented | Only handles docx (not doc) | Selected |
| pdf-parse | Simple Promise API | Older but stable | Selected |

**Note on .doc files**: The classic .doc format (pre-2007) is binary and complex. Options:
1. Require conversion to .docx (recommended - simplest)
2. Use LibreOffice/unoconv server-side (complex deployment)
3. Use antiword CLI tool (requires system dependency)

**Recommendation**: Accept only .docx (not legacy .doc) or require users to save as .docx

### 2. Claude API Integration (Anthropic SDK)

**Decision**: Use `@anthropic-ai/sdk` official TypeScript SDK

**Rationale**:
- Official SDK with full TypeScript types
- Supports streaming responses (useful for long generations)
- Built-in rate limiting and retry logic
- Direct Claude Opus 4.5 model access via `claude-opus-4-5-20251101`

**Implementation Pattern**:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Per constitution: token logging, error handling, rate limiting
const response = await client.messages.create({
  model: 'claude-opus-4-5-20251101',
  max_tokens: 8192,
  system: systemPrompt,
  messages: [{ role: 'user', content: userPrompt }],
});

// Log token usage (constitution requirement)
console.log(`Tokens: ${response.usage.input_tokens} in / ${response.usage.output_tokens} out`);
```

**Alternatives Considered**:
| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Official SDK | Type-safe, maintained | None significant | Selected |
| fetch API direct | No dependency | Manual types, no retry | Rejected |
| langchain | Many integrations | Overkill for single LLM | Rejected |

### 3. Next.js 15 App Router Patterns

**Decision**: Use App Router with Server Components default, Client Components for interactivity

**Rationale**:
- Constitution Principle I requires App Router
- Server Components for initial render (prompt loading)
- Client Components for editors and file upload (user interaction)
- Route Handlers for API endpoints

**Page Architecture**:
```
app/page.tsx (Server Component)
├── Loads initial prompt content server-side
├── Renders layout shell
└── Hydrates with client components:
    ├── PromptEditor (Client) - "use client"
    ├── FileUpload (Client) - "use client"
    └── WorkflowOutput (Client) - "use client"
```

**API Routes**:
- `POST /api/generate` - Workflow generation (streaming optional)
- `GET /api/prompts?type=system|meta` - Load prompt content
- `PUT /api/prompts` - Save prompt changes

### 4. File Upload Handling

**Decision**: Client-side validation + Server-side processing via FormData

**Rationale**:
- HTML5 File API for client-side validation (type, size)
- FormData submission to Route Handler
- Server-side parsing in API route

**Flow**:
1. User selects file → Client validates extension (.doc, .txt, .md, .pdf)
2. Client validates size (< 10MB)
3. FormData POST to `/api/generate`
4. Server extracts text based on MIME type
5. Server sends to Claude API
6. Response streamed/returned to client

**Supported MIME Types**:
| Extension | MIME Type | Parser |
|-----------|-----------|--------|
| .txt | text/plain | Direct read |
| .md | text/markdown | Direct read |
| .pdf | application/pdf | pdf-parse |
| .docx | application/vnd.openxmlformats-officedocument.wordprocessingml.document | mammoth |

### 5. State Management for Unsaved Changes

**Decision**: React hooks with `beforeunload` event listener

**Rationale**:
- No external state library needed for simple single-page app
- `useState` for prompt content tracking
- `useCallback` for debounced auto-detection
- Browser `beforeunload` for navigation warnings

**Implementation Pattern**:
```typescript
const [isDirty, setIsDirty] = useState(false);
const [content, setContent] = useState(initialContent);

useEffect(() => {
  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  };
  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [isDirty]);
```

### 6. Clipboard API for Copy Function

**Decision**: Use modern Clipboard API with fallback

**Rationale**:
- `navigator.clipboard.writeText()` is standard in all modern browsers
- Requires HTTPS or localhost (Next.js dev server works)
- Fallback to `document.execCommand('copy')` for older browsers

**Browser Support**:
| Browser | Clipboard API Support |
|---------|----------------------|
| Chrome 66+ | Full support |
| Firefox 63+ | Full support |
| Safari 13.1+ | Full support |
| Edge 79+ | Full support |

### 7. UI Component Library Setup

**Decision**: Radix UI primitives with TailwindCSS

**Rationale**:
- Constitution Principle III mandates Radix UI + TailwindCSS
- Use @radix-ui/react-* packages for primitives
- shadcn/ui compatible approach (but manual implementation per constitution)

**Required Radix Packages**:
- `@radix-ui/react-toast` - Success/error notifications
- `@radix-ui/react-scroll-area` - Scrollable text areas
- `@radix-ui/react-separator` - Panel dividers
- `@radix-ui/react-slot` - Component composition

**Icons**: `lucide-react` for all iconography (Copy, Upload, Save, Loader icons)

## Resolved Clarifications

| Topic | Resolution | Source |
|-------|------------|--------|
| .doc support | Support .docx only, not legacy .doc | Research finding - complexity vs value |
| State management | React hooks only | Simplicity principle |
| Database requirement | None - file system only | Spec assumption |
| Authentication | None required | Spec single-user assumption |
| Streaming response | Optional enhancement | Basic polling sufficient for MVP |

## Dependencies Summary

```json
{
  "dependencies": {
    "@anthropic-ai/sdk": "^0.32.0",
    "@radix-ui/react-scroll-area": "^1.2.0",
    "@radix-ui/react-separator": "^1.1.0",
    "@radix-ui/react-slot": "^1.1.0",
    "@radix-ui/react-toast": "^1.2.0",
    "lucide-react": "^0.460.0",
    "mammoth": "^1.8.0",
    "pdf-parse": "^1.1.1",
    "zod": "^3.23.0"
  },
  "devDependencies": {
    "@types/pdf-parse": "^1.1.4"
  }
}
```

## Open Questions (None)

All technical questions resolved. Ready for Phase 1 design.
