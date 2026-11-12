# Productivity Dashboard

A personal productivity dashboard: workstreams, a task board, a critical path, documents and reminders.

I designed the workflow, the categories and the interface, and built the tool with AI assistants I direct. This public copy is a **fictional example** (a made-up professional conference, “Cumbre Meridian”, with a sample target date of 15 September 2027). It does not contain a real brand, real tasks, supplier or client contacts, visit notes, documents, emails, phone numbers or access credentials. Statuses in the seed start as “Por hacer”; any live progress stays on the private deploy.

Live demo (example data only): [GitHub Pages](https://andreagzzgrcia.github.io/productivity-dashboard/)

## What it does

- **Eleven workstreams** for a sample conference launch (organisation, programme, speakers, venue, registrations, and so on).
- **Task board** with statuses *Por hacer*, *En curso* (capped at 3 at a time), *Bloqueada* and *Hecha*, priorities, start and due dates, and a critical-path flag.
- **Overview** with progress, upcoming deadlines and the next actions on the critical path.
- **Notes and documents** attached to a task or a category (documents stay in the saved state, up to 2 MB each).
- **Reminders** in the browser (optional notifications).
- **Sync.** On a Cloudflare deploy, state is stored in KV (`GET`/`POST /api/state`). Locally, the app falls back to the browser (`localStorage`).
- **Private by default.** The live (personal) deploy is served only under a secret URL path; the site root returns 404. That path and every API token stay out of this repository.

## Stack

- Front end: a single HTML/CSS/JS page (`index.html`).
- Deploy: a Cloudflare Worker (`worker.js`) plus a KV namespace for saved state.
- Config: `wrangler.toml.example` and `publish.sh`.

## Run the demo locally

```bash
git clone https://github.com/andreagzzgrcia/productivity-dashboard.git
cd productivity-dashboard
python3 -m http.server 8080
```

Then open [http://localhost:8080/](http://localhost:8080/). You can also open `index.html` directly as a file. Without the Worker, changes are saved in the browser only.

## Deploy your own (optional)

1. Copy `wrangler.toml.example` to `wrangler.toml` and fill in your KV namespace id.
2. Create `.secret` with a long random path segment (`chmod 600 .secret`).
3. Run `./publish.sh`, then `wrangler secret put SECRET < .secret` the first time.

Never commit `.secret` or `wrangler.toml`.

## License

MIT. The seeded tasks describe a fictional example project; they are not a record of a real launch, contracts, contacts or financial figures.
