import { Hono } from "hono"
import { serveStatic } from "hono/bun"
import { create } from "opencontrol"
import { anthropic } from "@ai-sdk/anthropic"
import { tools } from "./tools"

// Create a Hono app
const app = new Hono()

// Serve static files from the public directory
app.use("/*", serveStatic({ root: "./public" }))

// Create the OpenControl instance with our Hono app
const opencontrol = create({
  tools,
  model: anthropic("claude-3-7-sonnet-latest"),
  password: process.env.OPENCONTROL_PASSWORD || "password",
  app: app,
})

// Add a route for the home page
app.get("/", (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Hono OpenControl</title>
      <style>
        body {
          font-family: system-ui, -apple-system, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          line-height: 1.6;
          color: #333;
        }
        h1, h2, h3 {
          color: #0070f3;
        }
        .card {
          background: #f9f9f9;
          border-radius: 8px;
          padding: 1.5rem;
          margin: 1.5rem 0;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        a.button {
          display: inline-block;
          background: #0070f3;
          color: white;
          padding: 0.5rem 1rem;
          border-radius: 4px;
          text-decoration: none;
          font-weight: 500;
          margin-right: 1rem;
        }
        .tool {
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #eaeaea;
        }
        .tool:last-child {
          border-bottom: none;
        }
        code {
          background: #f0f0f0;
          padding: 0.2rem 0.4rem;
          border-radius: 3px;
          font-size: 0.9em;
        }
        pre {
          background: #f0f0f0;
          padding: 1rem;
          border-radius: 5px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <h1>Hono OpenControl</h1>
      
      <div class="card">
        <h2>Welcome to OpenControl</h2>
        <p>This is a simple Hono application with OpenControl integration.</p>
        <div>
          <a href="/opencontrol" class="button">Launch OpenControl UI</a>
          <a href="/demo.html" class="button">Try Demo</a>
        </div>
      </div>
      
      <div class="card">
        <h2>Available Tools</h2>
        
        <div class="tool">
          <h3>Echo Tool</h3>
          <p>Echoes back the input message.</p>
          <pre><code>{
  "name": "echo",
  "args": {
    "message": "Hello, world!"
  }
}</code></pre>
        </div>
        
        <div class="tool">
          <h3>Calculator Tool</h3>
          <p>Performs basic arithmetic operations.</p>
          <pre><code>{
  "name": "calculator",
  "args": {
    "operation": "add", // add, subtract, multiply, divide
    "a": 5,
    "b": 3
  }
}</code></pre>
        </div>
        
        <div class="tool">
          <h3>Weather Tool</h3>
          <p>Gets the current weather for a location (mock data).</p>
          <pre><code>{
  "name": "weather",
  "args": {
    "location": "New York"
  }
}</code></pre>
        </div>
      </div>
      
      <div class="card">
        <h2>API Endpoints</h2>
        <ul>
          <li><code>/</code> - Home page</li>
          <li><code>/opencontrol</code> - OpenControl UI</li>
          <li><code>/auth</code> - Authentication endpoint (requires Bearer token)</li>
          <li><code>/generate</code> - Generation endpoint</li>
          <li><code>/mcp</code> - Model Context Protocol endpoint</li>
        </ul>
      </div>
    </body>
    </html>
  `)
})

// Start the server
const port = parseInt(process.env.PORT || "3000")
console.log(`Server is running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
