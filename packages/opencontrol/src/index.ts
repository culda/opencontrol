import { Hono } from "hono"
import { Tool } from "./tool.js"
import { createMcp } from "./mcp.js"
import { cors } from "hono/cors"
import HTML from "opencontrol-frontend/dist/index.html" with { type: "text" }
import { zValidator } from "@hono/zod-validator"
import { APICallError, LanguageModelV1, LanguageModelV1CallOptions } from "ai"
import { z } from "zod"
import { HTTPException } from "hono/http-exception"
import { bearerAuth } from "hono/bearer-auth"
import type { MiddlewareHandler } from "hono"

export interface OpenControlOptions {
  tools: Tool[]
  password?: string
  model?: LanguageModelV1
  app?: Hono
}

export type App = ReturnType<typeof create>

export function create(input: OpenControlOptions) {
  const mcp = createMcp({ tools: input.tools })
  const token =
    input.password ||
    process.env.OPENCONTROL_PASSWORD ||
    process.env.OPENCONTROL_KEY ||
    "password"
  console.log("opencontrol password:", token)
  const app = input.app ?? new Hono()

  // Create the base app with CORS
  const baseApp = app.use(
    cors({
      origin: "*",
      allowHeaders: ["*"],
      allowMethods: ["GET", "POST"],
      credentials: false,
    }),
  )

  // Add the HTML route to the base app
  baseApp.get("/", (c) => {
    return c.html(HTML)
  })

  // Default auth middleware
  const defaultAuthMiddleware = bearerAuth({ token })

  // Define the API route handlers
  const authHandler = (c: any) => {
    return c.json({})
  }

  const generateHandler = async (c: any) => {
    if (!input.model)
      throw new HTTPException(400, { message: "No model configured" })
    // @ts-ignore
    const body = c.req.valid("json")
    try {
      const result = await input.model.doGenerate(body)
      return c.json(result)
    } catch (error) {
      console.error(error)
      if (error instanceof APICallError) {
        throw new HTTPException(error.statusCode || (500 as any), {
          message: "error",
        })
      }
      throw new HTTPException(500, { message: "error" })
    }
  }

  const mcpHandler = async (c: any) => {
    const body = await c.req.json()
    const result = await mcp.process(body)
    return c.json(result)
  }

  // Return an object with the fetch handler and auth method
  return {
    fetch: baseApp.fetch.bind(baseApp),

    // Method to customize auth middleware
    auth(customAuthMiddleware?: MiddlewareHandler) {
      // Use the provided auth middleware or fall back to the default
      const authMiddleware = customAuthMiddleware || defaultAuthMiddleware

      // Apply the auth middleware to each API route individually
      baseApp.get("/auth", authMiddleware, authHandler)
      baseApp.post(
        "/generate",
        authMiddleware,
        // @ts-ignore
        zValidator("json", z.custom<LanguageModelV1CallOptions>()),
        generateHandler,
      )
      baseApp.post("/mcp", authMiddleware, mcpHandler)

      // Return this for chaining
      return this
    },

    // Initialize with default auth if not customized
    init() {
      // Apply the default auth middleware to each API route
      baseApp.get("/auth", defaultAuthMiddleware, authHandler)
      baseApp.post(
        "/generate",
        defaultAuthMiddleware,
        // @ts-ignore
        zValidator("json", z.custom<LanguageModelV1CallOptions>()),
        generateHandler,
      )
      baseApp.post("/mcp", defaultAuthMiddleware, mcpHandler)
      return this
    },
  }
}
