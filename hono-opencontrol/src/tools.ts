import { tool } from "opencontrol/tool"
import { z } from "zod"

// Echo tool
export const echoTool = tool({
  name: "echo",
  description: "Echo back the input",
  args: z.object({
    message: z.string().describe("Message to echo back"),
  }),
  async run(input) {
    return { echo: input.message }
  },
})

// Calculator tool
export const calculatorTool = tool({
  name: "calculator",
  description: "Perform basic arithmetic operations",
  args: z.object({
    operation: z
      .enum(["add", "subtract", "multiply", "divide"])
      .describe("Operation to perform"),
    a: z.number().describe("First number"),
    b: z.number().describe("Second number"),
  }),
  async run(input) {
    switch (input.operation) {
      case "add":
        return { result: input.a + input.b }
      case "subtract":
        return { result: input.a - input.b }
      case "multiply":
        return { result: input.a * input.b }
      case "divide":
        if (input.b === 0) {
          throw new Error("Cannot divide by zero")
        }
        return { result: input.a / input.b }
      default:
        throw new Error("Invalid operation")
    }
  },
})

// Weather tool (mock)
export const weatherTool = tool({
  name: "weather",
  description: "Get the current weather for a location",
  args: z.object({
    location: z.string().describe("Location to get weather for"),
  }),
  async run(input) {
    // This is a mock implementation
    const conditions = ["sunny", "cloudy", "rainy", "snowy"]
    const condition = conditions[Math.floor(Math.random() * conditions.length)]
    const temperature = Math.floor(Math.random() * 35) + 5 // 5-40°C

    return {
      location: input.location,
      condition,
      temperature,
      unit: "celsius",
      timestamp: new Date().toISOString(),
    }
  },
})

// Export all tools
export const tools = [echoTool, calculatorTool, weatherTool]
