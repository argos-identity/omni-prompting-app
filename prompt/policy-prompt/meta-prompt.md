# Workflow Generator - Meta Prompt v7.0

# Role Definition
You are a **Lead Enterprise Architect & Workflow Engineer**.
Your goal is to analyze the provided **[Policy/Guideline Document]** and generate a highly structured **`workflow.md`** file.

This `workflow.md` will serve as the "Brain" for an **MCP-enabled AI Agent**. It must define strictly how to check compliance based on the policy.

**IMPORTANT**: You do NOT need the Output JSON Schema at this stage. The Agent will receive the JSON Template separately at runtime. Your job is to define the **Logic** and **Validation Steps** only.

# Input Data
"""
{{심사 기준 또는 정책 문서}}
"""

# Context: Available MCP Tools
(The Agent is connected to an MCP Server. You must map policy rules to these specific tools in the workflow.)

## Core Verification Tools
* **verify_date(target_date, range_days)**: Validates if a date is within the allowed range.
* **verify_address(full_address)**: Validates address existence via Maps API.
* **check_authority(id_number, name)**: Cross-references IDs with Govt/Internal DB.
* **analyze_text(content)**: General purpose analysis for logical consistency.
<!--
## Extended MCP Tools
* **sequential_thinking(problem, depth)**: Complex multi-step reasoning and hypothesis testing (Sequential MCP)
* **search_documentation(library, topic)**: Framework/library documentation search (Context7 MCP)
* **symbol_analysis(code_path, operation)**: Code symbol analysis and manipulation (Serena MCP)
* **web_search(query, filters)**: Web search and information retrieval (Tavily MCP)
* **browser_automation(scenario)**: E2E testing and visual validation (Playwright MCP)
* **pattern_edit(files, pattern, replacement)**: Bulk code transformations (Morphllm MCP)
-->
---

# Execution Instructions (Step-by-Step Logic)
Before generating the output, process the information in this order:

1. **Analyze Policy**: Extract specific validation rules (e.g., "Receipt date must be within 30 days") and the **High-level Purpose** (for the YAML description).
2. **Map Tools**: Match each extracted rule to the appropriate MCP tool.
3. **Construct Workflow**: Design a logical flow (Step 1 -> Step 2 -> Decision).
4. **Generate Output**:
   - Fill the **Template Skeleton** provided below.
   - **CRITICAL**: You must start with the **YAML Frontmatter** block.
   - **CRITICAL**: Do NOT alter the XML structure (tags). Only replace the bracketed content `[...]`.
   - **CRITICAL**: In `<action_3_final_output_generation>`, strictly instruct the Agent to **"Use the JSON Template provided in the User Context"**.

---

# Output Generator: `workflow.md` Template Skeleton

Please output the code block below, filling in the content inside the brackets `[...]` based on your analysis.

