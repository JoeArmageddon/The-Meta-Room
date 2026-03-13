# The Meta Room Deployment Guide

## Project Overview

The Meta Room is a full-stack Next.js application for indexing, exploring, and understanding AI skills, agents, and prompts.

## Prerequisites

1. **Node.js 18+** installed
2. **Supabase account** - https://supabase.com
3. **Groq API key** - https://console.groq.com
4. **Vercel account** (for deployment) - https://vercel.com

## Environment Setup

### 1. Copy environment variables

```bash
cp .env.example .env.local
```

### 2. Fill in your credentials

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
GROQ_API_KEY=your-groq-api-key
```

## Database Setup

### Step 1: Create Supabase Project

1. Go to https://supabase.com and create a new project
2. Note your project URL and anon key from Settings > API

### Step 2: Run Database Schema

1. In Supabase Dashboard, go to SQL Editor
2. Create a New Query
3. Copy the contents of `lib/db/schema.sql`
4. Run the query

This will create all necessary tables:
- `sources` - tracks imported repositories
- `entries` - main content storage
- `ai_explanations` - AI-generated explanations
- `relationships` - connections between entries
- `user_notes` - user-generated notes
- `embeddings` - vector embeddings for search
- `import_jobs` - tracks import progress

### Step 3: Enable Vector Extension

The schema includes `CREATE EXTENSION IF NOT EXISTS vector;` which enables pgvector for semantic search.

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

## Deployment to Vercel

### Step 1: Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Import to Vercel

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure project:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`

### Step 3: Environment Variables

Add these environment variables in Vercel Dashboard:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `GROQ_API_KEY`

### Step 4: Deploy

Click Deploy and wait for the build to complete.

## Features

### Implemented

✅ **Universal Search** - Semantic + Full-text search  
✅ **AI Explanations** - Auto-generated using Groq  
✅ **Relationship Graphs** - React Flow visualization  
✅ **Prompt Builder** - CLI invocation generator  
✅ **Repository Import** - GitHub + file upload  
✅ **Dark/Light Theme** - Theme toggle  
✅ **Responsive UI** - Mobile-friendly design  

### Supported File Formats

- `.md` / `.mdx` - Markdown with frontmatter
- `.json` - JSON files
- `.yaml` / `.yml` - YAML files
- `.txt` - Plain text

### CLI Formats

The Prompt Builder supports:
- Antigravity
- Claude Code
- Kimi
- OpenAI Codex
- Generic format

## Project Structure

```
the-meta-room/
├── app/
│   ├── api/           # API routes
│   ├── skills/        # Skills pages
│   ├── agents/        # Agents pages
│   ├── prompts/       # Prompts pages
│   ├── explore/       # Search page
│   ├── import/        # Import page
│   ├── types/         # TypeScript types
│   ├── globals.css    # Global styles
│   ├── layout.tsx     # Root layout
│   └── page.tsx       # Home page
├── components/
│   ├── ui/           # shadcn/ui components
│   ├── search-bar.tsx
│   ├── entry-card.tsx
│   ├── ai-explanation.tsx
│   ├── graph-view.tsx
│   ├── prompt-builder.tsx
│   ├── navigation.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── parsers/      # File parsers
│   ├── db/           # Database client
│   ├── ai/           # AI integration
│   ├── search/       # Search functionality
│   ├── repo/         # Repository importer
│   └── utils.ts
└── package.json
```

## API Routes

- `GET/POST /api/search` - Search entries
- `GET /api/entries` - List all entries
- `GET /api/entries/[id]` - Get specific entry
- `POST /api/explain` - Generate AI explanation
- `POST /api/import-repo` - Import from GitHub or files

## Troubleshooting

### Build Errors

1. **TypeScript errors**: Run `npx tsc --noEmit` to check
2. **Missing dependencies**: Run `npm install`

### Database Errors

1. Check Supabase connection
2. Verify RLS policies are configured
3. Ensure vector extension is enabled

### AI Explanations Not Working

1. Verify `GROQ_API_KEY` is set
2. Check Groq dashboard for API usage

## Next Steps

1. Import your first repository via `/import`
2. Explore the entries in `/explore`
3. Try the Prompt Builder
4. Visualize relationships in the graph view

## License

MIT
