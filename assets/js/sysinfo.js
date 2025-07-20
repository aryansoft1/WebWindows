try {
        document.addEventListener("contextmenu", e => e.preventDefault());
} catch (e) {
            console.warn("[跨域 iframe 无法注入右键屏蔽]", e);
}
function showTab(tab) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(tabEl => tabEl.classList.remove('active'));
      document.querySelector(`[onclick="showTab('${tab}')"]`).classList.add('active');
      document.getElementById(`tab-${tab}`).classList.add('active');
    }

    function formatUnit(valueMB) {
      if (valueMB >= 1024) {
        return (valueMB / 1024).toFixed(2) + ' GB';
      } else {
        return valueMB.toFixed(2) + ' MB';
      }
    }
function refreshData() {
    fetch('/inc/sysinfo.asp')
      .then(res => res.json())
      .then(data => {
        document.getElementById('cpuModel').textContent = data.cpuModel || '--';
        document.getElementById('cpuUsage').textContent = data.cpuUsage !== null ? data.cpuUsage + '%' : '--';

        document.getElementById('memUsedText').textContent = formatUnit(data.memUsed || 0);
        document.getElementById('memTotalText').textContent = formatUnit(data.memTotal || 0);
        const memPercent = data.memUsed && data.memTotal ? (data.memUsed / data.memTotal) * 100 : 0;
        document.getElementById('memUsedBar').style.width = memPercent + '%';

        document.getElementById('sysUsed').textContent = formatUnit(data.sysUsed || 0);
        document.getElementById('userUsed').textContent = formatUnit(data.diskUsed || 0);
        document.getElementById('diskTotal').textContent = formatUnit(data.diskTotal || 0);
        const diskPercent = (data.sysUsed + data.diskUsed) / (data.diskTotal || 1) * 100;
        document.getElementById('diskBar').style.width = diskPercent + '%';
      });
}

refreshData();  // 首次调用
setInterval(refreshData, 1000);  // 每 30 秒刷新


// 本地配置绑定
document.getElementById('ua').textContent = navigator.userAgent;
document.getElementById('platform').textContent = "webwindows";
document.getElementById('language').textContent = navigator.language;
document.getElementById('cpuCores').textContent = navigator.hardwareConcurrency || '--';
document.getElementById('deviceMemory').textContent = navigator.deviceMemory ? navigator.deviceMemory + ' GB' : '--';
document.getElementById('screenSize').textContent = screen.width + ' x ' + screen.height;