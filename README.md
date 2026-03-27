# PMW — Portfolio Management Workbench

A React-based investment decision engine that combines Regime, Momentum, and Fundamentals (R+M+F) analysis to generate portfolio allocation signals.

## Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand
- **Database**: Supabase (PostgreSQL)
- **Testing**: Vitest + Testing Library

## Getting Started

```bash
# Install dependencies
bun install

# Start development server
bun run dev

# Run tests
bun run test

# Type check
bun run typecheck

# Build for production
bun run build
```

## Project Structure

```
src/
├── components/
│   ├── engine/        # Decision engine UI components
│   └── ui/            # Shared UI components (shadcn-inspired)
├── lib/               # Utilities
├── store/             # Zustand stores
├── tests/             # Vitest test files
├── types/             # TypeScript definitions
supabase/
└── migrations/        # Database migrations
```

## R+M+F Decision Engine

The core engine evaluates three pillars:

1. **Regime** — Economic environment (inflation, yields, yield curve, liquidity, credit spreads)
2. **Momentum** — Price trends and 200-day moving average overlay
3. **Fundamentals** — Valuation, earnings trends, risk levels

Output includes a decision signal, portfolio action, and allocation percentages.

## Database

The app uses Supabase for persisting engine snapshots (audit trail). Run the migration in `supabase/migrations/` to set up the schema.

```bash
# Apply migration via Supabase CLI
supabase db push
```

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

## License

Proprietary — All rights reserved. Created for client use.
