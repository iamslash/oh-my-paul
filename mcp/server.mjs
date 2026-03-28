#!/usr/bin/env node

import { createInterface } from "readline";
import { readFileSync, readdirSync, statSync } from "fs";
import { execSync } from "child_process";
import { join } from "path";

const rl = createInterface({ input: process.stdin });

const tools = [
  {
    name: "project-info",
    description: "Returns project metadata — name, version, dependencies, git status, file count, and primary language",
    inputSchema: {
      type: "object",
      properties: {
        cwd: {
          type: "string",
          description: "Project directory (default: current working directory)",
        },
      },
    },
  },
];

function getProjectInfo(cwd) {
  const projectDir = cwd || process.cwd();
  const info = {
    cwd: projectDir,
    name: null,
    version: null,
    description: null,
    dependencyCount: 0,
    devDependencyCount: 0,
    gitBranch: null,
    gitStatus: "unknown",
    fileCount: 0,
    primaryLanguage: "unknown",
  };

  // package.json
  try {
    const pkg = JSON.parse(readFileSync(join(projectDir, "package.json"), "utf-8"));
    info.name = pkg.name || null;
    info.version = pkg.version || null;
    info.description = pkg.description || null;
    info.dependencyCount = Object.keys(pkg.dependencies || {}).length;
    info.devDependencyCount = Object.keys(pkg.devDependencies || {}).length;
  } catch {}

  // Git info
  try {
    info.gitBranch = execSync("git branch --show-current", { cwd: projectDir, encoding: "utf-8" }).trim();
    const status = execSync("git status --porcelain", { cwd: projectDir, encoding: "utf-8" }).trim();
    info.gitStatus = status ? "dirty" : "clean";
  } catch {}

  // File count and language detection
  try {
    const extensions = {};
    function walk(dir, depth = 0) {
      if (depth > 3) return; // limit depth
      for (const entry of readdirSync(dir)) {
        if (entry.startsWith(".") || entry === "node_modules" || entry === "dist") continue;
        const fullPath = join(dir, entry);
        try {
          const stat = statSync(fullPath);
          if (stat.isDirectory()) {
            walk(fullPath, depth + 1);
          } else {
            info.fileCount++;
            const ext = entry.split(".").pop();
            if (ext) extensions[ext] = (extensions[ext] || 0) + 1;
          }
        } catch {}
      }
    }
    walk(projectDir);

    // Primary language by file count
    const sorted = Object.entries(extensions).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) {
      const extMap = { ts: "TypeScript", tsx: "TypeScript", js: "JavaScript", jsx: "JavaScript", py: "Python", go: "Go", rs: "Rust", java: "Java", rb: "Ruby" };
      info.primaryLanguage = extMap[sorted[0][0]] || sorted[0][0];
    }
  } catch {}

  return info;
}

for await (const line of rl) {
  if (!line.trim()) continue;
  try {
    const request = JSON.parse(line);
    let response;

    if (request.id === undefined || request.id === null) continue; // notification

    switch (request.method) {
      case "initialize":
        response = {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "oh-my-paul", version: "0.1.0" },
          },
        };
        break;

      case "tools/list":
        response = {
          jsonrpc: "2.0",
          id: request.id,
          result: {
            tools,
            instructions: "oh-my-paul provides project metadata via the project-info tool.",
          },
        };
        break;

      case "tools/call": {
        const { name, arguments: args } = request.params || {};
        if (name === "project-info") {
          const info = getProjectInfo(args?.cwd);
          response = {
            jsonrpc: "2.0",
            id: request.id,
            result: {
              content: [{ type: "text", text: JSON.stringify(info, null, 2) }],
              isError: false,
            },
          };
        } else {
          response = {
            jsonrpc: "2.0",
            id: request.id,
            error: { code: -32601, message: `Unknown tool: ${name}` },
          };
        }
        break;
      }

      default:
        response = {
          jsonrpc: "2.0",
          id: request.id,
          error: { code: -32601, message: `Method not found: ${request.method}` },
        };
    }

    process.stdout.write(JSON.stringify(response) + "\n");
  } catch {}
}
