/**
 * Workflow Preprocessor v1.0
 * 
 * 이 코드가 LLM 대신 결정론적 처리를 수행합니다.
 * LLM은 이 결과물을 받아서 템플릿에 조립만 합니다.
 */

const patternRegistry = require('./pattern-registry-kr.json');

function preprocessPolicy(policyText) {
  const result = {
    metadata: {
      registry_version: patternRegistry.registry_metadata.version,
      timestamp: new Date().toISOString(),
      policy_hash: policyText.substring(0, 50)
    },
    matched_patterns: [],
    unmatched_patterns: [],
    selected_role: null,
    selected_risk_level: null,
    extracted_principles: [],
    description: null
  };

  const policyLower = policyText.toLowerCase().replace(/\s+/g, ' ');

  // ═══════════════════════════════════════════════════════════
  // STEP 1: PATTERN MATCHING (Deterministic)
  // ═══════════════════════════════════════════════════════════
  const patterns = [...patternRegistry.pattern_definitions].sort(
    (a, b) => a.pattern_id.localeCompare(b.pattern_id)
  );

  for (const pattern of patterns) {
    let matched = false;
    let matchedKeyword = null;
    let matchPosition = -1;

    for (const keyword of pattern.keywords) {
      const keywordLower = keyword.toLowerCase();
      
      // Handle wildcard '*' → \d+
      if (keywordLower.includes('*')) {
        const regex = new RegExp(keywordLower.replace(/\*/g, '\\d+'));
        const match = policyLower.match(regex);
        if (match) {
          matched = true;
          matchedKeyword = keyword;
          matchPosition = match.index;
          break;
        }
      } else {
        const pos = policyLower.indexOf(keywordLower);
        if (pos !== -1) {
          matched = true;
          matchedKeyword = keyword;
          matchPosition = pos;
          break;
        }
      }
    }

    if (matched) {
      result.matched_patterns.push({
        pattern_id: pattern.pattern_id,
        category: pattern.category,
        priority: pattern.priority,
        criticality: pattern.criticality,
        tool_id: pattern.maps_to_tool,
        matched_keyword: matchedKeyword,
        match_position: matchPosition,
        source_type: pattern.source_type,
        is_prerequisite: pattern.is_prerequisite || false
      });
    } else {
      result.unmatched_patterns.push({
        pattern_id: pattern.pattern_id,
        category: pattern.category
      });
    }
  }

  // Sort matched patterns
  result.matched_patterns.sort((a, b) => {
    if (a.is_prerequisite !== b.is_prerequisite) {
      return a.is_prerequisite ? -1 : 1;
    }
    if (a.priority !== b.priority) {
      return a.priority - b.priority;
    }
    return a.match_position - b.match_position;
  });

  // ═══════════════════════════════════════════════════════════
  // STEP 2: ROLE SELECTION (Priority Order)
  // ═══════════════════════════════════════════════════════════
  const roleMapping = [...patternRegistry.role_mapping.priority_order].sort(
    (a, b) => a.priority - b.priority
  );

  result.selected_role = {
    role: patternRegistry.role_mapping.default_role,
    matched_via: 'default',
    priority: 999
  };

  outer: for (const mapping of roleMapping) {
    for (const keyword of mapping.keywords) {
      if (policyLower.includes(keyword.toLowerCase())) {
        result.selected_role = {
          role: mapping.role,
          matched_via: keyword,
          priority: mapping.priority
        };
        break outer;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 3: RISK LEVEL SELECTION (Priority Order)
  // ═══════════════════════════════════════════════════════════
  const riskMapping = [...patternRegistry.risk_level_mapping.priority_order].sort(
    (a, b) => a.priority - b.priority
  );

  result.selected_risk_level = {
    level: patternRegistry.risk_level_mapping.default_level,
    matched_via: 'default'
  };

  outer2: for (const mapping of riskMapping) {
    for (const keyword of mapping.keywords) {
      if (policyLower.includes(keyword.toLowerCase())) {
        result.selected_risk_level = {
          level: mapping.level,
          matched_via: keyword
        };
        break outer2;
      }
    }
  }

  // ═══════════════════════════════════════════════════════════
  // STEP 4: PRINCIPLES EXTRACTION
  // ═══════════════════════════════════════════════════════════
  const searchTerms = ['must', 'shall', 'required', '해야 한다', '필요', '필수'];
  const sentences = policyText.split(/[.。\n]/).filter(s => s.trim().length > 10);
  
  const indexedSentences = [];
  let searchStart = 0;
  for (const sentence of sentences) {
    const pos = policyText.indexOf(sentence.trim(), searchStart);
    if (pos !== -1) {
      indexedSentences.push({ text: sentence.trim(), position: pos });
      searchStart = pos + sentence.length;
    }
  }

  const usedPositions = new Set();
  const principles = [];

  for (const term of searchTerms) {
    if (principles.length >= 3) break;
    
    const matching = indexedSentences.filter(
      s => s.text.toLowerCase().includes(term.toLowerCase()) && !usedPositions.has(s.position)
    );
    
    if (matching.length > 0) {
      const earliest = matching.reduce((a, b) => a.position < b.position ? a : b);
      principles.push(earliest.text);
      usedPositions.add(earliest.position);
    }
  }

  // Fill defaults
  const defaults = [
    'Accuracy in data extraction',
    'Completeness of verification',
    'Timeliness of processing'
  ];
  while (principles.length < 3) {
    principles.push(defaults[principles.length]);
  }
  result.extracted_principles = principles.slice(0, 3);

  // ═══════════════════════════════════════════════════════════
  // STEP 5: BUILD DESCRIPTION
  // ═══════════════════════════════════════════════════════════
  const lines = policyText.split('\n');
  let processName = 'Unknown Process';
  
  for (const line of lines) {
    const stripped = line.trim();
    if (!stripped) continue;
    if (stripped.startsWith('#')) {
      processName = stripped.replace(/^#+\s*/, '');
    } else {
      processName = stripped;
    }
    break;
  }

  const prefixes = ['policy:', 'procedure:', 'guidelines:', '정책:', '절차:'];
  for (const prefix of prefixes) {
    if (processName.toLowerCase().startsWith(prefix)) {
      processName = processName.substring(prefix.length).trim();
      break;
    }
  }

  const primaryDocType = result.matched_patterns.length > 0
    ? result.matched_patterns[0].category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : 'Document';

  result.description = `${primaryDocType} verification for ${processName}`;

  // ═══════════════════════════════════════════════════════════
  // STEP 6: BUILD CHECKLIST & LOGIC FLOW
  // ═══════════════════════════════════════════════════════════
  result.checklist = result.matched_patterns.map(p => {
    const tool = patternRegistry.tool_definitions.find(t => t.id === p.tool_id);
    return {
      data_point: p.category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      source: p.source_type,
      tool: tool ? tool.name : 'unknown'
    };
  });

  result.logic_flow = result.matched_patterns.map((p, idx) => {
    const tool = patternRegistry.tool_definitions.find(t => t.id === p.tool_id);
    const params = tool ? tool.params.join(', ') : '';
    const isCritical = patternRegistry.decision_rules.critical_patterns.includes(p.pattern_id);
    const isReview = patternRegistry.decision_rules.review_patterns.includes(p.pattern_id);
    
    let failAction;
    if (isCritical) failAction = `CRITICAL_FAIL_${p.category}`;
    else if (isReview) failAction = `REVIEW_${p.category}`;
    else failAction = `FAIL_${p.category}`;

    return `${idx + 1}. CALL \`${tool.name}(${params})\` → IF valid, PROCEED. ELSE, FLAG as ${failAction}.`;
  });
  result.logic_flow.push(`${result.logic_flow.length + 1}. AGGREGATE all results → Proceed to Phase 3.`);

  // ═══════════════════════════════════════════════════════════
  // STEP 7: BUILD FAILURE LISTS
  // ═══════════════════════════════════════════════════════════
  result.critical_failures = result.matched_patterns
    .filter(p => patternRegistry.decision_rules.critical_patterns.includes(p.pattern_id))
    .map(p => `CRITICAL_FAIL_${p.category}`);

  result.review_triggers = result.matched_patterns
    .filter(p => patternRegistry.decision_rules.review_patterns.includes(p.pattern_id))
    .map(p => `REVIEW_${p.category}`);

  return result;
}

// Export
module.exports = { preprocessPolicy };

// CLI Usage
if (require.main === module) {
  const fs = require('fs');
  const policyText = fs.readFileSync(process.argv[2], 'utf8');
  const result = preprocessPolicy(policyText);
  console.log(JSON.stringify(result, null, 2));
}
