export {}

// 配置：点击插件图标时直接打开侧边栏
// 注意：这个 API 需要 Chrome 114+ 版本
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error))
