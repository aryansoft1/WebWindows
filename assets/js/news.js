fetch('getNews.asp')
  .then(res => res.json())
  .then(list => {
    const tbody = document.getElementById('news-list')
    tbody.innerHTML = ''

    if (list.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" class="text-gray-400">暂无新闻</td></tr>'
      return
    }

    const today = new Date().toISOString().split('T')[0]
    let grouped = { 今天: [], 更早: [] }

    list.forEach(item => {
      const date = item.created_at.split(' ')[0]
      if (date === today) grouped['今天'].push(item)
      else grouped['更早'].push(item)
    })

    for (let group in grouped) {
      if (grouped[group].length > 0) {
        const trGroup = document.createElement('tr')
        trGroup.className = 'group'
        trGroup.innerHTML = `<td colspan="5">${group}</td>`
        tbody.appendChild(trGroup)

        grouped[group].forEach(news => {
          const row = document.createElement('tr')
          row.innerHTML = `
            <td class="filename">
                <img src="assets/icons/html-icon.png" class="icon">
                <a href="news_view.html?id=${news.id}" >${news.title}</a>
            </td>
            <td>${news.category}</td>
            <td>${news.created_at.split(' ')[0]}</td>
            <td>系统新闻</td>
            <td>--</td>
            `

          tbody.appendChild(row)
        })
      }
    }
  })
  .catch(err => {
    document.getElementById('news-list').innerHTML = '<tr><td colspan="5" style="color: red;">加载失败</td></tr>'
    console.error('加载新闻失败:', err)
  })
