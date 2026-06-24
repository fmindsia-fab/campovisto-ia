# CampoVisto.IA — Claude Code Briefing

Platform: rural drone inspection → annotated visual reports → AI-assisted analysis (human-reviewed) → PDF export → activity Kanban.
Product by: FMinds.

Full PRD: [docs/PRD.md](docs/PRD.md)

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router, Server Components, Server Actions, API Routes) |
| UI | React + TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Supabase (Auth, PostgreSQL, Storage, RLS) |
| Database | PostgreSQL via `@supabase/supabase-js` — no Prisma in MVP |
| Hosting | Vercel (mind serverless limits for PDF/image processing) |
| Payments | Stripe (scaffold only in MVP — no full billing required) |
| Email | Resend (transactional) |
| AI | Gemini API or OpenAI Vision (preliminary analysis, JSON output) |
| Image editor | React Konva or Canvas API |
| PDF generation | Playwright or Puppeteer |

Not in MVP: Prisma, tRPC.

---

## Folder Structure

```
/
├── app/
│   ├── (auth)/               # login, signup, onboarding
│   ├── (app)/                # authenticated area
│   │   ├── dashboard/
│   │   ├── clients/
│   │   ├── properties/
│   │   ├── inspections/
│   │   ├── reports/
│   │   ├── activities/
│   │   ├── calendar/
│   │   └── settings/
│   ├── (public)/             # landing page (future)
│   └── api/                  # AI calls, PDF generation, webhooks
├── components/
│   ├── ui/                   # shadcn/ui components
│   ├── editor/               # image annotation editor
│   ├── reports/              # report preview + PDF template
│   └── shared/               # layout, nav, cards
├── lib/
│   ├── supabase/             # client + server helpers
│   ├── ai/                   # Gemini/OpenAI integration
│   ├── pdf/                  # PDF generation
│   └── utils/
├── types/                    # TypeScript interfaces for all entities
├── supabase/
│   └── migrations/           # SQL migration files
└── docs/
    └── PRD.md
```

---

## Database Entities

```
users / profiles
roles
user_roles          ← many-to-many (users ↔ roles)
companies           ← future multicompany
clients
properties
inspections
inspection_images
image_annotations
ai_analyses
reports
report_sections
activities
activity_comments
calendar_events
notifications
plans
subscriptions
usage_limits
```

---

## Role System

**Do NOT use a single `user.role` field.**

Use `roles` + `user_roles` tables (many-to-many). One user can hold multiple roles simultaneously.

MVP roles: `admin` · `field_operator` · `drone_pilot` · `human_reviewer` · `client`

Permissions = union of all assigned roles for that user.

---

## MVP Build Order

Implement strictly in this sequence:

1. Auth (Supabase Auth)
2. Client + Property CRUD
3. Inspection CRUD + image upload (Supabase Storage)
4. Image annotation editor (React Konva)
5. AI preliminary analysis (Gemini/OpenAI Vision → structured JSON)
6. Human review workflow (approve / reject AI output)
7. Report generation + PDF export
8. Activity Kanban (Planned → Started → Done)
9. Calendar view
10. Dashboard
11. Internal notifications
12. Onboarding flow
13. Plans scaffold (Free / Premium limits)

---

## Key Rules

### AI analysis
- Every AI analysis is `status: draft` until a human reviewer sets it to `approved`
- PDF export is only available after human review approval
- AI output is always labeled as preliminary — never as a technical diagnosis

### Plans
- Free: max 1 property, 3 inspections, 5 images/inspection, no PDF export, no AI analysis
- Premium: full access per plan limits

### Architecture
- No Prisma — use `@supabase/supabase-js` directly with generated types
- No tRPC — Server Actions for mutations; API Routes for AI calls, PDF generation, webhooks
- Future modules (multicompany, GIS, animal counting, agriculture AI) must be isolated — do not bleed into core MVP flow
- Do not add complexity beyond what the current milestone requires

---

## TypeScript Conventions

- Strict mode enabled in `tsconfig.json`
- All DB entities have matching interfaces in `types/`
- Use Supabase generated types (`supabase gen types typescript`)
- No `any` — if you need to escape, use `unknown` + type guard
- No comments explaining what code does — only add a comment when the WHY is non-obvious

---

## Design Conventions

- Interface: clean, professional, image-first (drone images are protagonists)
- Layout hierarchy: property → inspection → images → analysis → report → activities
- Numbered visual markers on images (category, description, priority, confidence level)
- Cards for: properties, inspections, reports, activities
- Color base: neutral + green/purple/blue accents (FMinds brand)
- Avoid: social-media feel, excessive rural decoration, complex dashboards
- Responsive: desktop primary, tablet and mobile supported
- Design references: Linear (clarity), Notion (structure), Trello (Kanban), DroneDeploy (image layout)

---

## AI Integration Pattern

```
POST /api/ai/analyze-image
  body: { imageUrl, fieldObservations, imageType }
  → returns: {
      visibleElements: string[],
      attentionPoints: { category, description, priority, confidence }[],
      analysisLimitations: string[],
      suggestedReportText: string,
      status: "draft"
    }
```

Store result in `ai_analyses` with `status: draft`. Only a `human_reviewer` can set `status: approved`.

---

## PDF Report Structure

1. Cover (property name, inspection date, CampoVisto.IA by FMinds logo)
2. Property + client data
3. Inspection objective
4. Annotated images with numbered markers
5. Positive observations
6. Attention points (category, priority, description)
7. Analysis limitations
8. Field validation recommendations
9. Recommended activities
10. Human-reviewed conclusion
11. Disclaimer: preliminary analysis, reviewed by human, not a technical diagnosis

---

## Supabase Storage Buckets

- `drone-images` — original drone images (per inspection)
- `field-photos` — field photos (per inspection)
- `annotated-images` — exported annotated images (per report)
- `report-pdfs` — generated PDF reports
- `activity-attachments` — activity evidence files
