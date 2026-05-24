# AgentForge

A multi-LLM agent builder platform that lets you create, configure, and chat with AI agents powered by OpenAI and Anthropic. Built as a portfolio project targeting full-stack AI engineering roles.

## Features

- **Multi-provider support** — build agents on OpenAI (GPT-4o, GPT-4o Mini) or Anthropic (Claude Haiku, Claude Sonnet)
- **Tool calling** — agents can use a calculator, check the current datetime, and simulate web search
- **Streaming chat** — real-time token streaming via Server-Sent Events
- **Execution trace** — live sidebar showing every tool call, its input, and output
- **Model comparison** — run the same prompt across multiple models in parallel and compare latency + quality
- **Conversation history** — runs and messages persisted to SQLite via Prisma
- **Edit agents** — update name, system prompt, model, and tools at any time

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| API | Next.js Route Handlers (SSE streaming) |
| Database | SQLite + Prisma 7 (ORM) |
| AI | OpenAI SDK, Anthropic SDK |
| Runtime | Node.js, LibSQL driver adapter |

## Getting Started

### Prerequisites

- Node.js 18+
- OpenAI API key (optional — only needed for OpenAI agents)
- Anthropic API key (optional — only needed for Anthropic agents)

### Setup

```bash
git clone https://github.com/Larmstrong1127/agentforge
cd agentforge
npm install
```

Copy the environment template and add your API keys:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
DATABASE_URL="file:./prisma/dev.db"
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
```

Run database migrations and seed demo agents:

```bash
npx prisma db push
npm run db:seed
```

Start the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  api/
    agents/       # CRUD for agents
    chat/         # SSE streaming chat with tool calling loop
    compare/      # Parallel multi-model comparison
    runs/         # Run history
  agents/
    [id]/         # Chat interface + execution trace sidebar
    [id]/edit/    # Edit agent form
    new/          # Create agent form
  compare/        # Model comparison page
components/
  AgentCard       # Dashboard card with delete
  AgentForm       # Shared create/edit form
  ChatInterface   # SSE streaming chat UI
  ProviderBadge   # OpenAI / Anthropic badge
lib/
  db.ts           # Prisma singleton with LibSQL adapter
  providers/      # OpenAI + Anthropic client instances
  tools/          # Calculator, datetime, web_search tools
prisma/
  schema.prisma   # Agent, Run, Message models
  seed.ts         # Demo agents seeder
```

## Key Implementation Details

### Streaming with SSE
The chat API route uses `ReadableStream` with `text/event-stream` to stream tokens in real time without a third-party streaming library. Events: `token`, `tool_call`, `done`, `error`.

### Tool Calling Loop
Both OpenAI and Anthropic providers run a `while(continueLoop)` loop — the agent keeps calling tools until the model returns a final text response with no pending tool calls.

### Parallel Model Comparison
`/api/compare` uses `Promise.all` to fan out requests to all selected models simultaneously and records per-provider latency for benchmarking.

### Prisma 7 + LibSQL
Uses Prisma 7's new TypeScript source generator with the `@prisma/adapter-libsql` driver adapter, enabling future compatibility with edge runtimes and Turso.

## License

MIT — built by [Landon Armstrong](https://github.com/Larmstrong1127)
