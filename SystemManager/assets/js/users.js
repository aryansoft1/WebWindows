// assets/js/users.js
let dcLoadPromise;

// 页面加载时加载用户列表和数据中心列表
document.addEventListener("DOMContentLoaded", () => {
  fetchUsers();
  fetchDataCenters().catch(() => {
    document.getElementById("userStatus").textContent = "数据中心加载失败，请刷新重试。";
  });
});

// 加载所有用户数据
function fetchUsers() {
  document.getElementById("userStatus").textContent = "正在加载用户…";
  window.WebWindowsAdminSecurity.read("/admin_api/getUsers.asp")
    .then(res => res.json())
    .then(data => { renderUsers(data); document.getElementById("userStatus").textContent = data.length ? `共 ${data.length} 位用户` : "暂无用户"; })
    .catch(() => { document.getElementById("userStatus").textContent = "用户加载失败，请刷新重试。"; });
}

// 渲染用户表格
function renderUsers(data) {
  const tbody = document.getElementById("userTableBody");
  tbody.replaceChildren();

  data.forEach(user => {
    const row = document.createElement("tr");
    row.className = "border-t";
    for (const value of [user.username, user.nickname, user.email, user.data_center_name]) {
      const cell = document.createElement("td");
      cell.className = "p-2 border";
      cell.textContent = value || "";
      row.appendChild(cell);
    }
    const actions = document.createElement("td");
    actions.className = "p-2 border";
    if (String(user.username).toLowerCase() === "admin") {
      actions.textContent = "请在系统设置中管理";
      row.appendChild(actions);
      tbody.appendChild(row);
      return;
    }
    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "text-blue-600 hover:underline mr-2";
    edit.textContent = "编辑";
    edit.addEventListener("click", () => editUser(Number(user.id)));
    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "text-red-600 hover:underline";
    remove.textContent = "删除";
    remove.addEventListener("click", () => deleteUser(Number(user.id)));
    actions.append(edit, remove);
    row.appendChild(actions);
    tbody.appendChild(row);
  });
}

// 加载数据中心列表，用于下拉菜单
function fetchDataCenters() {
  if (dcLoadPromise) return dcLoadPromise;
  dcLoadPromise = window.WebWindowsAdminSecurity.read("/admin_api/getDatacenters.asp")
    .then(res => res.json())
    .then(data => {
      const select = document.querySelector("select[name='data_center_id']");
      select.innerHTML = "";
      data.filter(dc => dc.enabled).forEach(dc => {
        const opt = document.createElement("option");
        opt.value = dc.id;
        opt.textContent = dc.name;
        select.appendChild(opt);
      });
    }).catch(error => { dcLoadPromise = null; throw error; });
  return dcLoadPromise;
}

// 编辑用户（填充表单）
async function editUser(id) {
  try {
  const form = document.getElementById("user-add-form");
  const modal = document.getElementById("userFormModal");
  modal.dataset.mode = "edit";
  document.getElementById("userFormTitle").textContent = "编辑用户";

  // 先取用户
  const user = await window.WebWindowsAdminSecurity.read("/admin_api/getUserById.asp?id=" + id).then(res => res.json());

  // 等数据中心列表加载完
  await fetchDataCenters();

  // 再统一赋值（包含隐藏 id）
  form.elements.namedItem("id").value = user.id || "";
  form.elements.namedItem("nickname").value = user.nickname || "";
  form.elements.namedItem("username").value = user.username || "";
  form.elements.namedItem("username").readOnly = true;
  form.elements.namedItem("password").value = "";
  form.elements.namedItem("email").value = user.email || "";
  form.elements.namedItem("avatar").value = user.avatar || "";

  const sel = form.elements.namedItem("data_center_id");
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
  } catch (error) {
    document.getElementById("userStatus").textContent = `用户详情加载失败：${error.message}`;
  }
}



// 删除用户
async function deleteUser(id) {
  if (!confirm("确定要删除该用户？")) return;
  const body = new URLSearchParams({ id: String(id) });
  const options = await window.WebWindowsAdminSecurity.authorize({
    body,
    headers: { "X-WebWindows-Admin-Request": "system-manager" }
  });
  fetch("/admin_api/deleteUser.asp", options)
    .then(res => res.json())
    .then(resp => {
      if (resp.success) {
        fetchUsers();
      } else {
        alert("删除失败：" + resp.error);
      }
    }).catch(error => {
      document.getElementById("userStatus").textContent = `删除失败：${error.message}`;
    });
}

// 提交表单（新增或更新）
async function submitUserForm(e) {
  e.preventDefault();
  const form = document.getElementById("user-add-form");

  // 不传文件，单独做上传接口
  const params = new URLSearchParams();
  ["id","nickname","username","password","email","avatar","data_center_id"].forEach(name => {
    params.append(name, form.elements[name]?.value || "");
  });

  const options = await window.WebWindowsAdminSecurity.authorize({
    headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
    body: params.toString()
  });
  options.headers["X-WebWindows-Admin-Request"] = "system-manager";
  fetch("/admin_api/saveUser.asp", options)
  .then(r => r.json())
  .then(resp => {
    if (resp.success) {
      closeUserForm();
      fetchUsers();
    } else {
      alert("保存失败：" + resp.error);
    }
  }).catch(error => {
    document.getElementById("userStatus").textContent = `保存失败：${error.message}`;
  });
}

// 打开用户表单弹窗（用于添加新用户）
async function openUserForm() {
  try {
    await fetchDataCenters();
  } catch (error) {
    document.getElementById("userStatus").textContent = `数据中心加载失败：${error.message}`;
    return;
  }
  const modal = document.getElementById("userFormModal");
  modal.dataset.mode = "add";
  document.getElementById("userFormTitle").textContent = "添加用户";

  const form = document.getElementById("user-add-form");
  form.reset();
  form.elements.namedItem("id").value = "";
  form.elements.namedItem("username").readOnly = false;

  modal.classList.remove("hidden");
}

function closeUserForm() {
  document.getElementById("userFormModal").classList.add("hidden");
  document.getElementById("user-add-form").reset();
  document.getElementById("user-add-form").elements.namedItem("username").readOnly = false;
}
