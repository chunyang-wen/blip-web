# Blip — Minimal & Secure Web Journal

Blip is a beautiful, minimal, and highly secure journaling application with mood tracking. It replicates the premium native look and feel of the macOS Sonoma SwiftUI application.

It is designed with an **offline-first dual storage engine**, giving you absolute choice over your data. You can journal fully locally in private browser cache or synchronize your entries across all devices securely.

---

## 🔒 Security & Authentication Architecture

To protect your credentials and prevent database leakage, Blip completely isolates database controls using **cryptographic verification** and **database-enforced rules** (instead of standard password tables).

### The Authentication Loop Flow

```
1. CREDENTIALS ENCRYPTED:
   Password ──[HTTPS TLS 1.3]──▶ Supabase Auth Service ──▶ Hashed via [bcrypt] 
   (Your plain text password is never stored or visible to database administrators)

2. TEMPORARY SESSION TOKEN ISSUED:
   Supabase Auth ──[Signed Session Token (JWT)]──▶ Browser localStorage
   (Authenticates your browser context temporarily for secure transactions)

3. ROW-LEVEL SECURITY ENFORCED:
   Browser Query ──[Sends JWT Token]──▶ Supabase Postgres Database Engine
                                                 │
                                                 ▼
                                     [Enforces RLS Database Policy]
                                    owner_uuid = auth.uid()
                                                 │
                        ┌────────────────────────┴────────────────────────┐
                        ▼                                                 ▼
             [ MATCH: Query Allowed ]                          [ MISMATCH: Access Blocked ]
```

---

## ⚙️ Core Use Cases & Step-by-Step Guides

Blip is built to adapt seamlessly to whether you are connecting existing data or starting brand new.

### 📂 Use Case 1: "I already have items in Supabase"
*Goal: Fetch, synchronize, and display existing journal entries in your new Web UI.*

1. **Access Settings**:
   * Open the Blip Web UI.
   * If you are on the login page, click **"Continue Offline & Local-Only"** to enter the dashboard as a guest.
   * Click the **Gear Icon (Settings)** at the bottom-left of the sidebar.
2. **Configure Database Project**:
   * Toggle the Storage Mode to **"Supabase Cloud Sync"**.
   * Paste your **Supabase Project URL** and **Public Anon Key** (found in your Supabase dashboard at `supabase.com` under *Project Settings -> API*).
   * Click **"Save & Initialize Cloud Sync"**.
3. **Log Into your Account**:
   * The app will instantly close the settings panel and return you to the main Login page.
   * Type in the **email and password** of your existing journal account.
   * Click **"Sign In"**.
4. **Done!**
   * Blip connects to your database, validates your signed session JWT, and pulls down your journal history instantly.

---

### 🆕 Use Case 2: "A new user"
*Goal: Create a brand new account (or write entries offline first and save them to a new cloud database later).*

1. **Access Settings & Enter Guest Mode**:
   * Open the Blip Web UI.
   * Click **"Continue Offline & Local-Only"** to enter immediately.
   * *Feel free to write a few test journal entries offline! They are saved instantly in your browser cache.*
   * Click the **Gear Icon (Settings)** at the bottom-left of the sidebar.
2. **Configure Database Project**:
   * Toggle the Storage Mode to **"Supabase Cloud Sync"**.
   * Paste your **Supabase Project URL** and **Public Anon Key**.
   * Click **"Save & Initialize Cloud Sync"**.
3. **Register your Account**:
   * You will be returned to the Login screen.
   * Click the **"Sign Up"** link at the bottom of the card.
   * Enter the **new email address and password** you want to use for journaling.
   * Click **"Create Account"**.
4. **Done!**
   * **The Sync Magic**: Once the new account is created, Blip's sync engine immediately detects the entries you wrote offline in Step 1, signs them with your new user UUID, and uploads them to the database cloud! Future entries will now write to the cloud directly.

---

## 🛠️ Supabase Database Schema Migrations

To set up your Supabase database, copy and paste the following SQL script directly into the **SQL Editor** on your Supabase dashboard:

```sql
-- 1. Create the journal entries table
create table if not exists public.journal_entries (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  modified_at timestamptz not null default now(),
  text text not null,
  mood smallint not null default 1,
  is_favorite boolean not null default false,
  owner uuid not null references auth.users(id) on delete cascade
);

-- 2. Create index on owner for high-speed queries
create index if not exists journal_entries_owner_idx on public.journal_entries(owner);

-- 3. Enable Row Level Security (RLS) to secure credentials
alter table public.journal_entries enable row level security;

-- 4. Create RLS Policy: Users can only read & write their own entries
create policy "Users can manage their own journal entries"
on public.journal_entries
for all
using (
  auth.uid() = owner
)
with check (
  auth.uid() = owner
);
```

---

## 🚀 Running Your Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org) installed on your system.

### 1. Install Dependencies
Run this in the root directory:
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser and navigate to the local link shown (typically `http://localhost:5173`).

### 3. Compile Production Assets
To verify or compile final minified static bundles:
```bash
npm run build
```
The compiled files will compile cleanly into the `dist/` directory, ready to be hosted on **Vercel**, **GitHub Pages**, or any static hosting platform in seconds!
