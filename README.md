# The Meta Room

A searchable knowledge base and explorer for AI skills, agents, and prompt systems.

## Features

- **Universal Search**: Semantic and full-text search across all entries
- **AI Explanations**: Automatic AI-generated explanations for every entry
- **Relationship Graphs**: Visualize connections between skills and agents
- **Prompt Builder**: Generate CLI invocations for various AI tools
- **Repository Import**: Import from GitHub or upload files directly
- **Dark/Light Theme**: Sleek UI with theme toggle

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Styling**: Tailwind CSS + shadcn/ui
- **Database**: Supabase Postgres
- **AI**: Groq API
- **Graphs**: React Flow
- **Deployment**: Vercel

## Quick Start

### 1. Clone and Install

```bash
git clone <repo-url>
cd the-meta-room
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Required variables:
- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key
- `GROQ_API_KEY` - Your Groq API key

### 3. Database Setup

Run the SQL schema in `lib/db/schema.sql` in your Supabase SQL Editor.

### 4. Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Build for Production

```bash
npm run build
```

## Database Schema

### Tables

- **sources**: Imported repositories and file sources
- **entries**: Main content (skills, agents, prompts, workflows, documentation)
- **ai_explanations**: AI-generated explanations for entries
- **relationships**: Connections between entries
- **user_notes**: User-generated notes on entries
- **embeddings**: Vector embeddings for semantic search

## Supported File Formats

- `.md` / `.mdx` - Markdown with frontmatter
- `.json` - JSON files
- `.yaml` / `.yml` - YAML files
- `.txt` - Plain text

## CLI Formats

The Prompt Builder supports generating invocations for:
- Antigravity
- Claude Code
- Kimi
- OpenAI Codex
- Generic format

## Deployment

### Vercel

1. Push to GitHub
2. Import to Vercel
3. Add environment variables
4. Deploy

### Supabase Setup

1. Create a new project
2. Run the schema SQL
3. Enable Row Level Security (RLS)
4. Get your API keys

## Project Structure

```
app/
├── api/           # API routes
├── skills/        # Skills pages
├── agents/        # Agents pages
├── prompts/       # Prompts pages
├── explore/       # Explore/search page
├── import/        # Import page
├── types/         # TypeScript types
├── globals.css    # Global styles
├── layout.tsx     # Root layout
└── page.tsx       # Home page

components/        # React components
├── ui/           # shadcn/ui components
├── search-bar.tsx
├── entry-card.tsx
├── ai-explanation.tsx
├── graph-view.tsx
├── prompt-builder.tsx
├── navigation.tsx
├── theme-toggle.tsx
└── theme-provider.tsx

lib/
├── parsers/      # File parsers (markdown, JSON, YAML)
├── db/           # Database client and schema
├── ai/           # AI/LLM integration
├── search/       # Search functionality
├── repo/         # Repository importer
└── utils.ts      # Utilities
```

## License

MIT
