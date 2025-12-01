# Tasks: Workflow Generator Web Service

**Input**: Design documents from `/specs/001-workflow-generator-web/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 테스트는 스펙에서 명시적으로 요청하지 않았으므로 선택사항입니다.

**Organization**: 사용자 스토리별로 그룹화하여 독립적 구현 및 테스트 가능

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 병렬 실행 가능 (다른 파일, 의존성 없음)
- **[Story]**: 해당 사용자 스토리 (US1, US2, US3, US4)
- 정확한 파일 경로 포함

## Path Conventions

- **Framework**: Next.js 15.3.5 App Router
- **구조**: `app/`, `components/`, `lib/`, `types/`

---

## Phase 1: Setup (공유 인프라)

**Purpose**: 프로젝트 초기화 및 기본 구조 설정

- [ ] T001 Next.js 15.3.5 프로젝트 생성 with TypeScript strict mode
- [ ] T002 [P] TailwindCSS 설정 in tailwind.config.ts
- [ ] T003 [P] 환경 변수 설정 (.env.local.example with ANTHROPIC_API_KEY)
- [ ] T004 [P] 필수 의존성 설치 (@anthropic-ai/sdk, @radix-ui/*, lucide-react, mammoth, pdf-parse, zod)
- [ ] T005 TypeScript path aliases 설정 (@/components, @/lib, @/types) in tsconfig.json

---

## Phase 2: Foundational (블로킹 전제조건)

**Purpose**: 모든 사용자 스토리에 필요한 핵심 인프라

**⚠️ CRITICAL**: 이 단계가 완료되기 전까지 사용자 스토리 작업을 시작할 수 없습니다

### Types & Schemas

- [ ] T006 [P] TypeScript 타입 정의 in types/prompts.ts (PromptContent, PromptType)
- [ ] T007 [P] TypeScript 타입 정의 in types/workflow.ts (GeneratedWorkflow, TokenUsage)
- [ ] T008 [P] TypeScript 타입 정의 in types/api.ts (GenerationRequest, GenerationResponse, ErrorCode)
- [ ] T009 Zod 스키마 구현 in lib/schemas.ts (data-model.md 기반)

### UI Primitives

- [ ] T010 [P] Button 컴포넌트 구현 (Radix UI 기반) in components/ui/button.tsx
- [ ] T011 [P] Textarea 컴포넌트 구현 (Radix UI ScrollArea 기반) in components/ui/textarea.tsx
- [ ] T012 [P] Toast 컴포넌트 구현 (Radix UI Toast) in components/ui/toast.tsx
- [ ] T013 [P] LoadingSpinner 컴포넌트 구현 (Lucide Loader2 아이콘) in components/ui/loading-spinner.tsx

### Core Utilities

- [ ] T014 [P] 파일 검증 유틸리티 구현 in lib/utils/file-validators.ts (확장자, 크기, MIME 타입)
- [ ] T015 [P] 클립보드 유틸리티 구현 in lib/utils/clipboard.ts (Clipboard API + fallback)

### Document Parsers

- [ ] T016 [P] PDF 파서 구현 (pdf-parse 사용) in lib/parsers/pdf-parser.ts
- [ ] T017 [P] DOCX 파서 구현 (mammoth 사용) in lib/parsers/docx-parser.ts
- [ ] T018 [P] TXT/MD 파서 구현 in lib/parsers/text-parser.ts
- [ ] T019 통합 파서 팩토리 구현 in lib/parsers/index.ts (MIME 타입별 라우팅)

### LLM Infrastructure

- [ ] T020 토큰 로거 구현 in lib/llm/token-logger.ts (헌법 IV 원칙 준수)
- [ ] T021 Claude 클라이언트 래퍼 구현 in lib/llm/claude-client.ts (@anthropic-ai/sdk 사용)

### Prompt File Operations

- [ ] T022 프롬프트 파일 읽기/쓰기 유틸리티 구현 in lib/api/prompts.ts

### Layout Setup

- [ ] T023 루트 레이아웃 구현 in app/layout.tsx (TailwindCSS, 폰트, 메타데이터)
- [ ] T024 글로벌 스타일 설정 in app/globals.css

**Checkpoint**: 기반 인프라 완료 - 사용자 스토리 구현 시작 가능

---

## Phase 3: User Story 1 - 정책 문서로 워크플로우 생성 (Priority: P1) 🎯 MVP

**Goal**: 정책 문서를 업로드하여 workflow.md 생성

**Independent Test**: 샘플 정책 문서 업로드 후 오른쪽 패널에 유효한 workflow.md 출력 확인

### Implementation for User Story 1

- [ ] T025 [US1] 워크플로우 생성 로직 구현 in lib/llm/workflow-generator.ts
- [ ] T026 [US1] 워크플로우 생성 API 라우트 구현 (POST /api/generate) in app/api/generate/route.ts
- [ ] T027 [P] [US1] 파일 업로드 훅 구현 in components/file-upload/use-file-upload.ts
- [ ] T028 [US1] 파일 업로드 컴포넌트 구현 in components/file-upload/file-upload.tsx
- [ ] T029 [US1] 워크플로우 출력 패널 컴포넌트 구현 in components/workflow-output/workflow-output.tsx
- [ ] T030 [US1] 메인 페이지 3패널 레이아웃 구현 in app/page.tsx
- [ ] T031 [US1] 에러 처리 및 로딩 상태 UI 추가 in components/workflow-output/workflow-output.tsx

**Checkpoint**: User Story 1 완료 - 정책 문서 업로드 및 워크플로우 생성 가능

---

## Phase 4: User Story 2 - 시스템 프롬프트 편집/저장 (Priority: P2)

**Goal**: 상단 왼쪽 패널에서 system-prompt.md 편집 및 저장

**Independent Test**: 시스템 프롬프트 수정 후 저장, 페이지 새로고침 시 변경사항 유지 확인

### Implementation for User Story 2

- [ ] T032 [US2] 프롬프트 API 라우트 구현 (GET/PUT /api/prompts) in app/api/prompts/route.ts
- [ ] T033 [P] [US2] 프롬프트 상태 관리 훅 구현 in components/prompt-editor/use-prompt.ts
- [ ] T034 [US2] 프롬프트 에디터 컴포넌트 구현 in components/prompt-editor/prompt-editor.tsx
- [ ] T035 [US2] 저장되지 않은 변경사항 경고 기능 추가 (beforeunload 이벤트) in components/prompt-editor/prompt-editor.tsx
- [ ] T036 [US2] 메인 페이지에 시스템 프롬프트 에디터 통합 in app/page.tsx

**Checkpoint**: User Story 2 완료 - 시스템 프롬프트 편집/저장 가능

---

## Phase 5: User Story 3 - 메타 프롬프트 편집/저장 (Priority: P2)

**Goal**: 하단 왼쪽 패널에서 meta-prompt.md 편집 및 저장

**Independent Test**: 메타 프롬프트 수정 후 저장, 다음 워크플로우 생성 시 반영 확인

### Implementation for User Story 3

- [ ] T037 [US3] 메인 페이지에 메타 프롬프트 에디터 통합 (prompt-editor 컴포넌트 재사용) in app/page.tsx
- [ ] T038 [US3] 왼쪽 패널 분할 레이아웃 조정 (상단: 시스템, 하단: 메타) in app/page.tsx

**Checkpoint**: User Story 3 완료 - 메타 프롬프트 편집/저장 가능

---

## Phase 6: User Story 4 - 생성된 워크플로우 복사 (Priority: P3)

**Goal**: 오른쪽 패널의 읽기 전용 워크플로우를 클립보드로 복사

**Independent Test**: 워크플로우 생성 후 복사 버튼 클릭, 다른 앱에 붙여넣기 확인

### Implementation for User Story 4

- [ ] T039 [P] [US4] 복사 버튼 컴포넌트 구현 in components/workflow-output/copy-button.tsx
- [ ] T040 [US4] 복사 성공 토스트 알림 통합 in components/workflow-output/workflow-output.tsx
- [ ] T041 [US4] 읽기 전용 텍스트 영역 스타일링 확정 in components/workflow-output/workflow-output.tsx

**Checkpoint**: User Story 4 완료 - 워크플로우 복사 기능 사용 가능

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 전체 스토리에 영향을 미치는 개선사항

- [ ] T042 [P] 반응형 레이아웃 최적화 (모바일/태블릿) in app/page.tsx
- [ ] T043 [P] 접근성 검토 및 ARIA 속성 추가 in components/**/*.tsx
- [ ] T044 에러 경계 구현 in app/error.tsx
- [ ] T045 [P] 로딩 UI 개선 in app/loading.tsx
- [ ] T046 quickstart.md 검증 실행 및 문서 업데이트
- [ ] T047 코드 정리 및 주석 추가

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 의존성 없음 - 즉시 시작 가능
- **Foundational (Phase 2)**: Setup 완료 필요 - 모든 사용자 스토리 블로킹
- **User Stories (Phase 3-6)**: Foundational 완료 필요
  - US1 → US2 → US3 순차 또는 병렬 가능
  - US4는 US1 완료 후 가능 (워크플로우 출력 필요)
- **Polish (Phase 7)**: 원하는 사용자 스토리 완료 후

### User Story Dependencies

```
Phase 2 (Foundational)
        │
        ├───────────────────────────────────┐
        │                                   │
        v                                   v
   US1 (P1) ─────────────────────────> US4 (P3)
        │                          (US1 워크플로우 출력 필요)
        │
        ├──> US2 (P2) ──> US3 (P2)
        │    (프롬프트 API 공유)
        │
        v
   Polish (Phase 7)
