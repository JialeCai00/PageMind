import { createOpenAI } from "@ai-sdk/openai"
import { streamText } from "ai"
import { useEffect, useState } from "react"

import "~style.css"

function IndexPopup() {
  const [apiKey, setApiKey] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)

  // 加载 API Key
  useEffect(() => {
    chrome.storage.sync.get("openai_key", (data) => {
      if (data.openai_key) setApiKey(data.openai_key)
    })
  }, [])

  const saveKey = (key: string) => {
    setApiKey(key)
    chrome.storage.sync.set({ openai_key: key })
  }

  // --- 优化后的内容提取脚本 ---
  // 这段代码依然是在网页页面上下文中运行的
  const getPageContent = () => {
    // 简单的算法：通常正文的 p 标签文字最多
    // 这是一个非常基础的 heuristic (启发式) 提取
    const paragraphs = document.querySelectorAll("p, h1, h2, h3, li")
    let text = ""
    paragraphs.forEach((p) => {
      // 过滤掉太短的或者看起来像导航/隐藏的文字
      if (p.textContent && p.textContent.length > 20) {
        text += p.textContent + "\n"
      }
    })
    return text.slice(0, 20000) // 增加一点限制，防止超长
  }

  const handleSummarize = async () => {
    if (!apiKey) return alert("请输入 API Key")

    setLoading(true)
    setSummary("") // 清空上次结果

    try {
      // 1. 初始化 OpenAI 客户端
      // 注意：apiKey 是用户输入的，dangerouslyAllowBrowser 允许在前端调用
      const openai = createOpenAI({
        apiKey: apiKey,
        compatibility: "strict"
      })

      // 2. 获取网页内容
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: getPageContent
      })
      const pageText = result[0].result

      if (!pageText) throw new Error("未提取到有效内容")

      // 3. 使用 Vercel AI SDK 进行流式请求
      // streamText 是 Core API，不依赖 React Hooks，非常适合在非组件逻辑中使用
      const { textStream } = await streamText({
        model: openai("gpt-4o-mini"), // 确保你的 Key 支持该模型，或者用 gpt-3.5-turbo
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content:
              "你是一个专业的阅读助手。请将用户提供的网页内容总结为一份摘要。\n要求：\n1. 使用 Markdown 格式。\n2. 第一行用 H3 (###) 写出文章标题。\n3. 使用无序列表列出 3-5 个核心观点。\n4. 语气简洁专业，使用中文。"
          },
          {
            role: "user",
            content: pageText
          }
        ]
      })

      // 4. 处理流 (Streaming)
      // 这是一个异步迭代器，每当 AI 生成一点文字，这里就会触发一次
      for await (const textPart of textStream) {
        setSummary((prev) => prev + textPart)
      }
    } catch (error: any) {
      console.error(error)
      setSummary(`错误: ${error.message}\n(请检查 API Key 余额或网络连接)`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{
        width: 400,
        padding: 20,
        fontFamily: "sans-serif",
        display: "flex",
        flexDirection: "column",
        height: "550px"
      }}>
      <h2 style={{ margin: "0 0 15px 0" }}>
        Page Mind 🧠{" "}
        <span style={{ fontSize: "0.6em", color: "#888" }}>v2</span>
      </h2>

      <div style={{ marginBottom: 15 }}>
        <input
          type="password"
          placeholder="OpenAI API Key (sk-...)"
          value={apiKey}
          onChange={(e) => saveKey(e.target.value)}
          style={{
            width: "100%",
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          background: "#f3f4f6",
          padding: "12px",
          borderRadius: "8px",
          fontSize: "14px",
          lineHeight: "1.6",
          color: "#333",
          whiteSpace: "pre-wrap", // 关键：保持 Markdown 格式的换行
          boxShadow: "inset 0 1px 3px rgba(0,0,0,0.1)"
        }}>
        {/* 当没有内容时显示提示，有内容显示流式输出 */}
        {summary
          ? summary
          : loading
            ? "正在连接大脑..."
            : "准备就绪。点击下方按钮开始总结。"}
        {/* 一个简单的光标动画 */}
        {loading && <span className="animate-pulse"> ▍</span>}
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading || !apiKey}
        style={{
          marginTop: "15px",
          padding: "12px",
          background: loading ? "#9ca3af" : "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "6px",
          cursor: loading ? "wait" : "pointer",
          fontWeight: "600",
          transition: "background 0.2s"
        }}>
        {loading ? "正在生成中..." : "开始流式总结"}
      </button>
    </div>
  )
}

export default IndexPopup
