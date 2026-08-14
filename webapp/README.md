# Banana Image Studio

A small, self-contained web app for generating and editing images with
Google Gemini's "Nano Banana" image models. FastAPI backend, a single static
HTML/JS frontend, one Docker image -- deploy it anywhere that runs a
container.

It reuses the same Gemini REST API calls as the [`/banana` Claude Code
skill](../skills/banana) this repo mirrors, wrapped in a small web UI instead
of a CLI.

## Local development

```bash
cd webapp
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env   # add your GEMINI_API_KEY
export $(grep -v '^#' .env | xargs)
uvicorn app.main:app --reload
```

Open http://localhost:8000.

Get a free Gemini API key at https://aistudio.google.com/apikey.

## Tests

```bash
pytest -q
```

## Deploy

The app is a single Docker image that reads its config from environment
variables, so it deploys the same way on any platform that runs containers.

### Docker (any host)

```bash
docker build -t banana-image-studio ./webapp
docker run -p 8000:8000 -e GEMINI_API_KEY=your-key banana-image-studio
```

### Render / Railway / Fly.io / Heroku (container-based deploys)

1. Point the service at this repo, with root/build directory `webapp`.
2. Build strategy: Dockerfile (auto-detected).
3. Set the `GEMINI_API_KEY` environment variable in the platform's dashboard.
4. The app reads `PORT` from the environment automatically -- most platforms
   set this for you, so no extra config is needed.

### Plain VM / systemd

```bash
pip install -r requirements.txt
GEMINI_API_KEY=your-key PORT=8000 uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Environment variables

| Variable         | Required | Default                          | Description                  |
|-------------------|----------|-----------------------------------|-------------------------------|
| `GEMINI_API_KEY`  | yes      | --                                 | Google AI Studio API key      |
| `BANANA_MODEL`    | no       | `gemini-3.1-flash-image-preview`  | Gemini image model to call    |
| `PORT`            | no       | `8000`                            | Port the server listens on    |

## API

- `GET /api/health` -- health check
- `POST /api/generate` -- JSON `{ "prompt": str, "aspect_ratio": str, "resolution": str }` -> `{ image_base64, mime_type, text }`
- `POST /api/edit` -- multipart form (`image` file, `prompt` text) -> `{ image_base64, mime_type, text }`