```

### Within Each User Story

- 타입/스키마 → 유틸리티 → 컴포넌트 → 페이지 통합
- API 라우트 → 훅 → UI 컴포넌트
- 스토리 완료 후 다음 우선순위로 이동

### Parallel Opportunities

- Phase 1: T002, T003, T004 병렬 가능
- Phase 2: T006-T008, T010-T013, T014-T018 각각 병렬 가능
- Phase 3: T027 병렬 가능
- Phase 4: T033 병렬 가능
- Phase 6: T039 병렬 가능
- Phase 7: T042, T043, T045 병렬 가능

---

## Parallel Example: Phase 2 Foundational

```bash
# Types 병렬 생성:
Task: "TypeScript 타입 정의 in types/prompts.ts"
Task: "TypeScript 타입 정의 in types/workflow.ts"
Task: "TypeScript 타입 정의 in types/api.ts"

# UI Primitives 병렬 생성:
Task: "Button 컴포넌트 in components/ui/button.tsx"
Task: "Textarea 컴포넌트 in components/ui/textarea.tsx"
Task: "Toast 컴포넌트 in components/ui/toast.tsx"
Task: "LoadingSpinner 컴포넌트 in components/ui/loading-spinner.tsx"

# Parsers 병렬 생성:
Task: "PDF 파서 in lib/parsers/pdf-parser.ts"
Task: "DOCX 파서 in lib/parsers/docx-parser.ts"
Task: "TXT/MD 파서 in lib/parsers/text-parser.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1만)

