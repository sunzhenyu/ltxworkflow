# ltx workflow

> LTX-2.3 ComfyUI Workflow Generator & Model Download Tool

**Live site:** https://ltxworkflow.com

A full-stack web tool for LTX-2.3 video model users. Generate ComfyUI workflow JSON, match your GPU VRAM to the right model, enhance prompts with AI, and save workflows to the cloud.

---

## Features

- **VRAM Adapter** — Select your GPU memory (16GB / 24GB / 32GB) to see compatible LTX-2.3 models
- **ComfyUI Workflow JSON Generator** — Generate ready-to-use ComfyUI API-format workflow JSON with custom resolution, frames, FPS, steps, CFG, seed, and scheduler
- **AI Prompt Enhancer** — Enhance prompts with cinematic language using yunwu.ai (gpt-5.2)
- **Advanced Workflow Builder** — Dashboard feature with cloud save (Supabase)
- **Model Downloads** — All official LTX-2.3 checkpoints with accurate VRAM requirements
- **Setup Guide** — Step-by-step ComfyUI installation and configuration guide
- **Workflow Templates** — Official example workflows from Lightricks

## Tech Stack

- **Framework:** Next.js 16.2.2 (App Router, Turbopack)
- **Auth:** NextAuth v5 — Google OAuth + email/password (bcrypt)
- **Database:** Supabase (PostgreSQL) — users, workflows, feedback tables
- **AI:** OpenAI SDK → yunwu.ai proxy (gpt-5.2)
- **Styling:** Tailwind CSS v4, dark theme
- **Deploy:** Vercel

## Project Structure

```
app/
  page.tsx              # Home — VRAM matcher, prompt enhancer, workflow builder
  guide/                # ComfyUI setup guide
  models/               # Model download page
  workflows/            # Workflow templates
  feedback/             # Feedback form
  dashboard/            # Protected — advanced builder + saved workflows
  profile/              # Protected — user profile
  api/
    enhance-prompt/     # AI prompt enhancement
    workflows/          # CRUD for saved workflows
    feedback/           # Feedback submission
    auth/               # NextAuth + email registration
components/
  Nav.tsx               # Shared navigation (server component, reads session)
  VramMatcher.tsx       # VRAM selector
  WorkflowBuilder.tsx   # Public workflow builder
  PromptEnhancer.tsx    # AI prompt enhancer
  ModelCards.tsx        # Model download cards
  dashboard/
    AdvancedWorkflowBuilder.tsx
    SavedWorkflows.tsx
lib/
  models.ts             # All LTX-2.3 model data (official sources)
  workflow.ts           # ComfyUI workflow JSON generator
public/
  example_workflows/    # Official Lightricks workflow JSON files
```

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
AUTH_SECRET=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
NEXTAUTH_URL=http://localhost:3000
ANTHROPIC_API_KEY=        # yunwu.ai key
ANTHROPIC_BASE_URL=https://yunwu.ai/v1
```

## Supabase Tables

```sql
-- Users
create table users (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  name text,
  password_hash text,
  avatar_url text,
  provider text,
  created_at timestamptz default now()
);

-- Workflows
create table workflows (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references users(id) on delete cascade,
  name text not null,
  params jsonb not null,
  created_at timestamptz default now()
);

-- Feedback
create table feedback (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  email text,
  created_at timestamptz default now()
);
```

## Development

```bash
npm install
npm run dev
```

## Model Sources

All model data sourced from official repositories:

- [Lightricks/LTX-2.3](https://huggingface.co/Lightricks/LTX-2.3) — official dev & distilled models
- [Kijai/LTX2.3_comfy](https://huggingface.co/Kijai/LTX2.3_comfy) — FP8 quantized variants (16GB VRAM)
- [ComfyUI-LTXVideo](https://github.com/Lightricks/ComfyUI-LTXVideo) — official ComfyUI nodes

## Workflow JSON Format

Generated workflows use ComfyUI API format (not UI format). Key nodes:

| Node | Purpose |
|------|---------|
| `CheckpointLoaderSimple` | Load model checkpoint |
| `CLIPTextEncode` | Encode positive/negative prompts |
| `EmptyLTXVLatentVideo` | Create latent video tensor |
| `LTXVConditioning` | Apply LTX-specific conditioning |
| `LTXVScheduler` | LTX noise schedule |
| `SamplerCustomAdvanced` | Run sampling |
| `VAEDecodeTiled` | Decode latents to frames |
| `SaveVideo` | Save output video |

**Constraints:**
- Resolution must be divisible by 32
- Frames must be 8n+1: 25, 49, or 97
- Distilled model: max 8 steps, CFG=1

---

*Not affiliated with Lightricks. LTX-2.3 is open-source under the LTX Video License.*
