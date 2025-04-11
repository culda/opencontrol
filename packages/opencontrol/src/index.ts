import { Hono } from "hono"
import { Tool } from "./tool.js"
import { createMcp } from "./mcp.js"
import { cors } from "hono/cors"
import HTML from "opencontrol-frontend/dist/index.html" with { type: "text" }
import { zValidator } from "@hono/zod-validator"
import {
  APICallError,
  LanguageModelV1,
  LanguageModelV1CallOptions,
} from "ai"
import { z } from "zod"
import { HTTPException } from "hono/http-exception"
import { bearerAuth } from "hono/bearer-auth"
import type { Context, MiddlewareHandler } from "hono"

export interface OpenControlOptions {
  tools: Tool[]
  password?: string
  model?: LanguageModelV1
  app?: Hono
}

export type App = ReturnType<typeof create>

export function create(input: OpenControlOptions) {
  const mcp = createMcp({ tools: input.tools })
  const token = input.password || process.env.OPENCONTROL_PASSWORD || "password"
  const app = input.app ?? new Hono()

  // Create the base app with CORS
  const baseApp = app.use(
    cors({
      origin: "*",
      allowHeaders: ["*"],
      allowMethods: ["GET", "POST"],
      credentials: false,
    })
  )

  // Add the HTML route to the base app
  baseApp.get("/", (c) => {
    return c.html(HTML)
  })

  // Define the API route handlers
  const authHandler = (c: any) => {
    return c.json({})
  }

  const generateHandler = async (c: Context) => {
    if (!input.model)
      throw new HTTPException(400, { message: "No model configured" })
    // @ts-ignore
    const body = c.req.valid("json") as LanguageModelV1CallOptions
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

  const mcpHandler = async (c: Context) => {
    const body = await c.req.json()
    const result = await mcp.process(body)
    return c.json(result)
  }

  // Default auth middleware
  const defaultAuthMiddleware = bearerAuth({ token })

  return {
    fetch: baseApp.fetch.bind(baseApp),

    auth(customAuthMiddleware?: MiddlewareHandler) {
      // Use the provided auth middleware or fall back to the default
      const authMiddleware = customAuthMiddleware || defaultAuthMiddleware

      baseApp.get("/auth", authMiddleware, authHandler)
      baseApp.post(
        "/generate",
        authMiddleware,
        zValidator("json", z.custom<LanguageModelV1CallOptions>()),
        generateHandler
      )
      baseApp.post("/mcp", authMiddleware, mcpHandler)

      // Return this for chaining
      return this
    },

    // Initialize with default auth if not customized
    init() {
      baseApp.get("/auth", defaultAuthMiddleware, authHandler)
      baseApp.post(
        "/generate",
        defaultAuthMiddleware,
        zValidator("json", z.custom<LanguageModelV1CallOptions>()),
        generateHandler
      )
      baseApp.post("/mcp", defaultAuthMiddleware, mcpHandler)
      return this
    }
  }
}