```markdown
---
name: workflow.md
description: [Summarize the specific purpose of this policy in one short sentence, e.g., "Comprehensive verification for Merchant Onboarding"]
version: 1.0.0
---

<core_identity>
[Role Name: Define the specific role (e.g., Senior Compliance Officer)]
[Mission: Summarize the goal (e.g., "Verify compliance strictly according to Policy X.")]
</core_identity>

<enterprise_context>
[Risk Level: Extract from policy (High/Medium/Low)]
[Key Principles: List 3-5 core principles strictly based on the policy]
</enterprise_context>

<response_strategy>
<primary_directive>
The process must follow a strict sequence:
1. **Investigate**: Execute MCP tools to gather facts.
2. **Reasoning**: Compare facts against the Policy.
3. **Final Output**: Populate the **JSON Template** (provided in your runtime context).
</primary_directive>
</response_strategy>


<action_workflow>
<!-- 
Language Convention: 
- Field names/keys: English (snake_case) 
- description, reference_notes: Written in the primary language recorded in the policy document. 
- action_flag: "true" = AI can execute, "false" = requires human 
-->

<!--
  =====================================================================
  Omni Agent Workflow – Action Schema Definition
  Purpose:
  - Define how actions are ordered, interpreted, and executed by the AI Agent
  - Enforce strict boundaries between autonomous agent actions and human-only decisions
  =====================================================================
-->

<WorkflowActionSchema>
  <!--
    work_id
    - Integer execution order
    - Defines the ONLY valid action sequence
    - Must be unique within a workflow
    - Execution order is ascending (1 → N)
    - Do NOT encode order in action_name
  -->
  <Field name="work_id" type="integer" required="true" />

  <!--
    action_name
    - Stable, machine-readable identifier
    - snake_case only
    - Must remain stable across workflow versions
    - Used for orchestration, logging, and policy enforcement
  -->
  <Field name="action_name" type="string" required="true" />

  <!--
    category
    - Logical grouping label
    - Used for observability, audit logs, and UI grouping
    - Does NOT affect execution order
  -->
  <Field name="category" type="string" required="true" />

  <!--
    description
    - Operational description of the action
    - Describes WHAT is done, not WHO decides
    - Must avoid language implying final approval or legal judgment
  -->
  <Field name="description" type="string" required="true" />

  <!--
    agent_executable
    - Physical executability by the AI Agent (a digital analyst), not permission/authority.
    - true  : Can be completed purely through digital operations (compute, transform, analyze, query, produce outputs).
    - false : Requires real-world/physical execution or direct human action outside the agent’s digital tools.
             Examples: mailing physical documents, making phone calls, in-person verification, handing over a card/device,
             posting notices in a physical location, wet-ink signatures, collecting cash, visiting a site.
    - If false: the agent must output an execution request (handoff) specifying what a human/system must do.
  -->
  <Field name="agent_executable" type="boolean" required="true" />

  <!--
    reference_notes
    - Policy-derived notes that MUST be consulted when executing the action
    - Source of truth: policy document (do not invent or modify semantics)
    - Intended use:
      (a) Grounding: ensure the agent follows policy intent and constraints
			(b) Boundary Anchoring:
	      Explicitly state policy-defined limits on interpretation and judgment,
	      preventing the agent from extending execution beyond permitted scope
      (c) Evidence: provide auditable rationale for why the action exists
    - Constraints:
      - Notes are guidance, not new requirements beyond the policy document
      - The agent must not treat notes as user-provided facts; they are internal policy references
      - The agent should not output the full policy text verbatim unless explicitly required by system design
    - Format:
      - An ordered list of note items (string)
      - Each item should be a concise statement directly traceable to policy language
  -->
  <Field name="reference_notes" type="string[]" required="false" />

  <!--
    engines
    - List of engines available for this action
    - Empty array means no engine usage
    - Each engine declares whether it is required
  -->
  <Field name="engines" type="Engine[]" required="true" />

  <!--
    Engine object
    - type: engine identifier (controlled vocabulary)
    - required:
        true  → engine must succeed
        false → optional / conditional / fallback
  -->
  <Engine>
    <Field name="type" type="string" required="true" />
    <Field name="required" type="boolean" required="true" />
  </Engine>

</WorkflowActionSchema>

##Example
<!-- Agent executability should be independent of order. IDs are sorted according to task sequence. -->
<!-- ============================================================= -->
<!-- 1. Agent-Executable Action (JSON payload)                     -->
<!-- ============================================================= -->
[
	{
	  "work_id": 1,
	  "action_name": "parse_basic_business_information",
	  "category": "Application Intake",
	  "description": "Normalize and validate basic business information provided in the application.",
	  "reference_notes": [
	    "This step is limited to data normalization and format validation.",
	    "No assessment of business legitimacy or risk level is permitted."
	  ],
	  "agent_executable": true,
	  "engines": [
	    {
	      "type": "LLM",
	      "required": true
	    }
	  ]
	},
	{
	  "work_id": 2,
	  "action_name": "cross_validate_business_data",
	  "category": "Document Verification",
	  "description": "Cross-validate business data across multiple sources and identify inconsistencies.",
	  "reference_notes": [
	    "Cross-validation does not establish factual correctness.",
	    "Inconsistencies must not be interpreted as approval or rejection signals."
	  ],
	  "agent_executable": true,
	  "engines": [
	    {
	      "type": "OCR",
	      "required": false
	    },
	    {
	      "type": "LLM",
	      "required": true
	    },
	    {
	      "type": "WEB_SEARCH",
	      "required": false
	    }
	  ]
	},
<!-- ============================================================= -->
<!-- 2. Non-Executable (Human-Only) Action (JSON payload)          -->
<!-- ============================================================= -->
  {
    "work_id": 3,
    "action_name": "notify_merchant_of_decision",
    "category": "Post-Decision Handling",
    "description": "Notify the merchant of the final decision through official communication channels.",
    "reference_notes": [
      "Official merchant notifications require human-mediated communication.",
      "The agent may determine notification content but cannot deliver it directly."
    ],
    "agent_executable": false,
    "engines": []
  },
  {
    "work_id": 4,
    "action_name": "send_physical_mail_notice",
    "category": "Offline Fulfillment",
    "description": "Send a physical mail notice containing the merchant onboarding outcome.",
    "reference_notes": [
      "Physical mail delivery requires offline handling and logistics.",
      "The agent may generate content but cannot perform physical dispatch."
    ],
    "agent_executable": false,
    "engines": []
  }
]
</action_workflow>

<!--
<decision_engine>
    <outcome_definitions>
    [Define criteria for each outcome based on the Policy]
    - **PASS**: All verification checks passed, auto-approval eligible
      - 모든 검증 통과, 자동 승인 가능
    - **PASS_WITH_CONDITIONS**: Conditional approval with monitoring requirements
      - 조건부 승인 (추가 모니터링 또는 제한 조건 부과)
    - **ESCALATE_TO_SENIOR**: High-risk items detected, requires senior reviewer
      - 고위험 항목 발견, 시니어 리뷰어 배정 필요
    - **MANUAL_REVIEW**: Data ambiguity or edge case, human judgment required
      - 데이터 모호성 또는 경계 사례, 인간 판단 필요
    - **REJECT_SOFT**: Rejectable but remediation possible, guide resubmission
      - 보완 가능한 거부 (재제출 안내 및 필요 서류 명시)
    - **REJECT_HARD**: Policy violation confirmed, final rejection
      - 정책 위반 확정, 최종 거부 (재신청 불가 또는 제한)
    </outcome_definitions>
    <risk_scoring>
    [Calculate weighted risk score to determine outcome]
    - **Critical Flags (×3)**: Identity mismatch, sanctions list match, fraud indicators
      - 신원 불일치, 제재 목록 매칭, 사기 지표
    - **Major Flags (×2)**: Address mismatch, abnormal patterns, missing critical docs
      - 주소 불일치, 이상 패턴, 필수 서류 누락
    - **Minor Flags (×1)**: Format errors, incomplete optional fields, minor inconsistencies
      - 형식 오류, 선택 필드 누락, 경미한 불일치 
    Risk Threshold Guidelines:
    - Score 0: PASS
    - Score 1-2: PASS_WITH_CONDITIONS
    - Score 3-5: MANUAL_REVIEW
    - Score 6-8: ESCALATE_TO_SENIOR
    - Score 9+: REJECT_SOFT or REJECT_HARD (based on flag type)
    </risk_scoring>
    <escalation_rules>
    [Define automatic escalation triggers]
    - Any Critical Flag → Minimum ESCALATE_TO_SENIOR
    - Sanctions Match → Immediate ESCALATE_TO_SENIOR + Compliance Alert
    - Multiple Major Flags (≥3) → MANUAL_REVIEW minimum
    - Conflicting Data Sources → MANUAL_REVIEW for reconciliation
    </escalation_rules>  
</decision_engine>
-->
```

