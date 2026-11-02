# Show Finder

Finished a show you loved and can't find anything like it? Search it, and Show Finder
recommends similar movies and TV — putting the ones **already on the streaming services
you pay for** first, so you don't have to sign up for anything new.

## What it does

1. **Intro**: black screen, gold "ShowFinder" under a moving spotlight → **Next**.
2. **Pick your services**: the top 10 (Netflix, Prime Video, Disney+, HBO Max, Hulu,
   Peacock, Paramount+, Apple TV, Crunchyroll, Tubi) with their real logos. Select as many as you use.
3. **What have you watched?**: search shows/movies and rate them ❤️ Loved / 👍 Liked / 👎 Not for me.
4. **Picks for you**: recommendations blended from everything you loved/liked, with
   *On your services* first. Each card says which service it's on and which of your shows it's like.
5. **Search** any title for "more like this", and **My shows** to see/change what you've rated.
   Rate anything from any page with **Seen it?** and it drops out of your recommendations.

Everything you pick is saved in your browser — no account needed.

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

No key set on the server? The site asks for one on first use and saves it in that browser,
so you can also just paste it there.

Logos: bundled brand marks from Simple Icons; Disney+ and Peacock load their official site
icons at runtime (with a text fallback). The service list lives in `src/services.js`.

Note: the key ends up in the browser bundle. TMDB keys are read-only and this is a common
setup for TMDB apps, but if you ever want to hide it, move the calls in `src/tmdb.js` behind a
small serverless function.

TMDB's terms ask apps to credit them: "This product uses the TMDB API but is not endorsed or
certified by TMDB."
