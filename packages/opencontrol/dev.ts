#!/usr/bin/env bun

import { create } from "./src/index.js"
import { tool } from "./src/tool.js"
import { z } from "zod"
import { anthropic } from "@ai-sdk/anthropic"

// Create a sample tool
const echoTool = tool({
  name: "echo",
  description: "Echoes back the input",
  args: z.object({
    message: z.string(),
  }),
  async run(args) {
    return { message: args.message }
  },
})

// Create the OpenControl app with the sample tool
const app = create({
  tools: [echoTool],
  model: anthropic("claude-3-7-sonnet-20250219"),
  disableAuth: true,
})

// Start the server
console.log("Starting OpenControl dev server on http://localhost:3000")
export default {
  port: 3000,
  fetch: app.fetch,
}
