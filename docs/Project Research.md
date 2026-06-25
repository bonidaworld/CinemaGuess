# CinemaGuesser research report

## Executive assessment

CinemaGuesser is a realistic solo project. The game loop itself is not technically hard: show one still image, render a timeline-like visual cue, collect a normalized guess, and score the distance from the correct relative timestamp. For a first version, the shortest path is a web-native stack with a small offline preprocessing pipeline, not a game engine-heavy approach. Next.js is explicitly designed for full-stack web apps, TypeScript adds static typing on top of JavaScript, PostgreSQL is a mature and reliable relational database, and Supabase packages Postgres, auth, APIs, storage, and server-side functions into one platform. 

The hardest part is not the slider mechanic. It is content. TMDb’s docs say their API is for using movie, TV, actor images and data in applications, but they also state that their free API is for non-commercial purposes with attribution, that commercial projects should contact sales, and that TMDb does not claim ownership of the images or data in the API. The U.S. Copyright Office likewise treats motion pictures as protected audiovisual works, says fair use is case-specific, and says that if you need permission, you ask the owner directly. In practice, that means your biggest product risk is rights clearance for film frames, not frontend code. 

The cleanest way to de-risk the project is to build v1 around either public-domain films or clearly rights-cleared material. If you want modern commercial movies in a public browser game, assume you need a licensing conversation. Do not assume that extracting frames yourself, or consuming a metadata API, automatically gives you public display rights for those frames. 
## Tools and development workflow

A strong first stack for you is: **Next.js + TypeScript** for the browser app, **Supabase Postgres** for structured data and leaderboards, **Supabase Auth** only if you later want accounts, **Cloudflare R2** for frame image storage, **Python + FFmpeg + PySceneDetect** for offline frame extraction and candidate generation, and **TMDb + Wikidata** for movie metadata. That stack plays well with your existing SQL and light Python background, and it matches the kind of code generation/refactoring workflow that works well in VS Code. Next.js gives you the UI layer and server routes; TypeScript reduces runtime mistakes; Supabase gives you managed Postgres plus APIs and optional auth; R2 is S3-compatible object storage with zero egress charges; FFmpeg handles media processing; PySceneDetect helps detect shot changes so you do not fill the game with black frames, logos, or nearly identical stills.

A practical breakdown looks like this:

| Layer | Recommended tool | What it should do |
|---|---|---|
| Browser UI | Next.js + TypeScript | Render the still, filmstrip, slider, round state, results screen |
| Data model | Supabase Postgres | Store movies, frames, rounds, guesses, scores, leaderboards |
| Auth | Supabase Auth | Optional sign-in if you later add profiles, streaks, saved stats |
| Server logic | Next.js route handlers or Supabase Edge Functions | Return round payloads, keep the answer hidden, score guesses |
| Asset storage | Cloudflare R2 | Store optimized frame stills and pre-rendered filmstrips |
| Offline pipeline | Python + FFmpeg + PySceneDetect | Extract frames, detect shots, calculate relative timestamps |
| Metadata ingest | TMDb + Wikidata | Pull title, year, runtime, genres, external IDs, posters if needed |

That mapping is directly aligned with the official capabilities of the tools: Next.js for full-stack web apps, TypeScript for typed JavaScript, Supabase for Postgres/Auth/Realtime/Functions/API, R2 for S3-compatible object storage, FFmpeg for media conversion and filtering, PySceneDetect for shot change detection, TMDb for movie data/images, and Wikidata for CC0 structured data.

One important implementation choice: do **not** generate frames on demand in production. Extract and score everything offline ahead of time. The browser app should only request already-generated images and metadata. That keeps the live app cheap, fast, and simple to deploy. FFmpeg and PySceneDetect are far better suited to an offline ingest pipeline than to request-time processing. 

## Project stack and component responsibilities

For this game, your backend should be deliberately boring. The database holds canonical movie records and precomputed frame records. A useful core schema is: `movies`, `frames`, `playable_rounds`, `guesses`, and optionally `users` and `leaderboard_entries`. The key stored value is not “20%” as text but a normalized float, for example `relative_position = timestamp_seconds / runtime_seconds`. That makes scoring trivial and keeps the system independent of exact runtimes, director’s cuts, or display formatting.

The frontend responsibility is only presentation and input: fetch one playable round, show `frame_image_url`, show one pre-rendered filmstrip image or a small set of thumbnails, accept the slider value, submit the guess, then reveal the real position and score. The backend responsibility is to keep the answer hidden until submission. If the client receives the true timestamp up front, users can inspect the response in devtools and cheat. This is where a small server layer matters: Next.js route handlers or Supabase Edge Functions can return a public round payload without the answer, then score the guess server-side and return the result. Next.js is full-stack by design, and Supabase Edge Functions are globally distributed server-side TypeScript functions for exactly this kind of lightweight backend logic. 

