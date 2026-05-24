export type ToolName = "calculator" | "datetime" | "web_search";

export interface ToolResult {
  tool: ToolName;
  input: Record<string, unknown>;
  output: string;
}

export const AVAILABLE_TOOLS = [
  { name: "calculator" as ToolName, label: "Calculator", description: "Evaluate math expressions" },
  { name: "datetime" as ToolName, label: "Date & Time", description: "Get current date and time" },
  { name: "web_search" as ToolName, label: "Web Search", description: "Search the web (simulated)" },
];

export function executeTool(name: ToolName, input: Record<string, unknown>): string {
  switch (name) {
    case "calculator": {
      try {
        const expr = String(input.expression ?? "").replace(/[^0-9+\-*/().\s]/g, "");
        const result = Function(`"use strict"; return (${expr})`)();
        return `Result: ${result}`;
      } catch {
        return "Error: invalid expression";
      }
    }
    case "datetime":
      return `Current date and time: ${new Date().toISOString()}`;
    case "web_search":
      return `[Simulated search results for "${input.query}"]: Found 3 relevant results. This is a portfolio demo — connect a real search API (e.g. Tavily) for live results.`;
    default:
      return "Unknown tool";
  }
}

export const OPENAI_TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "calculator",
      description: "Evaluate a mathematical expression",
      parameters: {
        type: "object",
        properties: { expression: { type: "string", description: "Math expression to evaluate" } },
        required: ["expression"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "datetime",
      description: "Get the current date and time",
      parameters: { type: "object", properties: {} },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "web_search",
      description: "Search the web for information",
      parameters: {
        type: "object",
        properties: { query: { type: "string", description: "Search query" } },
        required: ["query"],
      },
    },
  },
];

export const ANTHROPIC_TOOL_DEFINITIONS = [
  {
    name: "calculator",
    description: "Evaluate a mathematical expression",
    input_schema: {
      type: "object" as const,
      properties: { expression: { type: "string", description: "Math expression to evaluate" } },
      required: ["expression"],
    },
  },
  {
    name: "datetime",
    description: "Get the current date and time",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "web_search",
    description: "Search the web for information",
    input_schema: {
      type: "object" as const,
      properties: { query: { type: "string", description: "Search query" } },
      required: ["query"],
    },
  },
];
