// datacenter.js
let currentEditId = null;
function openDataCenterForm(name = '', url = '') {
  document.getElementById('centerName').value = name;
  document.getElementById('centerURL').value = url;
  document.getElementById('dataCenterModal').classList.remove('hidden');
}

function closeDataCenterForm() {
  document.getElementById('dataCenterModal').classList.add('hidden');
}

function editDataCenter(id) {
  fetch("/admin_api/getDatacenters.asp")
    .then(res => res.json())
    .then(res => {
      const item = res.find(d => d.id == id);
      console.log(res)
      if (!item) return alert("未找到对应数据中心信息");

      // 设置表单内容
      document.getElementById("centerName").value = item.name;
      document.getElementById("centerURL").value = item.api_url;
      document.getElementById("centerStatus").value = item.status || "未知";

      currentEditId = id;

      // 打开弹窗并带入内容
      openDataCenterForm(item.name, item.api_url);
    });
}


function deleteDataCenter(id) {
  if (!confirm("确定要删除该数据中心？")) return;

  fetch(`/admin_api/deleteDatacenter.asp?id=${id}`)
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert("删除成功");
        // 删除成功后重新加载表格
        fetch("/admin_api/getDatacenters.asp")
          .then(res => res.json())
          .then(data => renderDataCenters(data));
      } else {
        alert("删除失败：" + res.error);
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


// 表单提交事件
const form = document.getElementById('dataCenterForm');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const name = document.getElementById('centerName').value.trim();
    const url = document.getElementById('centerURL').value.trim();
    if (!name || !url) {
      alert('名称和地址不能为空');
      return;
    }
    alert(`已保存数据中心：${name} → ${url}`);
    closeDataCenterForm();
    // 实际保存逻辑应为 fetch/post + 刷新列表
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

  data.forEach(dc => {
    const row = document.createElement("tr");
    row.setAttribute("data-api-url", dc.api_url);

    row.innerHTML = `
      <td class="p-2 border">${dc.name}</td>
      <td class="p-2 border">${dc.api_url}</td>
      <td class="p-2 border ${dc.status === '已启用' ? 'text-green-600' : dc.status === '维护中' ? 'text-yellow-600' : 'text-red-600'}">${dc.status}</td>
      <td class="p-2 border connectivity-cell text-gray-500">检测中...</td> <!-- 接通状态列 -->
      <td class="p-2 border">
        <button class="text-blue-600 hover:underline mr-2" onclick="editDataCenter(${dc.id})">编辑</button>
        <button class="text-red-600 hover:underline" onclick="deleteDataCenter(${dc.id})">删除</button>
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

  const formData = new URLSearchParams();
  formData.append("name", name);
  formData.append("api_url", url);
  formData.append("status", status);
  if (currentEditId) formData.append("id", currentEditId);

  fetch("/admin_api/saveDatacenter.asp", {
    method: "POST",
    body: formData,
  })
    .then(res => res.json())
    .then(res => {
      if (res.success) {
        alert("保存成功");
        closeDataCenterForm();
        location.reload();
      } else {
        alert("保存失败：" + res.error);
      }
    });
});
