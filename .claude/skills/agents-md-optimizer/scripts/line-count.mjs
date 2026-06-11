#!/usr/bin/env node

/**
 * CLAUDE.md line count and section statistics
 * Usage: node line-count.mjs <path-to-claude-md>
 * Output: JSON with total lines, sections, code blocks, tables
 * Exit codes: 0 = success, 1 = error
 */

import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

const filePath = process.argv[2];

if (!filePath) {
  console.error(JSON.stringify({ error: 'No file path provided', usage: 'node line-count.mjs <path-to-file>' }));
  process.exit(1);
}

const resolvedPath = resolve(filePath);

if (!existsSync(resolvedPath)) {
  console.error(JSON.stringify({ error: `File not found: ${resolvedPath}` }));
  process.exit(1);
}

let content;
try {
  content = readFileSync(resolvedPath, 'utf8');
} catch (err) {
  console.error(JSON.stringify({ error: `Cannot read file: ${err.message}` }));
  process.exit(1);
}

// Split on \r?\n: CRLF checkouts (Windows core.autocrlf) leave a trailing \r
// that breaks the heading regex below — `.` never matches \r, so `$` fails.
// Strip the final newline first so totalLines matches `wc -l`.
const lines = content.replace(/\r?\n$/, "").split(/\r?\n/);
const totalLines = lines.length;
const nonEmptyLines = lines.filter(l => l.trim().length > 0).length;

// Section bounds convention: startLine/endLine are 1-indexed and inclusive
// (startLine = the heading line, endLine = the last line before the next heading or EOF).
const sections = [];
let currentSection = null;
let inCodeBlock = false;
let codeBlockLines = 0;
let tableLines = 0;

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // Track code blocks. Fence delimiter lines (```) are themselves counted
  // in codeBlockLines, so the stat includes delimiters, not just content.
  if (line.trimStart().startsWith('```')) {
    inCodeBlock = !inCodeBlock;
    codeBlockLines++;
    if (currentSection) currentSection.codeBlockLines++;
    continue;
  }

  if (inCodeBlock) {
    codeBlockLines++;
    if (currentSection) currentSection.codeBlockLines++;
    continue;
  }

  // Track tables
  if (/^\s*\|.*\|/.test(line)) {
    tableLines++;
    if (currentSection) currentSection.tableLines++;
    continue;
  }

  // Detect headings (## or ###)
  const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
  if (headingMatch) {
    const level = headingMatch[1].length;
    // Level-1 (# Title) is intentionally not tracked as a section — it's the
    // document title. Matches the `grep -c '^##'` fallback in SKILL.md.
    if (level >= 2) {
      if (currentSection) {
        currentSection.endLine = i;
        // startLine..endLine is inclusive, so +1
        currentSection.lines = currentSection.endLine - currentSection.startLine + 1;
        sections.push(currentSection);
      }
      currentSection = {
        heading: headingMatch[2].trim(),
        level,
        startLine: i + 1,
        endLine: null,
        lines: 0,
        codeBlockLines: 0,
        tableLines: 0
      };
    }
  }
}

// Close last section
if (currentSection) {
  currentSection.endLine = totalLines;
  // startLine..endLine is inclusive, so +1
  currentSection.lines = currentSection.endLine - currentSection.startLine + 1;
  sections.push(currentSection);
}

const result = {
  file: resolvedPath,
  totalLines,
  nonEmptyLines,
  codeBlockLines,
  tableLines,
  sectionCount: sections.length,
  sections
};

console.log(JSON.stringify(result, null, 2));
