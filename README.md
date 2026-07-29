# College Connect — Setup

No coding required for these steps — just clicking through free dashboards.
Budget about 20–30 minutes the first time.

## 1. Create your database (Supabase)

1. Go to supabase.com → sign up (free) → "New Project"
2. Pick any name/password, wait ~2 min for it to spin up
3. In the left sidebar, click **SQL Editor** → **New query**
4. Open `supabase/schema.sql` in this folder, copy all of it, paste it in, click **Run**
   - This creates the tables (profiles, groups, posts, messages), a private
     `avatars` storage bucket for profile photos, and Row Level Security
     policies that scope every read/write to the signed-in user — not just
     "anyone with the link."
5. In the left sidebar, click **Authentication → Providers**, confirm **Email**
   is enabled. This app signs people in with a passwordless magic link, so no
   further provider setup is needed.
6. Still under **Authentication → URL Configuration**, set **Site URL** (and
   add a **Redirect URL**) to your deployed link once you have one from step 3
   below — this is what the magic link email will send people back to. You can
   leave it as `http://localhost:5173` for now and come back to update it.
7. In the left sidebar, click **Project Settings → API**
8. Copy the **Project URL** and the **anon public** key — you'll need both next

## 2. Put the project on GitHub

1. Go to github.com → sign up if you don't have an account → **New repository**
2. Name it `college-connect`, keep it **Private** (recommended for a beta), create it
3. On the new repo page, click **uploading an existing file**
4. Drag in every file and folder from this project, commit

## 3. Deploy it (Vercel)

1. Go to vercel.com → sign up with your GitHub account
2. **Add New → Project** → select your `college-connect` repo → **Import**
3. Vercel will auto-detect it's a Vite app — leave the defaults
4. Before clicking Deploy, open **Environment Variables** and add:
   - `VITE_SUPABASE_URL` → paste the Project URL from step 1
   - `VITE_SUPABASE_ANON_KEY` → paste the anon public key from step 1
5. Click **Deploy**. In about a minute you'll get a live link like
   `college-connect-yourname.vercel.app`
6. Go back to Supabase **Authentication → URL Configuration** and update the
   **Site URL** / **Redirect URLs** to that real Vercel link, so magic-link
   emails send people to the right place.

## 4. Invite real testers

Text or email people the Vercel link. The first time they open it, they'll
enter their email, get a magic sign-in link, and set up their profile. Ask
them to actually try posting in a group, messaging someone, and uploading a
profile photo — and to tell you what's confusing.

## Good to know before you send it out

- **Sign-in is real Supabase Auth (email magic links)**, and every table is
  locked down with Row Level Security scoped to the signed-in user — people
  can only edit their own profile, only see their own message threads, and
  only manage their own group memberships. This is meaningfully more secure
  than a shared invite code, but there's still no admin/moderation tooling —
  keep the testing group to people you trust.
- **Profile photos are stored in Supabase Storage** (an `avatars` bucket),
  not embedded as base64 text in the database, so they won't bloat the
  database as more people join.
- **Messages refresh every few seconds while a chat is open**, not instantly —
  good enough for testing, not true real-time chat yet (a good next step is
  Supabase Realtime subscriptions instead of polling).
- Want it to feel like an app on someone's phone? After they open the link,
  they can tap Share → **Add to Home Screen** (iOS Safari) or the equivalent
  in Chrome — it'll launch full-screen with an icon, no App Store needed.
