import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import Markdown from "markdown-to-jsx"
import { useEffect, useRef, useState } from "react"

import "~style.css"

// 定义消息类型
type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

function IndexPopup() {
  const [apiKey, setApiKey] = useState("")
  const [pageContext, setPageContext] = useState("") // 存储网页抓取的内容
  const [messages, setMessages] = useState<Message[]>([]) // 聊天记录
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("正在初始化...")

  const messagesEndRef = useRef<HTMLDivElement>(null)

  // 自动滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }
  useEffect(scrollToBottom, [messages])

  // 加载 Key 并自动抓取网页
  useEffect(() => {
    chrome.storage.sync.get("openai_key", (data) => {
      if (data.openai_key) setApiKey(data.openai_key)
    })

    // 插件一打开，自动抓取内容
    grabContent()
  }, [])

  const saveKey = (key: string) => {
    setApiKey(key)
    chrome.storage.sync.set({ openai_key: key })
  }

  // 抓取脚本
  const getPageContent = () => {
    const paragraphs = document.querySelectorAll("p, h1, h2, h3, li, article")
    let text = ""
    paragraphs.forEach((p) => {
      if (p.textContent && p.textContent.length > 20) {
        text += p.textContent + "\n"
      }
    })
    return text.slice(0, 15000) //稍微放宽一点限制
  }

  const grabContent = async () => {
    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      if (!tab.id) return

      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getPageContent
      })
      const text = result[0].result
      setPageContext(text || "")
      setStatus(
        text ? "网页内容已读取，可以开始提问了。" : "无法读取网页内容。"
      )

      // 如果没有历史消息，自动添加一个 AI 的开场白
      if (text && messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content:
              "你好！我已经阅读了当前网页。你可以让我总结它，或者问我关于页面内容的任何细节。"
          }
        ])
      }
    } catch (e) {
      console.error(e)
      setStatus("读取网页失败 (可能是权限受限的页面)")
    }
  }

  const handleSend = async () => {
    if (!input.trim() || !apiKey) return

    // 1. 立即更新 UI显示用户问题
    const userMsg: Message = { role: "user", content: input }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    try {
      const openai = createOpenAI({ apiKey, compatibility: "strict" })

      // 2. 构建完整的消息历史 (Context + History)
      // 关键：System Prompt 必须包含 pageContext
      const historyForAI = [
        {
          role: "system",
          content: `你是一个网页阅读助手。以下是用户当前正在浏览的网页内容：\n\n---网页开始---\n${pageContext}\n---网页结束---\n\n请基于以上内容回答用户问题。如果用户问的内容不在网页里，请明确告知。`
        },
        ...messages.map((m) => ({ role: m.role, content: m.content })), // 历史记录
        { role: "user", content: input } // 最新问题
      ] as any

      // 3. 流式请求
      const { textStream } = await streamText({
        model: openai("gpt-4o-mini"),
        messages: historyForAI
      })

      // 4. 创建一个空的 assistant 消息占位
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      let fullResponse = ""
      for await (const delta of textStream) {
        fullResponse += delta
        // 实时更新最后一条消息（即 AI 的回复）
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
        { role: "assistant", content: `出错啦: ${error.message}` }
      ])
    } finally {
      setLoading(false)
    }
  }

  // 处理回车发送
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div
      style={{
        width: 450,
        height: 600,
        display: "flex",
        flexDirection: "column",
        fontFamily: "sans-serif",
        background: "#fff"
      }}>
      {/* Header */}
      <div
        style={{
          padding: "12px 16px",
          borderBottom: "1px solid #eee",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "#f8f9fa"
        }}>
        <h3 style={{ margin: 0, fontSize: "16px" }}>ChatPage 🤖</h3>
        <span
          style={{ fontSize: "12px", color: pageContext ? "green" : "orange" }}>
          {pageContext ? "● 已连接网页" : "● 未连接"}
        </span>
      </div>

      {/* Settings (Hidden by default, simple toggle for API Key) */}
      {!apiKey && (
        <div style={{ padding: 10, background: "#fff3cd", fontSize: "12px" }}>
          <input
            type="password"
            placeholder="输入 OpenAI API Key"
            onChange={(e) => saveKey(e.target.value)}
            style={{ width: "90%", padding: 5 }}
          />
        </div>
      )}

      {/* Chat Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          background: "#fff"
        }}>
        {messages.map((m, idx) => (
          <div
            key={idx}
            style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "85%",
              background: m.role === "user" ? "#2563eb" : "#f3f4f6",
              color: m.role === "user" ? "#fff" : "#1f2937",
              padding: "8px 12px",
              borderRadius: "12px",
              fontSize: "14px",
              lineHeight: "1.5"
            }}>
            {m.role === "assistant" ? (
              /* 使用 ReactMarkdown 渲染 AI 的回复 */
              <Markdown>{m.content}</Markdown>
            ) : (
              m.content
            )}
          </div>
        ))}
        {loading && (
          <div style={{ fontSize: "12px", color: "#999", marginLeft: 10 }}>
            AI 正在输入...
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "12px",
          borderTop: "1px solid #eee",
          background: "#fff"
        }}>
        <div style={{ display: "flex", gap: "8px" }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="问点什么... (比如: 这篇文章的核心观点是什么？)"
            disabled={loading}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "20px",
              border: "1px solid #ddd",
              outline: "none"
            }}
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              borderRadius: "50%",
              width: "36px",
              height: "36px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}>
            ↑
          </button>
        </div>
      </div>
    </div>
  )
}

export default IndexPopup
