function getQueryParam(name) {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

const id = getQueryParam("id")
const validId = /^\d+$/.test(String(id || ""))
if (!validId) {
  document.getElementById('news-title').innerText = "错误：缺少新闻ID"
} else {
  fetch("getNewsById.asp?id=" + encodeURIComponent(id), { credentials: "same-origin" })
    .then(res => res.json())
    .then(data => {
      document.getElementById("news-title").innerText = data.title
      document.getElementById("news-meta").innerText = `${data.category} ｜ ${data.created_at}`
      document.getElementById("news-content").innerHTML = data.content

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
}
