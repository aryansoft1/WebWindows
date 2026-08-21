(function installNetworkSpeedTest() {
  "use strict";

  const MAX_BYTES = 2 * 1024 * 1024;
  const payloadUrl = "assets/wallpapers/wall4.jpg";
  let controller = null;

  function elements() {
    return {
      start: document.getElementById("networkSpeedStart"),
      cancel: document.getElementById("networkSpeedCancel"),
      progress: document.getElementById("networkSpeedProgress"),
      status: document.getElementById("networkSpeedStatus"),
      result: document.getElementById("networkSpeedResult")
    };
  }

  function setRunning(running) {
    const ui = elements();
    ui.start.disabled = running;
    ui.cancel.hidden = !running;
    ui.progress.hidden = !running;
    if (!running) ui.progress.value = 0;
  }

  function setStatus(message, error) {
    const ui = elements();
    ui.status.textContent = message;
    ui.status.classList.toggle("is-error", Boolean(error));
  }

  async function start() {
    if (controller) return;
    const ui = elements();
    ui.result.hidden = true;
    if (window.WebWindows?.device?.network.getState().online === false) {
      setStatus("当前离线，无法开始测速。", true);
      return;
    }
    controller = new AbortController();
    setRunning(true);
    setStatus("测试中：正在下载最多约 2 MB 测试数据……");
    const started = performance.now();
    let bytes = 0;
    try {
      const response = await fetch(`${payloadUrl}?speed-test=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const expected = Math.min(Number(response.headers.get("content-length")) || MAX_BYTES, MAX_BYTES);
      if (response.body?.getReader) {
        const reader = response.body.getReader();
        while (bytes < MAX_BYTES) {
          const { done, value } = await reader.read();
          if (done) break;
          bytes += value.byteLength;
          ui.progress.value = Math.min(100, Math.round((bytes / expected) * 100));
        }
        if (bytes >= MAX_BYTES) await reader.cancel();
      } else {
        const data = await response.arrayBuffer();
        bytes = Math.min(data.byteLength, MAX_BYTES);
      }
      const seconds = Math.max((performance.now() - started) / 1000, 0.001);
      const mbps = (bytes * 8) / seconds / 1_000_000;
      ui.result.textContent = `${mbps.toFixed(mbps >= 10 ? 1 : 2)} Mbps`;
      ui.result.hidden = false;
      setStatus(`完成：下载 ${(bytes / 1024 / 1024).toFixed(2)} MB，用时 ${seconds.toFixed(2)} 秒。结果仅代表当前设备到 WebWindows 站点的下载速度。`);
    } catch (error) {
      if (error.name === "AbortError") setStatus("测速已取消，已停止继续下载。", false);
      else setStatus(`测速失败：${error.message || "网络请求失败"}`, true);
    } finally {
      controller = null;
      setRunning(false);
    }
  }

  function cancel() {
    controller?.abort();
  }

  document.addEventListener("DOMContentLoaded", () => {
    elements().start?.addEventListener("click", start);
    elements().cancel?.addEventListener("click", cancel);
  }, { once: true });
})();
