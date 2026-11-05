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
5. **Tap any poster** for details and **Where to watch**: every option grouped as *On your
   services*, *Stream*, *Free*, and *Rent or buy*. Tap a service to open the title there
   (it opens that service's search for the title; unknown services go to TMDB's full list).
   Links are in `src/watchLinks.js`.
6. **Search** any title for "more like this", and **My shows** to see/change what you've rated.
   Rate anything from any page with **Seen it?** and it drops out of your recommendations.

Everything you pick is saved in your browser — no account needed.

## How recommendations work

All data comes from [The Movie Database (TMDB)](https://www.themoviedb.org/) — free, and its
where-to-stream data is powered by JustWatch. For the shows you loved, ShowFinder:

1. **Collects candidates**: TMDB's "people who liked this also liked" (3 pages), plus a
   second hop (what's recommended for the top recommendations — titles that keep showing up
   across those lists are very likely the same kind of show), plus a theme search limited to
   your services. Movies for show fans (and shows for movie fans) come from the same theme
   search across types, since TMDB has no "movies like this show" list.
2. **Scores how alike they really are**: shared specific themes (TMDB keywords like
   "drug cartel" or "antihero" — generic tags like "based on novel" are ignored), shared
   genres, and how often it was co-recommended. Matching several of your loved shows counts extra.
3. **Pushes down mismatches**: a cartoon/kids/reality/talk show for a live-action drama fan,
   no genre in common, a different language, nothing thematically alike, or titles similar to
   what you rated 👎 "Not for me". Weak leftovers are cut instead of padding the list.
4. **Splits by where it streams**: *On your services* first, then everything else.

The logic lives in `src/tmdb.js` (`recommend()` / `recommendForYou()`).

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
