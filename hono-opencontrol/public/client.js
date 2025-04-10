// Simple client for interacting with OpenControl API
class OpenControlClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl || ""
    this.apiKey = apiKey || "password"
  }

  async authenticate() {
    try {
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Authentication failed: ${response.status}`)
      }

      return true
    } catch (error) {
      console.error("Authentication error:", error)
      return false
    }
  }

  async generate(options) {
    try {
      const response = await fetch(`${this.baseUrl}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(options),
      })

      if (!response.ok) {
        throw new Error(`Generation failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Generation error:", error)
      throw error
    }
  }

  async callTool(toolName, args) {
    try {
      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now().toString(),
          method: "tools/call",
          params: {
            name: toolName,
            arguments: args,
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Tool call failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("Tool call error:", error)
      throw error
    }
  }

  async listTools() {
    try {
      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: Date.now().toString(),
          method: "tools/list",
          params: {},
        }),
      })

      if (!response.ok) {
        throw new Error(`List tools failed: ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error("List tools error:", error)
      throw error
    }
  }
}

// Export the client
window.OpenControlClient = OpenControlClient
