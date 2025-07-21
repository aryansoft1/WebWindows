function getQueryParam(name) {
  const url = new URL(window.location.href)
  return url.searchParams.get(name)
}

const id = getQueryParam("id")
if (!id) {
  document.getElementById('news-title').innerText = "错误：缺少新闻ID"
} else {
  fetch("getNewsById.asp?id=" + id)
    .then(res => res.json())
    .then(data => {
      document.getElementById("news-title").innerText = data.title
      document.getElementById("news-meta").innerText = `${data.category} ｜ ${data.created_at}`
      document.getElementById("news-content").innerHTML = data.content

      // 加载上一篇
      fetch("getPrevNextNews.asp?dir=prev&id=" + id)
        .then(res => res.json())
        .then(d => {
          if (!d.error)
            document.getElementById("prev-news").innerHTML = `上一篇：<a href="news_view.html?id=${d.id}">${d.title}</a>`
        })

      // 加载下一篇
      fetch("getPrevNextNews.asp?dir=next&id=" + id)
        .then(res => res.json())
        .then(d => {
          if (!d.error)
            document.getElementById("next-news").innerHTML = `下一篇：<a href="news_view.html?id=${d.id}">${d.title}</a>`
        })
    })
}