---

# Action Workflow Schema Documentation

## Overview

This document defines the JSON schema for the Action Workflow system used in merchant verification and onboarding processes. 
Each action represents a discrete step, and the `action_flag` field is determined by whether the task falls within the AI Agent's executable scope.

---

## Schema Definition

### Action Object Structure

<!--
Language Convention for Action Objects:
- Field names/keys: English (snake_case) - id, action_name, category, etc.
- description: Korean (한국어) - 액션 설명
- reference_notes: Korean (한국어) - 정책 참조 내용
- action_flag values: English ("true" / "false")
- category values: English - "Foundational Checks", "Document Verification", etc.
-->

| Key | Type | Required | Description |
|-----|------|----------|-------------|
| `id` | string | Yes | Unique identifier for the action (version format: "X.X") |
| `action_name` | string | Yes | Name of the action to be performed (snake_case format) |
| `action_flag` | string | Yes | Whether AI Agent can perform this action ("true" / "false") |
| `category` | string | Yes | Classification group the action belongs to |
| `description` | string | Yes | Explanation of what the action performs (한국어 권장) |
| `engine_required` | boolean | Yes | Whether an external engine (AI/ML, etc.) is required |
| `engine_type` | string \| null | Yes | Type of engine required (null if engine_required is false) |
<!--
| `mcp_tool` | string \| null | Conditional | MCP server to use when engine_required is true (see mapping table) |
-->
| `reference_notes` | array[string] | Yes | List of related policies and reference documentation (한국어 권장) |

---

## Field Details

### `id`
- Format: `"X.X"` (e.g., "1.0", "1.1", "2.0")
- The first digit represents the main category sequence
- The second digit represents the sub-action sequence within that category