1. Phase 1 완료: Setup
2. Phase 2 완료: Foundational (핵심 - 모든 스토리 블로킹)
3. Phase 3 완료: User Story 1
4. **중지 및 검증**: User Story 1 독립 테스트
5. 준비되면 배포/데모

### Incremental Delivery

1. Setup + Foundational 완료 → 기반 준비
2. User Story 1 추가 → 독립 테스트 → 배포/데모 (MVP!)
3. User Story 2 추가 → 독립 테스트 → 배포/데모
4. User Story 3 추가 → 독립 테스트 → 배포/데모
5. User Story 4 추가 → 독립 테스트 → 배포/데모
6. 각 스토리는 이전 스토리를 깨뜨리지 않고 가치 추가

### Parallel Team Strategy

여러 개발자가 있을 경우:

1. 팀이 Setup + Foundational 함께 완료
2. Foundational 완료 후:
   - 개발자 A: User Story 1
   - 개발자 B: User Story 2 + 3
   - 개발자 C: (US1 완료 대기 후) User Story 4
3. 스토리들이 독립적으로 완료 및 통합

---

## Notes

- [P] 작업 = 다른 파일, 의존성 없음
- [Story] 라벨은 작업을 특정 사용자 스토리에 매핑
- 각 사용자 스토리는 독립적으로 완료 및 테스트 가능
- 각 작업 또는 논리적 그룹 후 커밋
- 체크포인트에서 멈추고 스토리 독립적으로 검증 가능
- 피해야 할 것: 모호한 작업, 같은 파일 충돌, 독립성을 깨는 교차 스토리 의존성
