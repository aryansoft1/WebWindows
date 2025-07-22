// news_categories.js - 新闻分类弹窗逻辑

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
  li.innerHTML = `
    <span>${name}</span>
    <button onclick="deleteCategory(this)" class="text-red-600 hover:underline">删除</button>
  `;
  document.getElementById("categoryList").appendChild(li);
  input.value = "";
}

function deleteCategory(btn) {
  if (confirm("确定删除该分类？")) {
    btn.parentElement.remove();
  }
}