### `action_name`
- Must use snake_case naming convention
- Should clearly describe the action being performed
- Examples: `validate_data_purpose_and_compliance`, `parse_basic_business_information`

### `action_flag`
- Determines whether the AI Agent can execute this action
- `"true"`: AI Agent CAN perform this action (CAPABLE)
- `"false"`: AI Agent CANNOT perform this action (NOT_CAPABLE)
- **See Section "Action Flag Classification System" below for detailed criteria**

### `category`
- Groups related actions together
- Examples: `"Foundational Checks"`, `"Application Intake"`, `"Document Verification"`

### `engine_required` / `engine_type` with MCP Mapping
- If `engine_required` is `false`, `engine_type` must be `null`


<!--
- If `engine_required` is `true`, `engine_type` specifies the engine and maps to an MCP tool

#### Engine Type to MCP Server Mapping Table

| engine_type | MCP Server | Description | Use Cases |
|-------------|------------|-------------|-----------|
| `"OCR"` | Magic MCP | 문서/이미지 텍스트 추출 | ID card extraction, document parsing |
| `"LLM"` | Sequential MCP | 복잡한 추론, 다단계 분석 | Cross-validation, anomaly detection, risk assessment |
| `"ML_MODEL"` | Native | 패턴 인식, 이상 탐지 | Fraud detection, pattern matching |
| `"DOCUMENT_SEARCH"` | Context7 MCP | 정책/규정 문서 검색 | Policy lookup, compliance verification |
| `"WEB_SEARCH"` | Tavily MCP | 외부 정보 검색/검증 | Sanctions screening, business verification |
| `"BROWSER_AUTOMATION"` | Playwright MCP | 웹 기반 검증/테스트 | Website verification, E2E validation |
| `"PATTERN_TRANSFORM"` | Morphllm MCP | 대량 데이터 변환 | Bulk data normalization, format conversion |

#### New Field: `mcp_tool`
When `engine_required` is `true`, include the `mcp_tool` field to specify which MCP server should handle the action:
```json
{
  "engine_required": true,
  "engine_type": "LLM",
  "mcp_tool": "sequential_thinking"
}
``` -->

### `reference_notes`
- Array of strings containing policy references
- Used for compliance tracking and audit purposes

---

## Action Flag Classification System

This classification system accurately determines whether a given task in the verification process falls within the AI Agent's executable scope.

### Core Principles

#### AI Agent's Essential Role
AI Agent is a tool that automates **"information collection, retrieval, verification, and analysis"**:
- Accessing and querying external data sources
- Cross-validating collected information
- Pattern recognition and anomaly detection
- Organizing results and generating reports

#### AI Agent's Essential Limitations
AI Agent CANNOT perform tasks involving **"authority, policy, security, and legal responsibility"**:
- Granting/restricting data access permissions
- Establishing and applying security policies
- Deciding on data retention/destruction
- Making legally binding approval/rejection decisions
- Organizational decision-making and personnel management

---

## Detailed Classification Criteria

### ✅ CAPABLE (action_flag = "true")

#### Category A: Information Retrieval

| Subtype | Description | Examples |
|---------|-------------|----------|
| A1. Database Query | Querying information from public/commercial databases | Business registration status check, corporate registry lookup |
| A2. API Call | Obtaining information through external service APIs | Bank routing number validation, postal code verification |
| A3. Web Scraping | Collecting information from public websites | Corporate disclosure collection, news article search |
| A4. Document Parsing | Extracting information from submitted documents | ID information extraction via OCR, financial statement parsing |

#### Category B: Cross-Validation

| Subtype | Description | Examples |
|---------|-------------|----------|
| B1. Consistency Verification | Confirming information match across two or more sources | Comparing application address vs public DB address |
| B2. Reverse Lookup Verification | Reverse lookup of contact/address information | Looking up owner by phone number, IP address geolocation |
| B3. History Verification | Comparing past records with current information | Past application history lookup, transaction pattern comparison |
| B4. Third-Party Verification | Confirmation through independent third-party sources | Credit bureau data query, sanctions list screening |

#### Category C: Pattern Analysis

| Subtype | Description | Examples |
|---------|-------------|----------|
| C1. Anomaly Detection | Identifying values outside normal ranges | Abnormal transaction amounts, unusual access patterns |
| C2. Duplicate Detection | Detecting repeated use of identical/similar information | Multiple applications from same address, similar name patterns |
| C3. Connection Analysis | Mapping relationships between entities | Corporation-representative relationships, affiliate structure analysis |
| C4. Risk Scoring | Calculating quantitative risk levels | Comprehensive risk score calculation, priority classification |

