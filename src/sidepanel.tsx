import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import Markdown from "markdown-to-jsx"
import { useEffect, useRef, useState } from "react"

import "~style.css"

type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

function IndexSidePanel() {
  // 改个名，虽不强制但符合语义
  const [apiKey, setApiKey] = useState("")
  const [pageContext, setPageContext] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("正在初始化...")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(scrollToBottom, [messages])

  useEffect(() => {
    chrome.storage.sync.get("openai_key", (data) => {
      if (data.openai_key) setApiKey(data.openai_key)
    })
    // 首次打开自动抓取
    grabContent()
  }, [])

  const saveKey = (key: string) => {
    setApiKey(key)
    chrome.storage.sync.set({ openai_key: key })
  }

  const getPageContent = () => {
    const paragraphs = document.querySelectorAll("p, h1, h2, h3, li, article")
    let text = ""
    paragraphs.forEach((p) => {
      if (p.textContent && p.textContent.length > 20) {
        text += p.textContent + "\n"
      }
    })
    return text.slice(0, 15000)
  }

  const grabContent = async () => {
    setStatus("正在读取当前页面...")
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tab.id) {
        setStatus("无法连接到当前页面")
        return
      }

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getPageContent
      })
      const text = result[0].result
      setPageContext(text || "")
      setStatus(text ? "已连接当前网页" : "未找到有效文字内容")

      // 切换页面后，如果这是新对话，可以重置一下（可选）
      // 这里我们为了演示，仅仅更新 context，不强行清空历史，方便对比
    } catch (e) {
      console.error(e)
      setStatus("读取失败 (可能需要刷新页面)")
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return

    const userMsg: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const openai = createOpenAI({ apiKey, compatibility: "strict" })

      const historyForAI = [
        {
          role: "system",
          content: `你是一个网页阅读助手。以下是用户当前正在浏览的网页内容：\n\n---网页开始---\n${pageContext}\n---网页结束---\n\n请基于以上内容回答用户问题。`
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
        { role: "user", content: input }
      ] as any

      const { textStream } = await streamText({
        model: openai("gpt-4o-mini"),
        messages: historyForAI
      })

      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      let fullResponse = ""
      for await (const delta of textStream) {
        fullResponse += delta
        setMessages((prev) => {
          const newArr = [...prev]
          newArr[newArr.length - 1] = {
            role: "assistant",
            content: fullResponse
          }
          return newArr
        })
      }
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `出错: ${error.message}` }
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh", // 侧边栏占据全高
        fontFamily: "sans-serif",
        background: "#fff"
      }}>
      {/* 顶部栏：增加了刷新按钮 */}
      <div
        style={{
          padding: "12px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f8f9fa"
        }}>
        <h3 style={{ margin: 0, fontSize: "16px" }}>Page Mind 🧠</h3>
        <button
          onClick={grabContent}
          title="重新读取当前网页内容"
          style={{
            background: "transparent",
            border: "1px solid #ddd",
            padding: "4px 8px",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "12px"
          }}>
          🔄 {pageContext ? "已连接" : "连接页面"}
        </button>
      </div>

      {!apiKey && (
        <div style={{ padding: 10, background: "#fff3cd", fontSize: "12px" }}>
          <input
            type="password"
            placeholder="输入 OpenAI API Key"
            onChange={(e) => saveKey(e.target.value)}
            style={{ width: "95%", padding: 5 }}
          />
        </div>
      )}

      {/* 聊天区域 */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px"
        }}>
        {messages.length === 0 && (
          <div
            style={{
              color: "#888",
              textAlign: "center",
              marginTop: "50px",
              fontSize: "14px"
            }}>
            <p>👋 欢迎使用 Side Panel 模式。</p>
            <p>我已经准备好阅读右侧的网页了。</p>
          </div>
        )}
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "90%",
              background: m.role === "user" ? "#2563eb" : "#f3f4f6",
              color: m.role === "user" ? "#fff" : "#1f2937",
              padding: "8px 12px",
              borderRadius: "8px",
              fontSize: "14px",
              lineHeight: "1.5"
            }}>
            {m.role === "assistant" ? (
              <Markdown>{m.content}</Markdown>
            ) : (
              m.content
            )}
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: "12px", color: "#999" }}>AI 正在思考...</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 输入框区域 */}
      <div style={{ padding: "12px", borderTop: "1px solid #eee" }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问点什么..."
            disabled={loading}
            rows={1}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "1px solid #ddd",
              outline: "none",
              resize: "none",
              fontFamily: "inherit"
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              width: "40px",
              cursor: "pointer"
            }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndexSidePanel
