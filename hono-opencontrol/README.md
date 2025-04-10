# Hono OpenControl

A simple Hono application with OpenControl integration.

## Getting Started

1. Install dependencies:

```bash
bun install
```

2. Set up environment variables:

Copy the `.env` file to `.env.local` and add your Anthropic API key:

```bash
cp .env .env.local
```

Then edit `.env.local` to add your Anthropic API key.

3. Run the development server:

```bash
bun run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

- Hono web server
- OpenControl integration
- Simple echo tool example
- Basic frontend

## API Endpoints

- `/` - Home page
- `/opencontrol` - OpenControl UI
- `/auth` - Authentication endpoint (requires Bearer token)
- `/generate` - Generation endpoint
- `/mcp` - Model Context Protocol endpoint

## Configuration

You can configure the application using environment variables:

- `PORT` - The port to run the server on (default: 3000)
- `OPENCONTROL_PASSWORD` - The password for authentication (default: "password")
- `OPENCONTROL_DISABLE_AUTH` - Disables request authentication (default: false)
- `ANTHROPIC_API_KEY` - Your Anthropic API key

## License

MIT
