# Feature Specification: Workflow Generator Web Service

**Feature Branch**: `001-workflow-generator-web`
**Created**: 2025-11-27
**Updated**: 2025-12-17
**Status**: Complete
**Input**: User description: "Web service to generate workflow.md using system-prompt.md and meta-prompt.md with policy document upload capability"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Generate Workflow from Policy Document (Priority: P1)

A compliance officer uploads a policy document (.docx, .txt, .md, or .pdf) to generate a structured workflow.md file. The system uses the configured system-prompt and meta-prompt templates combined with Claude Opus 4.5 to analyze the policy and produce a verification workflow.

**Why this priority**: This is the core value proposition - transforming policy documents into executable AI workflows. Without this, the application has no purpose.

**Independent Test**: Can be fully tested by uploading a sample policy document and verifying that a valid workflow.md output is generated and displayed in the right panel.

**Acceptance Scenarios**:

1. **Given** a user has the web application open with default prompts loaded, **When** they upload a valid .pdf policy document and trigger generation, **Then** the system displays the generated workflow.md content in the right panel within a reasonable time.

2. **Given** a user uploads a .docx file, **When** generation completes, **Then** the workflow.md contains structured XML sections matching the meta-prompt template (core_identity, enterprise_context, action_workflow, decision_engine).

3. **Given** a user uploads an unsupported file type (.xlsx), **When** they attempt upload, **Then** the system displays a clear error message indicating only .docx, .txt, .md, and .pdf files are accepted.

---

### User Story 2 - Generate Workflow from URL (Priority: P1)

A compliance officer inputs a URL to a policy webpage. The system fetches the content, extracts policy text using Claude, and generates a structured workflow.md file.

**Why this priority**: URL input extends the platform's utility by allowing users to analyze online policy documents without manual copy-paste.

**Independent Test**: Can be fully tested by inputting a valid URL containing policy content and verifying that a valid workflow.md output is generated.

**Acceptance Scenarios**:

1. **Given** a user has the web application open with the URL input tab selected, **When** they enter a valid HTTP/HTTPS URL and trigger generation, **Then** the system fetches the content and generates a workflow.md.

2. **Given** a user enters an invalid URL format, **When** they attempt generation, **Then** the system displays a clear error message about invalid URL.

3. **Given** a user enters a URL that times out or fails to load, **When** the fetch fails, **Then** the system displays an appropriate error message (URL_FETCH_FAILED or URL_TIMEOUT).

---

### User Story 3 - Edit and Save System Prompt (Priority: P2)

A user views the current system-prompt.md content in the upper-left panel and makes modifications to customize the agent's core identity, operating rules, or script registry. They save their changes for use in subsequent workflow generations.

**Why this priority**: Customizing the system prompt allows users to tailor the AI agent's behavior for different verification domains. This extends the platform's utility beyond the default configuration.

**Independent Test**: Can be tested by modifying the system prompt text, saving, and verifying the changes persist when the page is reloaded.

**Acceptance Scenarios**:

1. **Given** the application loads, **When** the user views the upper-left panel, **Then** the current system-prompt.md content is displayed in an editable text area.

2. **Given** a user modifies the system prompt content, **When** they click the save button, **Then** the changes are persisted and a success confirmation is shown.

3. **Given** a user has unsaved changes, **When** they attempt to navigate away or close the editor, **Then** they receive a warning about unsaved changes.

---

### User Story 4 - Edit and Save Meta Prompt (Priority: P2)

A user views the current meta-prompt.md content in the lower-left panel and modifies the workflow template structure, execution instructions, or output format. They save their changes for use in subsequent generations.

**Why this priority**: The meta-prompt defines the workflow generation logic. Allowing edits enables users to customize output structure for different policy types without code changes.

**Independent Test**: Can be tested by modifying the meta-prompt text, saving, and verifying the saved content is used in the next workflow generation.

**Acceptance Scenarios**:

1. **Given** the application loads, **When** the user views the lower-left panel, **Then** the current meta-prompt.md content is displayed in an editable text area.

2. **Given** a user modifies the meta-prompt content, **When** they click the save button, **Then** the changes are persisted and reflected in subsequent workflow generations.

---

### User Story 5 - Copy Generated Workflow (Priority: P3)

A user views the generated workflow.md in the right panel (read-only) and copies the content to their clipboard for use in other applications or documentation.

**Why this priority**: Once a workflow is generated, users need to export it. Copy functionality is essential for practical usage but depends on generation working first.

**Independent Test**: Can be tested by generating a workflow, clicking the copy button, and pasting the content into another application.

**Acceptance Scenarios**:

1. **Given** a workflow.md has been generated and is displayed, **When** the user clicks the copy button, **Then** the entire workflow content is copied to the system clipboard.

2. **Given** a workflow.md is displayed, **When** the user attempts to edit the content directly, **Then** the text remains read-only (no editing allowed).

