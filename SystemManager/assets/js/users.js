// assets/js/users.js
let dcLoadPromise;

// 页面加载时加载用户列表和数据中心列表
document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();
  fetchDataCenters();
});

// 加载所有用户数据
function fetchUsers() {
  fetch("/admin_api/getUsers.asp")
    .then(res => res.json())
    .then(data => renderUsers(data))
    .catch(err => console.error("用户加载失败", err));
}

// 渲染用户表格
function renderUsers(data) {
  const tbody = document.getElementById("userTableBody");
  tbody.innerHTML = "";

  data.forEach(user => {
    const row = document.createElement("tr");
    row.className = "border-t";
    row.innerHTML = `
      <td class="p-2 border">${user.username}</td>
      <td class="p-2 border">${user.nickname}</td>
      <td class="p-2 border">${user.email || ''}</td>
      <td class="p-2 border">${user.data_center_name || ''}</td>
      <td class="p-2 border">
        <button class="text-blue-600 hover:underline mr-2" onclick="editUser(${user.id})">编辑</button>
        <button class="text-red-600 hover:underline" onclick="deleteUser(${user.id})">删除</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// 加载数据中心列表，用于下拉菜单
function fetchDataCenters() {
  if (dcLoadPromise) return dcLoadPromise;
  fetch("/admin_api/getDatacenters.asp")
    .then(res => res.json())
    .then(data => {
      const select = document.querySelector("select[name='data_center_id']");
      select.innerHTML = "";
      data.forEach(dc => {
        const opt = document.createElement("option");
        opt.value = dc.id;
        opt.textContent = dc.name;
        select.appendChild(opt);
      });
    });
}

// 编辑用户（填充表单）
async function editUser(id) {
  const form = document.getElementById("user-add-form");
  const modal = document.getElementById("userFormModal");
  modal.dataset.mode = "edit";
  document.getElementById("userFormTitle").textContent = "编辑用户";

  // 先取用户
  const user = await fetch("/admin_api/getUserById.asp?id=" + id).then(res => res.json());

  // 等数据中心列表加载完
  await fetchDataCenters();

  // 再统一赋值（包含隐藏 id）
  form.id.value = user.id || "";
  form.nickname.value = user.nickname || "";
  form.username.value = user.username || "";
  form.username.readOnly = true;
  form.password.value = "";               // 不回显
  form.email.value = user.email || "";

  const sel = form.data_center_id;
  const wanted = String(user.data_center_id || "");
  sel.value = wanted;
  if (sel.value !== wanted && wanted) {   // 该 DC 被删时兜底
    const opt = document.createElement("option");
    opt.value = wanted;
    opt.textContent = `（已删除）ID:${wanted}`;
    sel.appendChild(opt);
    sel.value = wanted;
  }

  modal.classList.remove("hidden");
}



// 删除用户
function deleteUser(id) {
  if (!confirm("确定要删除该用户？")) return;

  fetch("/admin_api/deleteUser.asp?id=" + id)
    .then(res => res.json())
    .then(resp => {
      if (resp.success) {
        fetchUsers();
      } else {
        alert("删除失败：" + resp.error);
      }
    });
}

// 提交表单（新增或更新）
function submitUserForm(e) {
  e.preventDefault();
  const form = document.getElementById("user-add-form");

  // 不传文件，单独做上传接口
  const params = new URLSearchParams();
  ["id","nickname","username","password","email","data_center_id","expired_at"].forEach(name => {
    params.append(name, form.elements[name]?.value || "");
  });

  fetch("/admin_api/saveUser.asp", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: params.toString()
  })
  .then(r => r.json())
  .then(resp => {
    if (resp.success) {
      closeUserForm();
      fetchUsers();
    } else {
      alert("保存失败：" + resp.error);
    }
  });
}

// 打开用户表单弹窗（用于添加新用户）
function openUserForm() {
  const modal = document.getElementById("userFormModal");
  modal.dataset.mode = "add";
  document.getElementById("userFormTitle").textContent = "添加用户";

  const form = document.getElementById("user-add-form");
  form.reset();
  form.id.value = "";  
  form.username.readOnly = false;
  document.getElementById("avatar-preview").classList.add("hidden");

  modal.classList.remove("hidden");
}

function closeUserForm() {
  document.getElementById("userFormModal").classList.add("hidden");
  document.getElementById("user-add-form").reset();
  document.getElementById("user-add-form").username.readOnly = false;
}

