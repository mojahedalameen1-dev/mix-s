# 🔍 Deep Audit Report: Invitation & Registration System

---

## A. Invite Token Generation

| # | Question | Answer |
|---|---------|--------|
| 1 | Where is the token generated? | [route.ts](file:///c:/projects/mix%20sales/src/app/api/admin/invite/route.ts#L22) — Line 22 |
| 2 | Token format? | `Math.random().toString(36)` — **weak, predictable** |
| 3 | Stored in DB before URL shown? | ✅ Yes — inserted in `invite_links` table |
| 4 | Token hashed before storing? | ❌ No — stored as plaintext |
| 5 | Raw token or reference ID in URL? | Raw token in URL: `/invite/{raw_token}` |

---

## B. Invite Page (`/invite/[token]`)

| # | Question | Answer |
|---|---------|--------|
| 6 | Token validated against DB? | ✅ Yes — [page.tsx:14-21](file:///c:/projects/mix%20sales/src/app/invite/%5Btoken%5D/page.tsx#L14-L21) |
| 7 | Expired token behavior? | Shows "الرابط غير صالح" message |
| 8 | Already used token? | Same message as expired |
| 9 | Non-existent token? | Same message ("الرابط غير صالح") |
| 10 | How is token passed to OAuth? | **Two-way** (both are bugs). See Critical Bug #2 below |

---

## C. Auth Callback (`/auth/callback`)

| # | Question | Answer |
|---|---------|--------|
| 11 | Line reading invite token | [route.ts:8](file:///c:/projects/mix%20sales/src/app/auth/callback/route.ts#L8): `searchParams.get('invite') ?? searchParams.get('state')` |
| 12 | Token re-validated in DB? | ✅ Yes — [route.ts:56-63](file:///c:/projects/mix%20sales/src/app/auth/callback/route.ts#L56-L63) |
| 13 | `used_at` set BEFORE or AFTER redirect? | ✅ BEFORE redirect (line 83-89, then redirect line 94) |
| 14 | Race condition? | ✅ Protected — checks `used_at IS NULL` in query |
| 15 | `exchangeCodeForSession` error handling? | 🟡 Partial — falls through to redirect to `/login?error=...` |
| 16 | Profile update fails silently? | ❌ No — errors are logged (lines 78-80) but **user is NOT notified** |
| 17 | try/catch around entire callback? | ❌ **No** — any thrown exception = unhandled 500 |

---

## D. Middleware

| # | Question | Answer |
|---|---------|--------|
| 18 | Protected routes | All routes except: `/invite/*`, `/auth/*`, `/login`, `/pending-approval`, `/unauthorized`, `/api/*`, `/_next/*` |
| 19 | Edge-compatible? | ✅ Yes — uses `@supabase/ssr` and `next/server` |
| 20 | try/catch? | ✅ Yes — wraps entire function ([middleware.ts:6-117](file:///c:/projects/mix%20sales/src/lib/supabase/middleware.ts#L6-L117)) |
| 21 | What happens on error? | Returns `NextResponse.next()` — allows unprotected access |
| 22 | Supabase queried in middleware? | ✅ Yes — `profiles` table queried (line 82-86). **This triggers the RLS recursion bug!** |

---

## E. Database (Supabase)

| # | Question | Answer |
|---|---------|--------|
| 23 | `handle_new_user` trigger | [schema.sql:113-131](file:///c:/projects/mix%20sales/supabase/schema.sql#L113-L131) — exists but may not be deployed |
| 24 | Default status = `pending`? | ✅ Yes (line 123) |
| 25 | RLS blocks callback updates? | ⚠️ **Was the root cause** — fixed by using `adminClient` in callback |
| 26 | `invite_links` has `used_at`, `expires_at`, `created_by`? | ✅ Yes |
| 27 | Unique constraint on token? | ✅ Yes — `token TEXT UNIQUE NOT NULL` (schema.sql line 29) |
| 28 | Orphaned records? | 🟡 Possible — no FK constraint between invite `used_by` and profiles |

---

## F. Environment Variables

| # | Question | Answer |
|---|---------|--------|
| 29 | Env vars used in auth flow | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| 30 | Present in both [.env.local](file:///c:/projects/mix%20sales/.env.local) and Vercel? | ✅ Yes (pulled via `vercel env pull`) |
| 31 | `NEXT_PUBLIC_SITE_URL` set? | ❌ **Missing** — code uses `window.location.origin` instead (works but not ideal) |

---

## 🔴 CRITICAL BUGS (Break the flow)

### Bug 1: RLS Infinite Recursion on `profiles` → **Root cause of ALL 500 errors**

**File:** Database RLS policies
**Error:** `42P17: infinite recursion detected in policy for relation "profiles"`
**Cause:** The "Admins can update any profile" policy does `SELECT FROM profiles WHERE id = auth.uid() AND role = 'admin'` which triggers the SELECT policy, which triggers the admin check again → infinite loop.

**Impact:** ANY `UPDATE` or `SELECT` on `profiles` table by an authenticated user triggers a 500 error. This breaks:
- `/complete-profile` (PATCH to update `full_name`)
- Middleware profile check (SELECT)
- Dashboard loading

**Fix SQL (run in Supabase SQL Editor):**
```sql
-- Drop ALL existing profile policies to start clean
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Admins can see all profiles." ON public.profiles;

-- Recreate safe policies using auth.jwt() to avoid recursion
CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Admin full access using a subquery that won't recurse
-- because SELECT policy already allows reading all profiles
CREATE POLICY "Admins full access"
  ON public.profiles FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

NOTIFY pgrst, 'reload schema';
```

> [!IMPORTANT]
> The recursion happens because an `ALL` policy (which covers SELECT) checks a SELECT subquery on the same table, creating a loop. The fix above works because the separate `FOR SELECT` policy with `USING (true)` satisfies the SELECT check without needing the admin check, breaking the recursion chain.

---

### Bug 2: Invite Token Lost During OAuth Redirect

**File:** [login-button.tsx:13-15](file:///c:/projects/mix%20sales/src/app/invite/%5Btoken%5D/login-button.tsx#L13-L15)
**Problem:** Token is passed via BOTH `redirectTo` query param AND `state` param. Supabase OAuth internally **overwrites `state`** with its own PKCE value. So `searchParams.get('state')` in the callback will NOT contain the invite token.

The `redirectTo` approach (`/auth/callback?invite=TOKEN`) works ONLY if Supabase preserves query params in the redirect. **This is unreliable** — Supabase may strip custom query params from `redirectTo`.

**Evidence:** [route.ts:8](file:///c:/projects/mix%20sales/src/app/auth/callback/route.ts#L8) tries `searchParams.get('invite') ?? searchParams.get('state')` — the `state` fallback will always fail.

**Fix:** Store the invite token in a cookie before redirecting to OAuth:

```typescript
// login-button.tsx — FIXED
"use client"

import { createClient } from "@/lib/supabase/client"
import { Chrome } from "lucide-react"

export function LoginButton({ token }: { token: string }) {
  const supabase = createClient()

  const handleLogin = async () => {
    // Store token in cookie BEFORE OAuth redirect
    document.cookie = `invite_token=${token}; path=/; max-age=600; SameSite=Lax`
    
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    })
  }

  return (
    <button 
      onClick={handleLogin}
      className="flex items-center justify-center gap-3 w-full py-5 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl font-black transition-all hover:opacity-90 shadow-xl shadow-zinc-900/10"
    >
      <Chrome className="w-6 h-6" />
      التسجيل عبر Google
    </button>
  )
}
```

```typescript
// route.ts — read token from cookie
const inviteToken = searchParams.get('invite') ?? request.headers.get('cookie')
  ?.split(';')
  .find(c => c.trim().startsWith('invite_token='))
  ?.split('=')[1]
```

---

### Bug 3: Missing `activity_logs` Table

**File:** [activity.ts:26](file:///c:/projects/mix%20sales/src/lib/activity.ts#L26) and [schema.sql](file:///c:/projects/mix%20sales/supabase/schema.sql)
**Problem:** Code writes to `activity_logs` table, but it's not defined in [schema.sql](file:///c:/projects/mix%20sales/supabase/schema.sql) and likely doesn't exist in production DB.
**Impact:** Every [logActivity()](file:///c:/projects/mix%20sales/src/lib/activity.ts#13-43) call fails silently. Activity tracking is completely broken.

**Fix SQL:**
```sql
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    description TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view activities" ON public.activity_logs FOR SELECT USING (true);
CREATE POLICY "Authenticated can insert activities" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
```

---

### Bug 4: Missing `has_seen_welcome` Column

**File:** [complete-profile/page.tsx:44](file:///c:/projects/mix%20sales/src/app/complete-profile/page.tsx#L44)
**Problem:** Code sets `has_seen_welcome: true` but column may not exist in production.
**Impact:** `/complete-profile` form submission fails with 400 Bad Request.

**Fix SQL:**
```sql
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='profiles' 
                   AND column_name='has_seen_welcome') THEN
        ALTER TABLE public.profiles ADD COLUMN has_seen_welcome BOOLEAN DEFAULT FALSE;
    END IF;
END $$;
NOTIFY pgrst, 'reload schema';
```

---

## 🟡 SECURITY ISSUES

### Issue 1: Hardcoded Admin Credentials

**File:** [admin-auth.ts:2-3](file:///c:/projects/mix%20sales/src/lib/admin-auth.ts#L2-L3)
```typescript
export const ADMIN_USERNAME = 'admin'
export const ADMIN_PASSWORD = 'm58858'
```
**Risk:** Credentials in source code → anyone with repo access can become admin. Also committed to Git history.
**Fix:** Move to environment variables: `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH` (use bcrypt).

---

### Issue 2: Weak Token Generation

**File:** [api/admin/invite/route.ts:22](file:///c:/projects/mix%20sales/src/app/api/admin/invite/route.ts#L22)
```typescript
const token = Math.random().toString(36).substring(2, 11) + '-' + Math.random().toString(36).substring(2, 6)
```
**Risk:** `Math.random()` is **not cryptographically secure**. Tokens can be predicted.
**Fix:** Use `crypto.randomUUID()` or `crypto.randomBytes(32).toString('hex')`.

---

### Issue 3: Hardcoded Admin ID

**File:** [api/admin/invite/route.ts:32,42](file:///c:/projects/mix%20sales/src/app/api/admin/invite/route.ts#L32)
```typescript
created_by: '316f0351-26d1-4b4f-9d00-73cf9e2c8231' // Hardcoded Admin ID
```
**Risk:** If admin user is deleted or changed, all invites break.
**Fix:** Resolve admin user dynamically from the session or admin auth context.

---

### Issue 4: Session Value is Deterministic

**File:** [admin-auth.ts:7](file:///c:/projects/mix%20sales/src/lib/admin-auth.ts#L7)
```typescript
export const ADMIN_SESSION_VALUE = 'authorized_' + btoa(ADMIN_USERNAME + ADMIN_PASSWORD)
```
**Risk:** `btoa` is NOT hashing — it's reversible Base64 encoding. Anyone can decode `authorized_YWRtaW5tNTg4NTg=` to get `adminm58858`.

---

## 🟠 RELIABILITY ISSUES

### Issue 1: No try/catch in Auth Callback

**File:** [route.ts](file:///c:/projects/mix%20sales/src/app/auth/callback/route.ts)
**Scenario:** If [createAdminClient()](file:///c:/projects/mix%20sales/src/lib/supabase/admin.ts#3-14) throws (missing env var), the entire callback crashes with an unhandled 500.
**Fix:** Wrap entire GET handler in try/catch.

### Issue 2: Middleware Fails Open

**File:** [middleware.ts:113-116](file:///c:/projects/mix%20sales/src/lib/supabase/middleware.ts#L113-L116)
**Scenario:** On any error, middleware returns `NextResponse.next()` — **allowing unauthenticated access** to all routes.
**Fix:** On error, redirect to `/login` instead.

### Issue 3: [logActivity](file:///c:/projects/mix%20sales/src/lib/activity.ts#13-43) Uses Anon Client in Callback

**File:** [route.ts:92](file:///c:/projects/mix%20sales/src/app/auth/callback/route.ts#L92)
```typescript
await logActivity(supabase, user.id, 'login', 'Registered via invitation')
```
**Problem:** `supabase` here is the **anon client**, but `activity_logs` INSERT policy requires `auth.uid() IS NOT NULL`. If the session cookie isn't properly set yet during the callback, this may fail silently.
**Fix:** Use `adminClient` for [logActivity](file:///c:/projects/mix%20sales/src/lib/activity.ts#13-43) calls in the callback.

---

## 🟢 WORKING CORRECTLY

- ✅ Invite page validates token against DB before showing login button
- ✅ Middleware is Edge-compatible (no Node.js-only imports) 
- ✅ `adminClient` correctly uses `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS in callback
- ✅ Profile fallback creation in callback works correctly
- ✅ `used_at` is set BEFORE redirecting (prevents reuse)
- ✅ Expired/used invites show proper Arabic error messages
- ✅ Schema has `UNIQUE` constraint on invite token column
- ✅ Environment variables are synced between [.env.local](file:///c:/projects/mix%20sales/.env.local) and Vercel

---

## 📋 PRIORITIZED FIX PLAN

### Step 1: Fix RLS Recursion (Fixes ALL 500 errors)
Run the SQL from **Bug 1** above in Supabase SQL Editor. This is the **single fix** that will unblock the entire app.

### Step 2: Create `activity_logs` Table
Run the SQL from **Bug 3** above. This prevents silent failures in activity logging.

### Step 3: Add Missing Columns
Run the SQL from **Bug 4** above. This fixes the `/complete-profile` 400 error.

### Step 4: Fix Token Passing (Prevents Future Invite Failures)
Update [login-button.tsx](file:///c:/projects/mix%20sales/src/app/invite/%5Btoken%5D/login-button.tsx) and [route.ts](file:///c:/projects/mix%20sales/src/app/auth/callback/route.ts) as shown in **Bug 2** to use cookies instead of query params.

### Step 5: Wrap Callback in try/catch
Add top-level error handling to [route.ts](file:///c:/projects/mix%20sales/src/app/auth/callback/route.ts).

### Step 6: Fix Security Issues (Non-Urgent)
- Move admin credentials to env vars
- Replace `Math.random()` with `crypto.randomUUID()`
- Remove hardcoded admin ID

---

## 🚀 COMBINED FIX SQL (Steps 1-3 in one script)

Run this **single script** in [Supabase SQL Editor](https://supabase.com/dashboard/project/irupbhpuiudjoljnwizl/sql/new):

```sql
-- ═══════════════════════════════════════════
-- STEP 1: Fix RLS Infinite Recursion
-- ═══════════════════════════════════════════
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile." ON public.profiles;
DROP POLICY IF EXISTS "Admins have full access" ON public.profiles;
DROP POLICY IF EXISTS "Admins can see all profiles." ON public.profiles;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins full access"
  ON public.profiles FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  )
  WITH CHECK (
    EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND p.role = 'admin')
  );

-- ═══════════════════════════════════════════
-- STEP 2: Create activity_logs Table
-- ═══════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL,
    description TEXT,
    entity_type TEXT,
    entity_id TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Anyone can view activities" ON public.activity_logs;
CREATE POLICY "Anyone can view activities" ON public.activity_logs FOR SELECT USING (true);
DROP POLICY IF EXISTS "Authenticated can insert activities" ON public.activity_logs;
CREATE POLICY "Authenticated can insert activities" ON public.activity_logs FOR INSERT WITH CHECK (true);

-- ═══════════════════════════════════════════
-- STEP 3: Add Missing Columns
-- ═══════════════════════════════════════════
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='has_seen_welcome') THEN
        ALTER TABLE public.profiles ADD COLUMN has_seen_welcome BOOLEAN DEFAULT FALSE;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='job_title') THEN
        ALTER TABLE public.profiles ADD COLUMN job_title TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='monthly_target') THEN
        ALTER TABLE public.profiles ADD COLUMN monthly_target NUMERIC DEFAULT 0;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='theme_preference') THEN
        ALTER TABLE public.profiles ADD COLUMN theme_preference TEXT DEFAULT 'light';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='last_login_at') THEN
        ALTER TABLE public.profiles ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- ═══════════════════════════════════════════
-- STEP 4: Reload Schema Cache
-- ═══════════════════════════════════════════
NOTIFY pgrst, 'reload schema';
```

> [!CAUTION]
> Run this script **exactly once**. Running it multiple times is safe (all commands are idempotent) but unnecessary.