3. **Given** the copy action succeeds, **When** complete, **Then** a visual confirmation (toast/indicator) appears to confirm the copy was successful.

---

### Edge Cases

- What happens when the uploaded policy document is empty or contains no extractable text?
- How does system handle extremely large policy documents (e.g., 100+ pages)?
- What happens when the LLM API call fails or times out during generation?
- How does system handle policy documents in languages other than English?
- What happens when both prompt editors have unsaved changes simultaneously?
- What happens if the user's session expires during a long generation process?
- What happens when a URL redirects multiple times?
- What happens when URL content is dynamically loaded via JavaScript?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST display a three-panel layout with system-prompt editor (upper-left), meta-prompt editor (lower-left), and workflow output (right side full height).

- **FR-002**: System MUST accept file uploads limited to .docx, .txt, .md, and .pdf formats only.

- **FR-003**: System MUST reject files with extensions other than the allowed types and display a user-friendly error message.

- **FR-004**: System MUST extract text content from uploaded policy documents for processing.

- **FR-005**: System MUST send the system-prompt, meta-prompt, and extracted policy content to Claude Opus 4.5 for workflow generation.

- **FR-006**: System MUST display the generated workflow.md content in the right panel as read-only text.

- **FR-007**: System MUST provide a copy-to-clipboard function for the generated workflow content.

- **FR-008**: System MUST allow editing of the system-prompt.md content in the upper-left panel.

- **FR-009**: System MUST allow editing of the meta-prompt.md content in the lower-left panel.

- **FR-010**: System MUST provide save functionality for both prompt editors that persists changes.

- **FR-011**: System MUST load the default prompt contents from ./prompt/policy-prompt/system-prompt.md and ./prompt/policy-prompt/meta-prompt.md on initial application load.

- **FR-012**: System MUST display a loading indicator during workflow generation.

- **FR-013**: System MUST handle LLM API errors gracefully with user-friendly error messages.

- **FR-014**: System MUST warn users about unsaved changes before they are lost (navigation/close).

- **FR-015**: System MUST accept URL input as an alternative to file upload.

- **FR-016**: System MUST validate URL format (HTTP/HTTPS only) before attempting to fetch content.

- **FR-017**: System MUST extract policy content from web pages using Claude LLM.

- **FR-018**: System MUST handle URL fetch failures with appropriate error codes (URL_FETCH_FAILED, URL_TIMEOUT, INVALID_URL).

### Key Entities

- **SystemPrompt**: The agent configuration defining core identity, operating rules, script registry, and execution protocol. Stored as markdown content at `./prompt/policy-prompt/system-prompt.md`. Can be modified and saved.

- **MetaPrompt**: The workflow generation template containing role definition, execution instructions, and output template skeleton. Stored as markdown content at `./prompt/policy-prompt/meta-prompt.md`. Can be modified and saved.

- **PolicyDocument**: User-uploaded document containing compliance/verification rules to be analyzed. Supported formats: .docx, .txt, .md, .pdf. Temporary - not persisted after generation.

- **PolicyUrl**: User-provided URL pointing to a policy webpage. System fetches and extracts content. Temporary - not persisted after generation.

- **GeneratedWorkflow**: The output workflow.md content produced by combining prompts with policy analysis through Claude Opus 4.5. Contains actions array, rawContent, workflowMd, and token usage. Read-only display with copy capability.

- **ExtractedPolicyData**: Intermediate data extracted from policy document by 1st LLM call. Contains summary, validationRules, and structuredContent. Displayed to user for transparency.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can upload a policy document and receive a generated workflow within 60 seconds for documents under 20 pages.

- **SC-002**: 95% of valid file uploads (supported formats with extractable text) result in successful workflow generation.

- **SC-003**: Users can complete the full workflow generation process (upload, generate, copy) in under 3 minutes.

- **SC-004**: Prompt edits are saved and persist across browser sessions with 100% reliability.

- **SC-005**: The generated workflow.md follows the meta-prompt template structure with all required XML sections present.

- **SC-006**: Copy functionality works correctly across all major browsers (Chrome, Firefox, Safari, Edge).

- **SC-007**: Users can identify and understand errors within 5 seconds through clear error messaging.

- **SC-008**: URL-based generation completes within 90 seconds for standard web pages.

- **SC-009**: 90% of valid URLs with accessible content result in successful workflow generation.

## Assumptions

- Users have a stable internet connection for LLM API calls.
- Claude Opus 4.5 API is available and properly configured with valid credentials.
- Policy documents are primarily in English (multi-language support is out of scope for initial release).
- Single-user usage per session (no concurrent editing conflicts to handle).
- Prompt files are stored server-side and accessible to the application.
- Maximum file size of 10MB for uploaded documents (standard web upload limit).
- URL content is publicly accessible (no authentication support for URL fetch).
- URLs return HTML content (JavaScript-rendered content may not be fully extracted).