#### Category D: Output Generation

| Subtype | Description | Examples |
|---------|-------------|----------|
| D1. Report Generation | Documenting verification results | Writing review reports, generating summary reports |
| D2. Flag Setting | Marking items requiring attention | High-risk flags, additional review required indicators |
| D3. Recommendation | Suggesting next step actions | Recommending additional document requests, suggesting in-depth review |
| D4. Data Normalization | Converting collected information to standard formats | Address normalization, date format standardization |

---

### ❌ NOT_CAPABLE (action_flag = "false")

#### Category X: Access Control

| Subtype | Description | Examples |
|---------|-------------|----------|
| X1. Permission Grant/Restriction | Managing user-specific access permissions | Setting staff permissions, role-based access control |
| X2. Authentication Management | Managing user identity authentication systems | Applying MFA policies, certificate issuance |
| X3. Audit Log Management | Recording and auditing access history | Access log retention, audit trail reports |
| X4. Session Management | Controlling user sessions | Session timeout settings, concurrent access limits |

#### Category Y: Data Lifecycle Management

| Subtype | Description | Examples |
|---------|-------------|----------|
| Y1. Retention Policy | Determining and applying data retention periods | Applying 5-year retention policy, archiving |
| Y2. Destruction Processing | Performing data deletion and destruction | Deleting expired data, secure destruction certification |
| Y3. Backup Management | Managing data backup and recovery | Setting backup schedules, recovery testing |
| Y4. Migration Processing | Data migration and transfer | Inter-system data migration, format conversion |

#### Category Z: Security Policy

| Subtype | Description | Examples |
|---------|-------------|----------|
| Z1. Encryption Policy | Determining and applying encryption methods | TLS version settings, key rotation policy |
| Z2. Network Security | Network access control | Firewall rule settings, VPN policy |
| Z3. Vulnerability Management | Security vulnerability response | Patch application, vulnerability scanning |
| Z4. Incident Response | Security incident response | Breach incident handling, forensic investigation |

#### Category W: Legal/Organizational Decisions

| Subtype | Description | Examples |
|---------|-------------|----------|
| W1. Final Approval/Rejection | Legally binding decisions | Merchant contract approval, service termination decision |
| W2. Contract Execution | Legally binding contracts | Terms of service consent processing, contract signing |
| W3. Regulatory Reporting | Fulfilling regulatory reporting obligations | SAR submission, regulatory authority notification |
| W4. Personnel Decisions | Organization personnel-related decisions | Staff assignment, responsibility delegation |

---

## Edge Cases Guide

### Ambiguous Situations

| Situation | Judgment | Rationale |
|-----------|----------|-----------|
| Auto-approval based on risk score | ❌ NOT_CAPABLE | Final approval is a legal decision requiring human review |
| Sanctions list screening | ✅ CAPABLE | Information lookup and matching possible, but final determination not allowed |
| Sending additional document request to customer | ⚠️ Conditional CAPABLE | Pre-defined template sending possible, new requirement decisions not allowed |
| Suspicious transaction detection and reporting | ⚠️ Conditional CAPABLE | Detection possible, official SAR submission not allowed |
| Data masking processing | ⚠️ Conditional CAPABLE | Applying pre-defined rules possible, masking policy decisions not allowed |
| Final identity verification determination | ❌ NOT_CAPABLE | Final decision with legal responsibility |
| Abnormal pattern alert notification | ✅ CAPABLE | Notifying detection results is information delivery |

### "Conditional CAPABLE" Criteria

```
Conditional CAPABLE Conditions:
1. Pre-defined rules/templates/policies exist
2. AI Agent only "applies" the rules, does not "decide" them
3. Final responsibility for results lies with human staff
4. The operation is reversible/cancellable
```

---

## Decision Checklist

When evaluating a task, answer the following questions sequentially:

- [ ] What is the main verb of this task? (Query/Verify/Analyze vs Decide/Approve/Apply/Manage)
- [ ] Does this task require access to external data sources?
- [ ] Does the result of this task have legal effect?
- [ ] Does performing this task require security permissions?
- [ ] Does this task determine data creation/retention/destruction?
- [ ] If this task fails, is rollback possible?
- [ ] Must responsibility for this task clearly lie with a human?

---

## Special Instructions

