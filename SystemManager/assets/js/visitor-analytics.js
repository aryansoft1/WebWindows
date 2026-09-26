(function () {
  "use strict";

  const TYPE_LABELS = { anonymous: "访客", registered: "注册用户", developer: "开发者" };

  function duration(total) {
    const seconds = Math.max(0, Number(total) || 0);
    if (seconds < 60) return `${seconds} 秒`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)} 分 ${seconds % 60} 秒`;
    return `${Math.floor(seconds / 3600)} 小时 ${Math.floor((seconds % 3600) / 60)} 分`;
  }

  function setText(id, value) {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  }

  function cell(row, value, className = "p-3 border-t") {
    const td = document.createElement("td");
    td.className = className;
    td.textContent = value;
    row.appendChild(td);
  }

  function renderHours(hours) {
    const root = document.getElementById("hourChart");
    root.replaceChildren();
    const values = new Map((hours || []).map((item) => [Number(item.hour), Number(item.sessions)]));
    const maximum = Math.max(1, ...values.values());
    for (let hour = 0; hour < 24; hour += 1) {
      const count = values.get(hour) || 0;
      const item = document.createElement("div");
      item.className = "h-44 flex flex-col justify-end items-center gap-1";
      const value = document.createElement("span");
      value.className = "text-xs text-gray-500";
      value.textContent = String(count);
      const bar = document.createElement("div");
      bar.className = "w-full bg-blue-500 rounded-t min-h-px";
      bar.style.height = `${Math.max(1, Math.round((count / maximum) * 120))}px`;
      bar.title = `${hour}:00–${String(hour + 1).padStart(2, "0")}:00：${count} 次`;
      const label = document.createElement("span");
      label.className = "text-xs";
      label.textContent = String(hour).padStart(2, "0");
      item.append(value, bar, label);
      root.appendChild(item);
    }
  }

  function renderTypes(types, total) {
    const root = document.getElementById("visitorTypes");
    root.replaceChildren();
    for (const item of types || []) {
      const line = document.createElement("div");
      const heading = document.createElement("div");
      heading.className = "flex justify-between text-sm mb-1";
      const label = document.createElement("span");
      label.textContent = TYPE_LABELS[item.type] || item.type;
      const count = document.createElement("span");
      count.textContent = `${item.sessions} 次`;
      heading.append(label, count);
      const track = document.createElement("div");
      track.className = "h-3 bg-gray-100 rounded overflow-hidden";
      const bar = document.createElement("div");
      bar.className = "h-full bg-indigo-500";
      bar.style.width = `${total ? Math.round((item.sessions / total) * 100) : 0}%`;
      track.appendChild(bar);
      line.append(heading, track);
      root.appendChild(line);
    }
  }

  function renderFeatures(features) {
    const body = document.getElementById("featureRows");
    body.replaceChildren();
    for (const item of features || []) {
      const row = document.createElement("tr");
      cell(row, item.name || item.key);
      cell(row, item.opens);
      cell(row, item.sessions);
      cell(row, duration(item.activeSeconds));
      body.appendChild(row);
    }
    if (!body.children.length) {
      const row = document.createElement("tr");
      const empty = document.createElement("td");
      empty.colSpan = 4;
      empty.className = "p-6 text-center text-gray-500";
      empty.textContent = "当前范围内还没有功能使用记录。";
      row.appendChild(empty);
      body.appendChild(row);
    }
  }

  function renderSessions(sessions, sessionFeatures) {
    const body = document.getElementById("sessionRows");
    body.replaceChildren();
    const featuresBySession = new Map();
    for (const feature of sessionFeatures || []) {
      const items = featuresBySession.get(Number(feature.sessionId)) || [];
      items.push(`${feature.name || feature.key} ${duration(feature.activeSeconds)}`);
      featuresBySession.set(Number(feature.sessionId), items);
    }
    for (const item of sessions || []) {
      const row = document.createElement("tr");
      cell(row, item.startedAt);
      cell(row, TYPE_LABELS[item.type] || item.type);
      cell(row, item.username || "—");
      cell(row, item.ip || "未知", "p-3 border-t font-mono");
      cell(row, item.address || "未知");
      cell(row, item.device || "—");
      cell(row, duration(item.activeSeconds));
      cell(row, (featuresBySession.get(Number(item.id)) || []).join("；") || "—", "p-3 border-t text-xs");
      cell(row, item.entryPath || "/", "p-3 border-t font-mono text-xs");
      body.appendChild(row);
    }
  }

  const GEO_SOURCE_LABELS = {
    "iis-geoip": "本机 IIS GeoIP 模块",
    "external-api": "外部解析 API",
    none: "未启用"
  };

  async function load() {
    const status = document.getElementById("analyticsStatus");
    status.textContent = "正在读取统计数据……";
    status.className = "rounded border bg-white px-4 py-3 text-sm";
    try {
      const days = document.getElementById("analyticsDays").value;
      const response = await fetch(`/admin_api/visitorAnalytics.asp?days=${encodeURIComponent(days)}&limit=100`, {
        credentials: "same-origin",
        cache: "no-store",
        headers: { "X-WebWindows-Admin-Request": "visitor-analytics" }
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) throw new Error(payload.message || payload.code || `HTTP ${response.status}`);
      const summary = payload.summary || {};
      setText("kpiSessions", summary.sessions || 0);
      setText("kpiVisitors", summary.visitors || 0);
      setText("kpiRegistered", summary.registeredSessions || 0);
      setText("kpiDevelopers", summary.developerSessions || 0);
      setText("kpiAverage", duration(summary.averageActiveSeconds));
      setText("kpiTotal", duration(summary.totalActiveSeconds));
      renderHours(payload.hours);
      renderTypes(payload.visitorTypes, summary.sessions || 0);
      renderFeatures(payload.features);
      renderSessions(payload.sessions, payload.sessionFeatures);
      if (window.WebWindowsVisitorCharts) window.WebWindowsVisitorCharts.render(payload);
      const geo = payload.geo || {};
      const geoSource = GEO_SOURCE_LABELS[geo.source] || GEO_SOURCE_LABELS.none;
      status.textContent = `统计已更新 · 最近 ${payload.days} 天 · 地区来源：${geoSource}`
        + `（已解析 ${geo.resolvedSessions || 0}/${geo.totalSessions || 0} 个会话）`
        + " · 活跃停留仅计算页面可见且用户未空闲的时间";
      status.className = "rounded border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800";
    } catch (error) {
      status.textContent = `统计读取失败：${error.message || error}`;
      status.className = "rounded border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800";
    }
  }

  addEventListener("DOMContentLoaded", () => {
    document.getElementById("analyticsDays").addEventListener("change", load);
    load();
  });
})();
