import { useEffect, useState } from "react"

import "~style.css"

function IndexPopup() {
  const [apiKey, setApiKey] = useState("")
  const [summary, setSummary] = useState("")
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState("") // 用来显示当前状态

  // 加载保存的 API Key
  useEffect(() => {
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.get("openai_key", (data) => {
        if (data.openai_key) setApiKey(data.openai_key)
      })
    }
  }, [])

  const saveKey = (key: string) => {
    setApiKey(key)
    if (typeof chrome !== "undefined" && chrome.storage) {
      chrome.storage.sync.set({ openai_key: key })
    }
  }

  const getPageContent = () => {
    try {
      const text =
        document.body?.innerText || document.documentElement?.innerText || ""
      if (!text) return ""
      // 简单的清理，减少 Token 消耗
      return text.replace(/\s+/g, " ").trim()
    } catch (e) {
      return ""
    }
  }

  const handleSummarize = async () => {
    if (!apiKey) {
      alert("请先输入 OpenAI API Key")
      return
    }

    if (typeof chrome === "undefined" || !chrome.tabs || !chrome.scripting) {
      alert("Chrome 扩展 API 未加载，请刷新页面")
      return
    }

    setLoading(true)
    setSummary("")
    setStatus("正在读取页面内容...")

    try {
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true
      })

      // 1. 获取内容
      const result = await chrome.scripting.executeScript({
        target: { tabId: tab.id! },
        func: getPageContent
      })
      const pageText = result[0].result

      if (!pageText) {
        throw new Error("无法获取页面内容")
      }

      setStatus("正在思考 (Requesting OpenAI)...")

      // 2. 调用 OpenAI API (使用 fetch)
      // 这里我们使用 fetch 而不是 SDK，为了减少打包体积和配置复杂度，原理是一样的
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini", // 或者 gpt-3.5-turbo，便宜且快
            messages: [
              {
                role: "system",
                content:
                  "你是一个高效的网页内容总结助手。请用中文简要总结用户提供的网页内容，列出 3-5 个关键点，并使用 Markdown 格式。"
              },
              {
                role: "user",
                content: pageText
              }
            ],
            temperature: 0.7
          })
        }
      )

      const data = await response.json()

      // 检查 HTTP 状态码
      if (!response.ok) {
        throw new Error(
          data.error?.message || `API 请求失败: ${response.status}`
        )
      }

      // 检查返回数据格式
      if (!data.choices || data.choices.length === 0) {
        throw new Error("API 返回了空结果")
      }

      const aiText = data.choices[0]?.message?.content
      if (!aiText) {
        throw new Error("无法获取 AI 响应内容")
      }

      setSummary(aiText)
      setStatus("完成！")
    } catch (error: any) {
      console.error(error)
      setSummary(`出错了: ${error.message}`)
      setStatus("错误")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ width: 400, padding: 20, fontFamily: "sans-serif" }}>
      <h2 style={{ marginBottom: 15 }}>Page Mind 🧠</h2>

      {/* API Key 输入区 */}
      <div style={{ marginBottom: 15 }}>
        <input
          type="password"
          placeholder="输入 OpenAI API Key (sk-...)"
          value={apiKey}
          onChange={(e) => saveKey(e.target.value)}
          style={{ width: "100%", padding: 8, boxSizing: "border-box" }}
        />
        <small style={{ color: "#666" }}>Key 仅保存在你的本地浏览器中</small>
      </div>

      <hr
        style={{ border: "0", borderTop: "1px solid #eee", margin: "15px 0" }}
      />

      {/* 结果显示区 */}
      <div
        style={{
          minHeight: 150,
          maxHeight: 300,
          overflowY: "auto",
          background: "#f9f9f9",
          padding: 10,
          borderRadius: 4,
          marginBottom: 15,
          fontSize: "14px",
          lineHeight: "1.5",
          whiteSpace: "pre-wrap" // 保留换行
        }}>
        {summary ||
          (status ? status : "打开一个文章页面，点击下方按钮开始总结。")}
      </div>

      <button
        onClick={handleSummarize}
        disabled={loading || !apiKey}
        style={{
          width: "100%",
          padding: "10px",
          background: loading ? "#ccc" : "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: loading ? "not-allowed" : "pointer",
          fontWeight: "bold"
        }}>
        {loading ? status : "✨ AI 智能总结"}
      </button>
    </div>
  )
}

export default IndexPopup