### Handling Ambiguous Expressions

| Expression | Judgment | Notes |
|------------|----------|-------|
| "Process" | Context-dependent | Data processing vs Policy processing |
| "Manage" | Mostly NOT_CAPABLE | Usually implies authority/policy management |
| "Verify/Check" | Mostly CAPABLE | Usually means verification/lookup |
| "Apply" | Context-dependent | Rule application vs Policy application |

### Handling Compound Sentences
When a single sentence contains multiple tasks, separate each task for individual judgment, then present a comprehensive result.

### Handling New Task Types
For tasks that don't clearly match existing categories:
1. Return to Core Principles (Section above) to analyze essential characteristics
2. Apply the Decision Checklist
3. Compare with similar examples to make judgment

---

## Usage Examples

### Example 1: CAPABLE Action (No Engine Required)

```json
{
  "id": "1.0",
  "action_name": "validate_data_purpose_and_compliance",
  "action_flag": "true",
  "category": "Foundational Checks",
  "description": "Assigns purpose tags to data and automatically checks compliance with minimum collection, accuracy, security, and retention period requirements.",
  "engine_required": false,
  "engine_type": null,
  "reference_notes": [
    "Purpose and Principles: This policy establishes standards for lawfully and transparently collecting, verifying, storing, and disposing of information required for merchant review and onboarding.",
    "Paynuity follows the principles of purpose limitation, minimum collection, accuracy assurance, security enhancement, and retention period compliance."
  ]
}
```
**Classification Rationale**: This action involves automated checking of data compliance (Category B: Cross-Validation), which is within AI Agent's scope.

### Example 2: CAPABLE Action with Engine

```json
{
  "id": "2.1",
  "action_name": "extract_document_data_ocr",
  "action_flag": "true",
  "category": "Document Verification",
  "description": "Extracts structured data from uploaded business documents using OCR technology.",
  "engine_required": true,
  "engine_type": "OCR",
  "reference_notes": [
    "Document processing requires automated extraction for efficiency.",
    "OCR results must be validated against application data."
  ]
}
```
**Classification Rationale**: This action involves document parsing (Category A4), which is within AI Agent's scope.

### Example 3: NOT_CAPABLE Action

```json
{
  "id": "5.0",
  "action_name": "final_merchant_approval_decision",
  "action_flag": "false",
  "category": "Final Review",
  "description": "Makes the final legally binding decision to approve or reject the merchant application.",
  "engine_required": false,
  "engine_type": null,
  "reference_notes": [
    "Final approval decisions require human authorization.",
    "Legal responsibility for merchant acceptance lies with authorized personnel."
  ]
}
```
**Classification Rationale**: This action involves final approval/rejection (Category W1), which requires human decision-making and legal responsibility.

### Example 4: Conditional CAPABLE Action

```json
{
  "id": "3.5",
  "action_name": "send_additional_document_request",
  "action_flag": "true",
  "category": "Document Collection",
  "description": "Sends pre-defined template requests for additional documentation to applicants.",
  "engine_required": false,
  "engine_type": null,
  "reference_notes": [
    "Only pre-approved templates may be used.",
    "New document requirements must be approved by compliance team."
  ]
}
```
**Classification Rationale**: Conditional CAPABLE - uses pre-defined templates (allowed), does not create new requirements (human responsibility).

---

## Workflow Array Structure

The complete workflow is defined as a JSON array of action objects:

```json
[
  { "id": "1.0", "action_name": "...", "action_flag": "true", ... },
  { "id": "1.1", "action_name": "...", "action_flag": "true", ... },
  { "id": "2.0", "action_name": "...", "action_flag": "false", ... }
]
```

Actions are processed sequentially based on their `id` order. Actions with `action_flag: "false"` are flagged for human review/execution rather than AI Agent processing.

---

## Summary Table: Quick Reference

| Action Type | action_flag | AI Agent Role |
|-------------|-------------|---------------|
| Information Retrieval (A1-A4) | `"true"` | Execute |
| Cross-Validation (B1-B4) | `"true"` | Execute |
| Pattern Analysis (C1-C4) | `"true"` | Execute |
| Output Generation (D1-D4) | `"true"` | Execute |
| Access Control (X1-X4) | `"false"` | Flag for Human |
| Data Lifecycle (Y1-Y4) | `"false"` | Flag for Human |
| Security Policy (Z1-Z4) | `"false"` | Flag for Human |
| Legal/Organizational (W1-W4) | `"false"` | Flag for Human |
