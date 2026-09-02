-- KE&G ESOP Games — Supabase schema
-- Run this once in the Supabase SQL editor (Project > SQL Editor > New query)

create extension if not exists "pgcrypto";

-- 1. Employees (bulk-loaded roster, used as the sign-in list)
create table if not exists employees (
  id uuid primary key default gen_random_uuid(),
  employee_number text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- 2. Games (the 4 games; is_unlocked is the manual on/off switch)
create table if not exists games (
  id text primary key,             -- slug, e.g. 'word-search'
  sheet_label text not null,       -- e.g. 'GAME 1'
  title text not null,
  description text not null,
  type text not null check (type in ('word_search','crossword','myth_fact','trivia')),
  sort_order int not null default 0,
  is_unlocked boolean not null default false,
  updated_at timestamptz not null default now()
);

-- 3. Questions (flexible payload per game type — see README for shape)
create table if not exists questions (
  id uuid primary key default gen_random_uuid(),
  game_id text not null references games(id) on delete cascade,
  order_index int not null default 0,
  payload jsonb not null,
  created_at timestamptz not null default now()
);

-- 4. Completions (tracks who finished what)
create table if not exists completions (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references employees(id) on delete cascade,
  game_id text not null references games(id) on delete cascade,
  score jsonb,                     -- e.g. {"correct": 8, "total": 10}
  completed_at timestamptz not null default now(),
  unique (employee_id, game_id)
);

-- Row Level Security: locked down. All reads/writes go through Netlify
-- Functions using the service role key, so the browser never talks to
-- Supabase directly and never sees the service key.
alter table employees enable row level security;
alter table games enable row level security;
alter table questions enable row level security;
alter table completions enable row level security;
-- (No policies are added — with RLS on and zero policies, the anon/public
-- key can't read or write anything. Only the service role key, used
-- server-side in the Netlify Functions, bypasses RLS.)

-- ---------------------------------------------------------------------
-- Seed data: the 4 games
-- ---------------------------------------------------------------------
insert into games (id, sheet_label, title, description, type, sort_order, is_unlocked) values
  ('word-search', 'GAME 1', 'Find Your Ownership', 'ESOP word search — the Week 1 introduction.', 'word_search', 1, false),
  ('crossword', 'GAME 2', 'Know Your ESOP', 'A 12-clue crossword covering ESOP basics.', 'crossword', 2, false),
  ('myth-or-fact', 'GAME 3', 'Own the Facts', 'Myth or fact — 10 statements about employee ownership.', 'myth_fact', 3, false),
  ('trivia', 'GAME 4', 'Are You Smarter Than an Employee Owner?', 'The grand finale — 15 trivia questions across 3 rounds.', 'trivia', 4, false)
on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Seed data: Game 1 — Word Search words
-- ---------------------------------------------------------------------
insert into questions (game_id, order_index, payload) values
  ('word-search', 1, '{"word":"ESOP"}'),
  ('word-search', 2, '{"word":"OWNERSHIP"}'),
  ('word-search', 3, '{"word":"EMPLOYEE OWNER"}'),
  ('word-search', 4, '{"word":"SHARES"}'),
  ('word-search', 5, '{"word":"SHARE VALUE"}'),
  ('word-search', 6, '{"word":"VESTING"}'),
  ('word-search', 7, '{"word":"RETIREMENT"}'),
  ('word-search', 8, '{"word":"BENEFIT"}'),
  ('word-search', 9, '{"word":"FUTURE"}'),
  ('word-search', 10, '{"word":"GROWTH"}'),
  ('word-search', 11, '{"word":"TEAMWORK"}'),
  ('word-search', 12, '{"word":"SAFETY"}'),
  ('word-search', 13, '{"word":"QUALITY"}'),
  ('word-search', 14, '{"word":"KEG"}'),
  ('word-search', 15, '{"word":"ONE HUNDRED PERCENT"}');

-- ---------------------------------------------------------------------
-- Seed data: Game 2 — Crossword clues (grid layout is generated in-app)
-- ---------------------------------------------------------------------
insert into questions (game_id, order_index, payload) values
  ('crossword', 1, '{"clue":"KE&G is 100% ______ owned.","answer":"EMPLOYEE"}'),
  ('crossword', 2, '{"clue":"The individual units of company ownership allocated to your ESOP account.","answer":"SHARES"}'),
  ('crossword', 3, '{"clue":"The process of earning your right to the value in your ESOP account over time.","answer":"VESTING"}'),
  ('crossword', 4, '{"clue":"The value assigned to one share of company stock.","answer":"SHAREVALUE"}'),
  ('crossword', 5, '{"clue":"An ESOP is designed to help employees build savings for this stage of life.","answer":"RETIREMENT"}'),
  ('crossword', 6, '{"clue":"Working safely helps protect our people, projects and company ______.","answer":"PERFORMANCE"}'),
  ('crossword', 7, '{"clue":"ESOP stands for Employee Stock Ownership ______.","answer":"PLAN"}'),
  ('crossword', 8, '{"clue":"The people who ultimately benefit when an employee-owned company succeeds.","answer":"EMPLOYEES"}'),
  ('crossword', 9, '{"clue":"The ESOP is one part of your total ______ package.","answer":"BENEFITS"}'),
  ('crossword', 10, '{"clue":"Good decisions about equipment, materials and time can help reduce ______.","answer":"COSTS"}'),
  ('crossword', 11, '{"clue":"Every employee owner can contribute to company success through the ______ of their work.","answer":"QUALITY"}'),
  ('crossword', 12, '{"clue":"Something every employee owner can help build through the ESOP.","answer":"FUTURE"}');

-- ---------------------------------------------------------------------
-- Seed data: Game 3 — Myth or Fact
-- ---------------------------------------------------------------------
insert into questions (game_id, order_index, payload) values
  ('myth-or-fact', 1, '{"statement":"Money is deducted from my paycheck to purchase the shares in my ESOP account.","answer":"MYTH","explanation":"ESOP shares are provided through the company''s ESOP. Employees don''t purchase those shares through payroll deductions."}'),
  ('myth-or-fact', 2, '{"statement":"KE&G is 100% employee-owned.","answer":"FACT","explanation":""}'),
  ('myth-or-fact', 3, '{"statement":"Being 100% employee-owned means every employee owns exactly the same number of shares.","answer":"MYTH","explanation":"The number of shares allocated to individual ESOP accounts can vary."}'),
  ('myth-or-fact', 4, '{"statement":"The value of a KE&G share is guaranteed to increase every year.","answer":"MYTH","explanation":"Share value can increase or decrease based on the independently determined value of the company."}'),
  ('myth-or-fact', 5, '{"statement":"Doing quality work and avoiding unnecessary rework can contribute to company performance.","answer":"FACT","explanation":"Rework costs time and money. Employee owners can influence company performance through everyday decisions."}'),
  ('myth-or-fact', 6, '{"statement":"The ESOP is separate from my wages.","answer":"FACT","explanation":"Your wages are what you''re paid for your work. The ESOP is an additional retirement benefit and part of the bigger picture of your total compensation."}'),
  ('myth-or-fact', 7, '{"statement":"If KE&G has a strong year, every employee automatically receives that year''s profit in cash.","answer":"MYTH","explanation":"Employee ownership doesn''t mean company profits are automatically divided into cash payments to employees."}'),
  ('myth-or-fact', 8, '{"statement":"Employee owners can influence the long-term success of the company through things like safety, productivity, quality and taking care of equipment.","answer":"FACT","explanation":""}'),
  ('myth-or-fact', 9, '{"statement":"Vesting and share value mean the same thing.","answer":"MYTH","explanation":"Vesting determines how much of your ESOP account you''re entitled to keep when you leave the company. Share value is the value assigned to company stock."}'),
  ('myth-or-fact', 10, '{"statement":"The ESOP is designed to provide employees with an additional financial benefit for retirement.","answer":"FACT","explanation":""}');

-- ---------------------------------------------------------------------
-- Seed data: Game 4 — Trivia (15 questions, 4 options each)
-- ---------------------------------------------------------------------
insert into questions (game_id, order_index, payload) values
  ('trivia', 1, '{"question":"What does ESOP stand for?","options":["Employee Savings Ownership Program","Employee Stock Ownership Plan","Employee Stock Option Program","Employer Savings Opportunity Plan"],"correctIndex":1}'),
  ('trivia', 2, '{"question":"What percentage of KE&G is employee-owned?","options":["25%","51%","75%","100%"],"correctIndex":3}'),
  ('trivia', 3, '{"question":"What year did KE&G establish its ESOP?","options":["1996","2006","2010","2014"],"correctIndex":1}'),
  ('trivia', 4, '{"question":"What year did KE&G become 100% employee-owned?","options":["2006","2010","2014","2020"],"correctIndex":2}'),
  ('trivia', 5, '{"question":"How long has KE&G had an ESOP as of 2026?","options":["10 years","12 years","15 years","20 years"],"correctIndex":3}'),
  ('trivia', 6, '{"question":"How much money do employees contribute from their paycheck to purchase ESOP shares?","options":["$25 per paycheck","1% of wages","3% of wages","$0"],"correctIndex":3}'),
  ('trivia', 7, '{"question":"What does \\"vesting\\" relate to?","options":["Your hourly wage","Your job title","Your ownership of the value in your ESOP account","Your health insurance"],"correctIndex":2}'),
  ('trivia', 8, '{"question":"What determines the value of the shares held by the ESOP?","options":["Employees vote on the price","The President chooses it","It automatically increases every year","Company value is determined through an independent valuation process"],"correctIndex":3}'),
  ('trivia', 9, '{"question":"Can KE&G''s share value go down?","options":["Yes","No"],"correctIndex":0}'),
  ('trivia', 10, '{"question":"The ESOP should be considered part of your:","options":["Regular paycheck","Overtime pay","Overall benefits and retirement package","Per diem"],"correctIndex":2}'),
  ('trivia', 11, '{"question":"A crew completes something incorrectly and has to redo the work. What does that potentially affect?","options":["Labor costs","Material costs","Schedule/productivity","All of the above"],"correctIndex":3}'),
  ('trivia', 12, '{"question":"Which employee is thinking most like an owner?","options":["\\"It''s not my equipment, so it doesn''t matter.\\"","\\"Someone else will clean it up.\\"","\\"If I see something that could cost us time or money, I should speak up.\\"","\\"Safety is the safety department''s job.\\""],"correctIndex":2}'),
  ('trivia', 13, '{"question":"Which of these can affect company performance?","options":["Safety","Productivity","Quality, equipment care and waste","All of the above"],"correctIndex":3}'),
  ('trivia', 14, '{"question":"Being an employee owner means:","options":["I personally make every company decision.","I''m guaranteed the stock price will increase.","I have a financial interest in the long-term success of the company.","My paycheck changes based on the stock price."],"correctIndex":2}'),
  ('trivia', 15, '{"question":"Who can make a difference in the success of an employee-owned company?","options":["Executives","Project Managers","Superintendents","Everyone"],"correctIndex":3}');
