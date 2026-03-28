#!/usr/bin/env node

import { createInterface } from "readline";

const DANGEROUS_PATTERNS = [
  { pattern: /rm\s+-rf\s+\/(?!\w)/, reason: "rm -rf / — filesystem destruction" },
  { pattern: /rm\s+-rf\s+~/, reason: "rm -rf ~ — home directory destruction" },
  { pattern: /:\(\)\s*\{\s*:\|\s*:&\s*\}\s*;/, reason: "fork bomb" },
  { pattern: />\s*\/dev\/sd[a-z]/, reason: "direct disk write" },
  { pattern: /dd\s+if=\/dev\/zero/, reason: "disk zeroing" },
  { pattern: /chmod\s+-R\s+777\s+\//, reason: "recursive permission change on root" },
  { pattern: /mkfs\./, reason: "filesystem formatting" },
  { pattern: /:(){ :|:& };:/, reason: "fork bomb" },
];

async function main() {
  const rl = createInterface({ input: process.stdin });
  let inputData = "";

  for await (const line of rl) {
    inputData += line;
  }

  try {
    const event = JSON.parse(inputData);
    const command = event.tool_input?.command || "";

    for (const { pattern, reason } of DANGEROUS_PATTERNS) {
      if (pattern.test(command)) {
        const result = {
          decision: "deny",
          reason: `Dangerous command blocked: ${reason}`,
        };
        process.stdout.write(JSON.stringify(result));
        process.exit(0);
      }
    }

    // Safe — no output means allow
    process.exit(0);
  } catch {
    // Parse error — allow by default
    process.exit(0);
  }
}

main();
