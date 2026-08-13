// datacenter.js
let currentEditId = null;
const escapeHtml = (value) => String(value ?? '').replace(/[&<>"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;',
}[character]));
function openDataCenterForm(data = null) {
  currentEditId = data?.id || null;
  document.getElementById('centerName').value = data?.name || '';
  document.getElementById('centerURL').value = data?.api_url || '';
  document.getElementById('centerStatus').value = data?.status || '未知';
  document.getElementById('centerQuotaGB').value = Math.max(1, Number(data?.user_quota_mb || 1024) / 1024);
  document.getElementById('dataCenterModal').classList.remove('hidden');
}

function closeDataCenterForm() {
  document.getElementById('dataCenterModal').classList.add('hidden');
  currentEditId = null;
}

function editDataCenter(id) {
  fetch("/admin_api/getDatacenters.asp")
    .then(res => res.json())
    .then(res => {
      const item = res.find(d => d.id == id);
      if (!item) return alert("未找到对应数据中心信息");

      openDataCenterForm(item);
    });
}


function deleteDataCenter(id) {
  if (!confirm("确定要删除该数据中心？")) return;

  const body = new URLSearchParams({ id: String(id) });
  fetch('/admin_api/deleteDatacenter.asp', {
    method: 'POST',
    headers: { 'X-WebWindows-Admin-Request': 'datacenter-quota' },
    body,
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert("删除成功");
        // 删除成功后重新加载表格
        fetch("/admin_api/getDatacenters.asp")
          .then(res => res.json())
          .then(data => renderDataCenters(data));
      } else {
        alert("删除失败：" + (res.error?.message || res.error || "未知错误"));
      }
    })
    .catch(err => {
      alert("删除请求失败");
    });
}

function checkConnectivity(baseUrl, callback) {
  const testUrl = baseUrl.replace(/\/+\$/, '') + '/getFolders.asp';
  fetch(testUrl)
    .then(res => res.text())
    .then(text => {
      try {
        JSON.parse(text);
        callback(true);
      } catch (e) {
        callback(false);
      }
    })
    .catch(() => callback(false));
}

function refreshAllConnectivity() {
  const rows = document.querySelectorAll("#dataCenterTableBody tr");
  rows.forEach(row => {
    const apiUrl = row.getAttribute("data-api-url");
    const connectivityCell = row.querySelector(".connectivity-cell");

    if (!apiUrl || !connectivityCell) return;

    const testUrl = apiUrl.replace(/\/+$/, '') + '/getFolders.asp';

    fetch(testUrl)
      .then(res => res.text())
      .then(text => {
        try {
          JSON.parse(text); // 尝试解析为 JSON
          connectivityCell.textContent = '可访问 ✅';
          connectivityCell.className = 'p-2 border connectivity-cell text-green-600';
        } catch {
          connectivityCell.textContent = '响应异常 ⚠️';
          connectivityCell.className = 'p-2 border connectivity-cell text-yellow-600';
        }
      })
      .catch(() => {
        connectivityCell.textContent = '无法访问 ❌';
        connectivityCell.className = 'p-2 border connectivity-cell text-red-600';
      });
  });
}

function checkEndpoint() {
  const baseUrl = document.getElementById('centerURL').value.trim();
  if (!baseUrl) {
    alert('请输入接口地址');
    return;
  }

  const testUrl = baseUrl.replace(/\/+$/, '') + '/getFolders.asp';

  fetch(testUrl)
    .then(res => res.text())
    .then(text => {
      try {
        JSON.parse(text); // 尝试解析为 JSON
        alert('接口可访问 ✅');
      } catch (e) {
        alert('接口响应格式异常 ❌');
      }
    })
    .catch(err => {
      console.log(err);
      alert('接口无法访问 ❌');
    });
}


document.addEventListener("DOMContentLoaded", () => {
  fetch("/admin_api/getDatacenters.asp")
    .then(res => res.json())
    .then(data => renderDataCenters(data));
});

function renderDataCenters(data) {
  const tbody = document.getElementById("dataCenterTableBody");
  tbody.innerHTML = "";

  if (!Array.isArray(data)) {
    tbody.innerHTML = '<tr><td colspan="6" class="p-3 border text-red-600">数据中心列表读取失败</td></tr>';
    return;
  }

  data.forEach(dc => {
    const id = Number(dc.id);
    if (!Number.isInteger(id) || id < 1) return;
    const row = document.createElement("tr");
    row.setAttribute("data-api-url", dc.api_url);

    row.innerHTML = `
      <td class="p-2 border">${escapeHtml(dc.name)}</td>
      <td class="p-2 border">${escapeHtml(dc.api_url)}</td>
      <td class="p-2 border">${formatQuota(dc.user_quota_mb)}</td>
      <td class="p-2 border ${dc.status === '已启用' ? 'text-green-600' : dc.status === '维护中' ? 'text-yellow-600' : 'text-red-600'}">${escapeHtml(dc.status)}</td>
      <td class="p-2 border connectivity-cell text-gray-500">检测中...</td> <!-- 接通状态列 -->
      <td class="p-2 border">
        <button class="text-blue-600 hover:underline mr-2" onclick="editDataCenter(${id})">编辑</button>
        <button class="text-red-600 hover:underline" onclick="deleteDataCenter(${id})">删除</button>
      </td>
    `;
    tbody.appendChild(row);
  });

  // 渲染后立即执行接通检测
  refreshAllConnectivity();
}

document.getElementById("dataCenterForm").addEventListener("submit", function (e) {
  e.preventDefault();

  const name = document.getElementById("centerName").value;
  const url = document.getElementById("centerURL").value;
  const status = document.getElementById("centerStatus").value;
  const quotaGB = Number(document.getElementById("centerQuotaGB").value);

  if (!Number.isInteger(quotaGB) || quotaGB < 1 || quotaGB > 1024) {
    alert("每用户分配空间必须是 1 至 1024 GB 的整数");
    return;
  }

  const formData = new URLSearchParams();
  formData.append("name", name);
  formData.append("api_url", url);
  formData.append("status", status);
  formData.append("user_quota_mb", String(quotaGB * 1024));
  if (currentEditId) formData.append("id", currentEditId);

  fetch("/admin_api/saveDatacenter.asp", {
    method: "POST",
    headers: { "X-WebWindows-Admin-Request": "datacenter-quota" },
    body: formData,
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert("保存成功");
        closeDataCenterForm();
        location.reload();
      } else {
        alert("保存失败：" + (res.error?.message || res.error || "未知错误"));
      }
    })
    .catch(() => alert("保存请求失败"));
});

function formatQuota(value) {
  const quotaMB = Number(value);
  if (!Number.isFinite(quotaMB) || quotaMB < 1024) return '未知';
  return `${(quotaMB / 1024).toLocaleString()} GB`;
}
