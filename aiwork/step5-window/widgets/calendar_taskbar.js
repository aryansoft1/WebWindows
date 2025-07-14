
// 时间模块 + 月历弹窗
document.addEventListener("DOMContentLoaded", () => {
  const taskTime = document.createElement("div");
  taskTime.id = "taskbar-time";
  taskTime.style.cssText = "position: fixed; right: 16px; bottom: 6px; color: white; font-size: 12px; cursor: pointer; z-index: 9999;";
  document.body.appendChild(taskTime);

  const calendarPopup = document.createElement("div");
  calendarPopup.id = "calendar-popup";
  calendarPopup.style.cssText = "position: fixed; right: 10px; bottom: 40px; background: rgba(30,30,30,0.95); color: white; padding: 10px; border-radius: 12px; display: none; z-index: 9999;";
  document.body.appendChild(calendarPopup);

  const updateTime = () => {
    const now = new Date();
    taskTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  updateTime();
  setInterval(updateTime, 60000);

  taskTime.addEventListener("click", () => {
    calendarPopup.innerHTML = "";
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const lastDate = new Date(year, month + 1, 0).getDate();

    const table = document.createElement("table");
    table.style.borderSpacing = "6px";
    const header = document.createElement("tr");
    '日月火水木金土'.split('').forEach(d => {
      const th = document.createElement("th");
      th.textContent = d;
      header.appendChild(th);
    });
    table.appendChild(header);

    let row = document.createElement("tr");
    for (let i = 0; i < firstDay; i++) {
      row.appendChild(document.createElement("td"));
    }

    for (let d = 1; d <= lastDate; d++) {
      const td = document.createElement("td");
      td.textContent = d;
      td.style.textAlign = "center";
      row.appendChild(td);
      if ((firstDay + d) % 7 === 0) {
        table.appendChild(row);
        row = document.createElement("tr");
      }
    }
    table.appendChild(row);
    calendarPopup.appendChild(table);
    calendarPopup.style.display = calendarPopup.style.display === "none" ? "block" : "none";
  });
});
