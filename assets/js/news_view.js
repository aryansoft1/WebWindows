function getQueryParam(name) {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

const id = getQueryParam("id")
const validId = /^\d+$/.test(String(id || ""))
if (!validId) {
  document.getElementById('news-title').innerText = "无法打开这篇新闻"
  document.getElementById('news-content').textContent = "新闻编号无效，请返回新闻中心重新选择。"
} else {
  fetch("getNewsById.asp?id=" + encodeURIComponent(id), { credentials: "same-origin" })
    .then(res => { if (!res.ok) throw new Error("news-" + res.status); return res.json() })
    .then(data => {
      const title = String(data.title || "未命名新闻")
      const category = String(data.category || "新闻与公告")
      document.title = `${title} - WebWindows 新闻中心`
      document.getElementById("news-title").textContent = title
      document.getElementById("news-breadcrumb-title").textContent = title
      document.getElementById("news-category").textContent = category
      document.getElementById("news-meta").textContent = `${category} ｜ ${data.created_at || ""}`
      document.getElementById("news-content").innerHTML = data.content || "<p>这篇新闻暂时没有正文。</p>"

      // 加载上一篇
      fetch("getPrevNextNews.asp?dir=prev&id=" + encodeURIComponent(id), { credentials: "same-origin" })
        .then(res => res.json())
        .then(d => {
          if (!d.error) {
            const host = document.getElementById("prev-news")
            host.append(document.createTextNode("上一篇："))
            const link = document.createElement("a"); link.href = `news_view.html?id=${encodeURIComponent(d.id)}`; link.textContent = d.title; host.appendChild(link)
          }
        })

      // 加载下一篇
      fetch("getPrevNextNews.asp?dir=next&id=" + encodeURIComponent(id), { credentials: "same-origin" })
        .then(res => res.json())
        .then(d => {
          if (!d.error) {
            const host = document.getElementById("next-news")
            host.append(document.createTextNode("下一篇："))
            const link = document.createElement("a"); link.href = `news_view.html?id=${encodeURIComponent(d.id)}`; link.textContent = d.title; host.appendChild(link)
          }
        })
    })
    .catch(() => {
      document.getElementById("news-title").textContent = "新闻暂时无法载入"
      document.getElementById("news-content").textContent = "请稍后重试，或返回新闻中心查看其他内容。"
    })
}

document.getElementById("news-detail-search")?.addEventListener("submit", event => {
  const input = event.currentTarget.elements.q
  if (!input.value.trim()) event.preventDefault()
})
