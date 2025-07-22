// datacenter.js

function openDataCenterForm(name = '', url = '') {
  document.getElementById('centerName').value = name;
  document.getElementById('centerURL').value = url;
  document.getElementById('dataCenterModal').classList.remove('hidden');
}

function closeDataCenterForm() {
  document.getElementById('dataCenterModal').classList.add('hidden');
}

function editDataCenter(name) {
  const rows = document.querySelectorAll('#dataCenterTableBody tr');
  for (const row of rows) {
    if (row.children[0].textContent.trim() === name) {
      const url = row.children[1].textContent.trim();
      openDataCenterForm(name, url);
      break;
    }
  }
}

function deleteDataCenter(name) {
  if (confirm(`确定要删除数据中心：${name} 吗？`)) {
    alert(`已删除数据中心：${name}`);
    // 实际逻辑应发送请求并刷新表格
  }
}

function checkEndpoint() {
  const url = document.getElementById('centerURL').value;
  if (!url) {
    alert('请输入接口地址');
    return;
  }
  fetch(url, { method: 'HEAD' })
    .then(res => {
      if (res.ok) {
        alert('接口可访问 ✅');
      } else {
        alert('接口响应异常 ❌');
      }
    })
    .catch(err => {
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
