import { Button } from "../../ui/button"
import { IconArrowRight } from "../../ui/svg/icons"
import { useAccount } from "../../components/context-account"
import { createSignal, For, onMount } from "solid-js"
import { createToolCaller } from "./components/tool"
import { useApi } from "../components/context-api"
import style from "./index.module.css"
import Layout from "./components/layout"
import { useOpenAuth } from "../../components/context-openauth"

export default function Index() {
  const auth = useOpenAuth()
  const account = useAccount()
  const api = useApi()
  const toolCaller = createToolCaller({
    tool: {
      async list() {
        const response = await api.mcp
          .$post({
            json: {
              method: "tools/list",
              params: {},
            },
          })
          .then((r) => r.json() as any)
        return response.tools
      },
      async call(input) {
        return await api.mcp
          .$post({
            json: {
              method: "tools/call",
              params: {
                name: input.name,
                arguments: input.arguments,
              },
            },
          })
          .then((r) => r.json() as any)
      },
    },
    generate: async (prompt) => {
      return api.ai_generate
        .$post({
          json: prompt,
        })
        .then((r) => r.json() as any)
    },
    onPromptUpdated: () => { },
  })

  return (
    <div class={style.root}>
      <div data-slot="messages" data-max-width>
        <For each={toolCaller.prompt}>
          {(item) => {
            return (
              <>
                {item.role === "user" && item.content[0]?.type === "text" && (
                  <div data-component="message" data-user>
                    {item.content[0].text}
                  </div>
                )}
                {item.role === "assistant" &&
                  item.content[0]?.type === "text" && (
                    <div data-component="message" data-assistant>
                      {item.content[0].text}
                    </div>
                  )}
                {item.role === "tool" &&
                  (() => {
                    const [expanded, setExpanded] = createSignal(false)
                    return (
                      <div data-component="tool" data-expanded={expanded()}>
                        <div
                          data-slot="header"
                          onClick={() => setExpanded(!expanded())}
                        >
                          <span data-slot="name">
                            {item.content[0].toolName}
                          </span>
                          <span data-slot="expand">+</span>
                        </div>
                        <div data-slot="content">
                          {JSON.stringify(item.content[0].result)}
                        </div>
                      </div >
                    )
                  })()}
              </>
            )
          }}
        </For >
        {
          toolCaller.state.type === "loading" && (
            <div data-component="loading">
              <span>■</span>
              <span>■</span>
              <span>■</span>
            </div>
          )
        }
        {
          toolCaller.prompt.filter((item) => item.role !== "system").length >
          0 && (
            <div data-component="clear">
              <Button size="sm" color="ghost" onClick={toolCaller.clear}>
                Clear chat
              </Button>
            </div>
          )
        }
      </div >

      <div data-slot="footer" data-max-width>
        <div data-component="chat">
          <textarea
            autofocus
            placeholder="How can I help?"
            onKeyDown={(e) => {
              const value = e.currentTarget.value.trim()
              if (e.key === "Enter" && value) {
                e.preventDefault()
                toolCaller.chat(value)
                e.currentTarget.value = ""
              }
            }}
            onInput={(e) => {
              const input = e.currentTarget
              const sendButton = input.nextElementSibling as HTMLButtonElement
              if (sendButton) {
                sendButton.disabled = !e.target.value.trim()
              }

              // Auto-grow
              e.target.style.height = "3.6875rem"
              const scrollHeight = input.scrollHeight
              e.target.style.height = `${scrollHeight}px`
            }}
          />
          <Button disabled color="ghost" icon={<IconArrowRight />} />
        </div>
      </div>
    </div >
  )
}
