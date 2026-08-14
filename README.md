# Banana Claude (installed copy)

This repo contains an installed copy of the [Banana Claude](https://github.com/AgriciDaniel/banana-claude)
Claude Code plugin/skill -- an AI image generation Creative Director powered
by Google's Gemini Nano Banana models.

## Usage

Load it as a local plugin directory:

```bash
claude --plugin-dir .
```

Or add this repo as a marketplace source and install from it:

```
/plugin marketplace add <this-repo-url>
/plugin install banana-claude@banana-claude-marketplace
```

Then, inside Claude Code:

```
/banana setup
/banana generate "a hero image for a coffee shop website"
```

Get a free Gemini API key at [Google AI Studio](https://aistudio.google.com/apikey).

## Structure

- `skills/banana/` -- the `/banana` skill (SKILL.md, reference docs, scripts)
- `agents/brief-constructor.md` -- subagent used internally for prompt construction
- `.claude-plugin/` -- plugin and marketplace manifests
- `webapp/` -- [Banana Image Studio](webapp/README.md), a standalone deployable
  web app (FastAPI + static frontend, Docker-ready) that exposes the same
  Gemini image generation/editing as a website instead of a CLI/skill
- `.github/workflows/ci.yml` -- CI: validates the plugin manifests and skill
  scripts, and runs the webapp's test suite and Docker build on every push

## Source

Mirrored from [AgriciDaniel/banana-claude](https://github.com/AgriciDaniel/banana-claude), MIT licensed.
See `LICENSE` for details.
