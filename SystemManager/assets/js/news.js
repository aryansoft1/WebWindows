let quill;

function openNewsModal(isEdit = false, data = {}) {
  document.getElementById("newsModal").classList.remove("hidden");
  document.getElementById("newsModalTitle").innerText = isEdit ? "编辑新闻" : "添加新闻";

  const form = document.forms['newsForm'];
  form.title.value = data.title || '';
  form.category.value = data.category || '公告';
  if (quill) {
    quill.root.innerHTML = data.content || '';
  }

  form.dataset.editing = isEdit ? "true" : "false";
  form.dataset.editId = data.id || "";
}

function closeNewsModal() {
  document.getElementById("newsModal").classList.add("hidden");
}

function submitNewsForm(e) {
  e.preventDefault();
  const form = e.target;
  const title = form.title.value.trim();
  const category = form.category.value;
  const content = quill.root.innerHTML.trim();

  const isEdit = form.dataset.editing === "true";
  const id = form.dataset.editId;

  // 模拟保存逻辑
  if (isEdit) {
    alert(`保存修改：${title} (${category})`);
  } else {
    alert(`发布新闻：${title} (${category})`);
  }

  closeNewsModal();
}

function editNews(id) {
  // 模拟获取数据（根据 id）
  const data = {
    id: id,
    title: "示例新闻标题",
    category: "系统更新",
    content: "<p>这是新闻内容示例</p>"
  };
  openNewsModal(true, data);
}

function deleteNews(id) {
  if (confirm("确定删除此新闻吗？")) {
    alert("已删除新闻 ID: " + id);
  }
}
function openCategoryModal() {
  document.getElementById("categoryModal").classList.remove("hidden");
}

function closeCategoryModal() {
  document.getElementById("categoryModal").classList.add("hidden");
}

function addCategory() {
  const input = document.getElementById("newCategory");
  const name = input.value.trim();
  if (!name) return;

  const li = document.createElement("li");
  li.className = "flex justify-between items-center py-2";
  li.innerHTML = `<span>${name}</span><button onclick="deleteCategory(this)" class="text-red-600 hover:underline">删除</button>`;
  document.getElementById("categoryList").appendChild(li);
  input.value = "";
}

function deleteCategory(btn) {
  if (confirm("确定删除该分类？")) {
    btn.parentElement.remove();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  quill = new Quill('#editor', {
    theme: 'snow'
  });
});
