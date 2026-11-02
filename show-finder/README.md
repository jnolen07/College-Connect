# Show Finder

Finished a show you loved and can't find anything like it? Search it, and Show Finder
recommends similar movies and TV — putting the ones **already on the streaming services
you pay for** first, so you don't have to sign up for anything new.

## What it does

- **Pick your services once** (Netflix, Hulu, Max, Prime Video, Disney+, … — the full list
  for your country). Saved in your browser, no account needed.
- **Search any movie or TV show**, or start from what's trending.
- **Get recommendations** split into *On your services* and *Not on your services*
  (with which service has it, in case it's worth it).
- **Tap any result** to get recommendations based on that one instead — keep going down
  the rabbit hole.
- **"Seen it"** hides titles you've already watched.
- Every recommendation page has its own link (e.g. `/#/tv/1396`) you can send to a friend.

## How recommendations work

All data comes from [The Movie Database (TMDB)](https://www.themoviedb.org/) — free, and its
where-to-stream data is powered by JustWatch. For the show you pick, Show Finder:

1. Pulls TMDB's *recommendations* ("people who liked this also liked") and *similar* lists.
2. Runs two extra searches restricted to **your** services — same genres, and same themes
   (keywords like "heist", "time travel", "small town") — so there's always something you
   can watch right now.
3. Ranks everything (recommendations count most, then genre overlap and rating), then checks
   where each one streams in your country.

The logic lives in `src/tmdb.js` → `recommend()` if you want to tweak it.

## Setup (≈10 minutes)

1. **Get a free TMDB key**: sign up at themoviedb.org → Settings → API → request a key
   (choose "Developer", personal use is fine). Copy either the *API Key* or the
   *API Read Access Token* — both work.
2. **Run locally** (needs Node.js):

   ```bash
   cd show-finder
   cp .env.example .env      # then paste your key into .env
   npm install
   npm run dev
   ```

3. **Deploy on Vercel**: New Project → import this repo → set **Root Directory** to
   `show-finder` → add the environment variable `VITE_TMDB_API_KEY` → Deploy.

Note: the key ends up in the browser bundle. TMDB keys are read-only and this is a common
setup for TMDB apps, but if you ever want to hide it, move the calls in `src/tmdb.js` behind a
small serverless function.

TMDB's terms ask apps to credit them: "This product uses the TMDB API but is not endorsed or
certified by TMDB."
