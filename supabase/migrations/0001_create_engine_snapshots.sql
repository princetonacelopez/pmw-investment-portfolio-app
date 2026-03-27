-- ─────────────────────────────────────────────────────────────────────────────
-- Migration: 0001_create_engine_snapshots
-- Purpose: Core audit table for R+M+F engine runs
-- ─────────────────────────────────────────────────────────────────────────────

create table if not exists public.engine_snapshots (
  id                    uuid primary key default gen_random_uuid(),

  -- Pillar signals
  regime_signal         smallint not null check (regime_signal in (-1, 0, 1)),
  regime_raw_score      smallint not null,
  momentum_signal       smallint not null check (momentum_signal in (-1, 0, 1)),
  momentum_score        numeric(6, 4) not null,
  fundamentals_signal   smallint not null check (fundamentals_signal in (-1, 0, 1)),
  fundamentals_score    numeric(6, 4) not null,

  -- Composite
  base_score            smallint not null check (base_score between -3 and 3),
  adjusted_score        smallint not null check (adjusted_score between -3 and 3),
  dma_overlay_applied   boolean not null default false,
  tranche_active        boolean not null default false,

  -- Decision output
  signal                text not null,
  portfolio_action      text not null,
  allocation_growth     smallint not null check (allocation_growth between 0 and 100),
  allocation_defensive  smallint not null check (allocation_defensive between 0 and 100),
  client_text           text not null,

  -- Full inputs as JSON (immutable audit trail — AFSL requirement)
  inputs_json           jsonb not null,

  -- Timestamps
  created_at            timestamptz not null default now()
);

-- Index for history queries
create index if not exists engine_snapshots_created_at_idx
  on public.engine_snapshots (created_at desc);

-- Enable Row Level Security
alter table public.engine_snapshots enable row level security;

-- Policy: allow authenticated users to read and insert
-- (Phase 1: single advisor, no client-facing access)
create policy "Authenticated users can view snapshots"
  on public.engine_snapshots for select
  to authenticated
  using (true);

create policy "Authenticated users can insert snapshots"
  on public.engine_snapshots for insert
  to authenticated
  with check (true);

-- No updates or deletes — snapshots are immutable per AFSL audit requirements
comment on table public.engine_snapshots is
  'Immutable audit log of every R+M+F engine run. Required for ASIC RG 255 compliance.';