Supabase is especially suitable here because you already know SQL. Its docs emphasize that the platform is built around Postgres, that it auto-generates APIs from your database schema, and that Row Level Security is the mechanism used to make direct client access safe. If you later add accounts and dashboards, you can expose read-safe tables directly to the browser and keep score submission behind a protected function or RPC call. c

For assets, store **optimized stills** and **pre-rendered filmstrips**, not a dense wall of hundreds of separate timeline thumbnails per round. R2 pricing is cheap on storage and has free egress, but it still charges by request class after the free tier, and Cloudflare’s own pricing page shows that high-volume asset hosting can become request-cost-heavy even when storage itself is negligible. Pre-rendering a single strip image per round or per movie is therefore much smarter than loading dozens or hundreds of individual thumbnails every time someone plays.

Your offline ingest pipeline should look like this. First, ingest a legally usable video source. Second, run `ffprobe`/FFmpeg to get the runtime and extract frame candidates. Third, run PySceneDetect so your candidate set is anchored to actual shot boundaries instead of arbitrary frame intervals. Fourth, keep a manual review step so you can reject title cards, credits, black frames, subtitles-only frames, or frames that make the answer too obvious. FFmpeg is built to read, filter, and transcode media, and PySceneDetect is meant to detect cuts/transitions and generate output from the resulting scene information. 

## Budget and operating costs

If you keep the first version non-commercial and use only public-domain or otherwise cleared content, the **infrastructure** budget can be extremely low. Vercel’s Hobby plan is free, Supabase’s Free plan includes a 500 MB database, 1 GB file storage, 5 GB egress, 50,000 monthly active users, and 500,000 Edge Function invocations, and Cloudflare R2’s free tier includes 10 GB-month of storage, 1 million Class A operations, and 10 million Class B operations with free egress. TMDb’s developer API is free for non-commercial use if you attribute TMDb properly.

That means a realistic **learning prototype** can be built for roughly **$0 per month in platform cost**, plus an optional domain name and any local hardware/storage you already own. The same is true for a small closed alpha if you optimize images and keep the catalog modest. A catalog of a few hundred movies with a few dozen optimized playable stills each is still likely to fit in low single-digit gigabytes, which sits comfortably inside R2’s free 10 GB storage tier if you keep assets compressed and avoid storing unnecessary variants. That storage estimate is an inference, but the free tier limits themselves are explicit.

A more public **beta** usually wants paid reliability before it wants more features. Vercel Pro starts at $20/month, and Supabase Pro starts at $25/month. If your traffic is still moderate, R2 may remain free or near-free because storage is $0.015/GB-month, the first 10 GB are free, and egress is free; for small image catalogs the more likely cost driver is request volume, not raw storage. A sane “serious beta” budget is therefore roughly **$45–60/month** in base infrastructure before domain costs. 

The place where budgeting becomes genuinely uncertain is **content rights**. TMDb does not publish a universal public price for commercial use on the developer FAQ; it routes commercial users to sales. The Copyright Office says that if permission is needed, you contact the owner. So if you want modern commercial films in a public game, you should assume that licensing is a negotiated cost center and probably the dominant one. That cost could be trivial for a niche rights-holder relationship or completely out of reach for a broad commercial catalog. There is no honest flat estimate without the specific catalog and territory.

There is also one subtle operating cost to design around: **too many image requests**. Cloudflare’s own R2 pricing examples show that 100,000 files averaging 100 KB with 10,000,000 reads per day can reach $104.40/month, even with zero storage charges, because Class B reads dominate. Vercel’s Hobby plan also includes only 100 GB/month of fast data transfer. That is the strongest argument for sparse filmstrips, lazy loading, and preferably one contact-sheet-like strip asset instead of dozens of separate thumbnails per round. 

## Delivery timeline

The realistic timeline depends less on code volume and more on your available weekly hours. With a full-time job and other obligations, a good planning assumption is **6–8 focused hours per week**.

Under that assumption, a **first playable prototype** is about **40–60 hours**, or roughly **6–8 weeks**. That prototype would include one game mode, no authentication, a small curated catalog, a Python import script, and a simple result screen. A **real MVP** is closer to **90–140 hours**, or about **3–5 months** part-time, because polish takes time: answer hiding, admin ingestion, frame review, leaderboard logic, production deployment, bug fixing, and a small amount of analytics or moderation tooling.

