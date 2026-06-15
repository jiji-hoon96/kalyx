# Promotion Copy

Drafts for the v1.0 launch announcements. **Not auto-posted** — copy/paste manually after a final read.

All drafts are written in the first person ("I built kalyx because…") because that's the voice the codebase uses elsewhere (see [[feedback_user_voice_writing]]). Adjust the tone if you want, but don't switch to "Check out kalyx, the…"–style ad copy.

## Channels

| Channel | File | Best time (KST) | Notes |
|---|---|---|---|
| Reddit r/reactjs | `reddit-reactjs.md` | Tue/Wed 23:00–01:00 (US morning) | "Show off Saturday" rule — wait until Sat KST if posting outside Show-Off thread |
| Hacker News (Show HN) | `hn-show.md` | Tue/Wed 22:30 KST (US 6:30 AM PT) | Title limit 80 chars. URL must point at the docs site, not the repo |
| Twitter / X thread | `twitter-thread.md` | Wed/Thu 09:00 KST + 23:00 KST | 280 char per tweet. Pin the lead tweet for a week |
| dev.to article (teaser) | `devto-teaser.md` | Anytime | This is a teaser → links to the full blog post on the docs site once it's live |

## Pre-flight checklist (before posting any of them)

1. Star count > 5 — looks suspicious to land on Reddit/HN with zero traction
2. Vercel deploy is green and `kalyx-docs-site.vercel.app` resolves
3. `pnpm add @kalyx/react` actually works → quick smoke test in a throwaway dir
4. The "Introducing kalyx 1.0" blog post is published on the docs site (Reddit/HN/dev.to all link to it)
5. README's npm install line points at the stable tag, not `@rc`

## Don't bundle these

Channel-specific tweaks matter. Reddit is friendlier to dev backstory; HN punishes marketing tone; Twitter rewards a hook + thread; dev.to wants code samples. Each draft already accounts for the channel's culture — don't copy-paste one draft to another channel without rewriting.