A more robust **public launch** is usually **160–250 hours**, which translates to roughly **6–9 months** part-time. That is when non-obvious work appears: queuing more content, rights tracking, better asset optimization, handling bad guesses and abandoned rounds, anti-cheat considerations, and catalog maintenance as you discover that some frames are too easy or too impossible. This is an estimate, not a published benchmark; it is based on the actual responsibilities implied by the stack, pipeline, and rights constraints described above.

The fastest way to shorten the timeline is to cut scope aggressively. The biggest accelerators are: skip multiplayer, skip social features, skip user accounts in v1, skip mobile-native wrappers, skip full admin UI, and start with a small hand-reviewed catalog. The biggest schedule risk is not code; it is content review and rights uncertainty. 


## Film metadata, frames, and rights

For **movie metadata**, TMDb is the most natural primary source for this project. Its API supports movie search, movie details by ID, discovery/filtering, external-ID lookup, daily ID exports, and image URL construction from `base_url`, `file_size`, and `file_path`. The free developer API is explicitly for non-commercial purposes with required attribution, and the required notice is also documented. For a quiz game, that gives you a workable source for titles, years, runtimes, genres, release dates, poster/backdrop paths, and external IDs. 

Wikidata is a useful secondary source if you want an **open metadata backbone**. Wikidata’s structured data is CC0/public-domain-equivalent, and both its data access pages and REST/API docs are public. That makes it a good place to store or cross-check open fields such as title, release year, director, country, and external identifiers, especially if you want to reduce dependence on a single proprietary provider for non-image fields.

IMDb is more nuanced. IMDb’s developer site offers licensed commercial metadata products through AWS Data Exchange, and IMDb also publishes non-commercial datasets. But IMDb’s own help pages say that the non-commercial data is for personal and non-commercial use and must not be altered, republished, resold, or repurposed to create an online/offline database of movie information except for individual personal use. So IMDb is useful for personal research or properly licensed enterprise use, but it is a bad foundation for a public website unless you have the right license. 

OMDb can help for quick prototypes, but it is better treated as a convenience layer than as the core of the product. Its site says the API is a REST service for movie information, that the free key has a 1,000-daily limit, and that the poster API is only available to patrons. That may be fine for testing or a side script, but it is a weaker long-term primary source than TMDb for your use case. 

For **frames**, there are only three serious paths.

The safest path is **public-domain/free-reuse films**. The Library of Congress has a public-domain film selection, and its Citizen DJ subset explicitly says those identified public-domain works are free to use and reuse without restriction, including commercial reuse. That is the cleanest legal route for a first public prototype. 

The second path is **rights-cleared modern content**. That means permission from the rightsholder, distributor, or another party who can grant the needed rights. The Copyright Office’s guidance is blunt: if you need permission, ask the copyright owner. This is the route you would need for a serious modern-cinema version of the game. 

The third path is **doing it anyway and hoping fair use saves you**, which is not a sound product strategy. The Copyright Office says fair use depends on all the circumstances and does not follow a simple percentage rule. For a public game that revolves around redisplaying copyrighted frames, you should treat fair use as a legal defense question for counsel, not as an engineering assumption.

One further warning: the Library of Congress National Screening Room includes both copyrighted and public-domain titles, even though many titles are downloadable. So it is useful as a source of accessible film material, but only the clearly public-domain/free-reuse subset is safe for indiscriminate reuse. Do not scrape a mixed archive and assume all downloadable titles are reusable in your game. 

## Best starting shape for your first version

The strongest v1 is not “GeoGuessr for all cinema ever made.” It is a narrow, legally clean, technically boring version:

Build a single-player browser game with one still image, one pre-rendered filmstrip, one slider, and one results screen. Use Next.js and TypeScript for the app, Supabase Postgres for rounds and scores, R2 for images, and Python with FFmpeg/PySceneDetect for offline ingest. Use TMDb for metadata and either public-domain films or explicitly cleared sources for frames. Keep the first catalog small enough that you can manually reject bad frames and verify rights title by title. That stack is fast to ship, inexpensive to host, and aligned with the actual constraints documented by the platforms and content sources above. 

If this were my recommendation for your exact background, it would be: **do not use Godot for v1**, **do not start with modern licensed movies**, **do not build multiplayer**, and **do not overbuild the backend**. Ship the simplest browser MVP that proves the guessing mechanic feels good. If players like it, then spend time and money on content expansion and licensing. The code path is straightforward; the catalog path is the real business decision. 