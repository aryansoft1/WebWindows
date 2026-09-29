import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(fileURLToPath(new URL("..", import.meta.url)));
const read = (relative) => fs.readFile(path.join(root, relative), "utf8");

const [adminApi, publicApi, page, script, main, settings, shell] = await Promise.all([
  read("admin_api/wallpapers.asp"),
  read("api/wallpapers.asp"),
  read("SystemManager/wallpapers.html"),
  read("SystemManager/assets/js/wallpapers.js"),
  read("assets/js/main.js"),
  read("settings.html"),
  read("SystemManager/index.html")
]);

/* Both endpoints must sit behind the shared admin security gate. Uploads are
 * urlencoded because the gate rejects multipart, and every mutation has to be
 * audited, or an anonymous request could write into the wallpaper folder. */
assert.match(adminApi, /AdminSecurityRequireRead "system-manager", "wallpapers-list"/,
  "壁纸列表必须使用后台只读鉴权");
assert.match(adminApi, /If action = "list" And method = "GET" Then/,
  "管理员壁纸页必须有返回清单的只读接口操作");
assert.match(adminApi, /listJson = .*wallpapers/,
  "管理员清单接口必须返回壁纸数组");
assert.match(adminApi, /AdminSecurityRequireMutation "system-manager", "wallpapers-" & action/,
  "壁纸写操作必须使用后台变更鉴权");
assert.match(adminApi, /AdminSecurityAudit "wallpaper-upload", "success"/);
assert.match(adminApi, /AdminSecurityAudit "wallpaper-delete", "success"/);
assert.match(adminApi, /AdminSecurityAudit "wallpaper-default", "success"/);
assert.doesNotMatch(adminApi, /Session\("webwindows_admin"\)\s*=\s*True/,
  "壁纸接口不得自行放宽管理员会话校验");

/* The catalogue and the admin API must agree on the managed folder, otherwise
 * an upload would be invisible to the desktop wallpaper library. The folder is
 * spelled as a URL root: deriving it from a backslash path made every
 * path-prefix comparison off by one, so deletes and set-default were rejected
 * and a valid system default was silently dropped. */
for (const [name, source] of [["admin_api/wallpapers.asp", adminApi], ["api/wallpapers.asp", publicApi]]) {
  assert.match(source, /Const WALLPAPER_URL_ROOT = "assets\/wallpapers\/"/,
    `${name} 必须以 URL 形式声明壁纸目录`);
  assert.doesNotMatch(source, /WALLPAPER_ROOT/,
    `${name} 不得再使用带反斜杠的目录常量做前缀比较`);
  assert.match(source, /IsImageFile/, `${name} 必须限制可接受的图片扩展名`);
  for (const extension of [".jpg", ".png", ".webp", ".gif", ".avif", ".bmp"]) {
    assert.ok(source.includes(`"${extension}"`), `${name} 缺少允许的扩展名 ${extension}`);
  }
}

/* Upload validation and path safety. */
assert.match(adminApi, /MAX_UPLOAD_BYTES = 4194304/, "单张壁纸上限为 4MB");
assert.match(adminApi, /SafeName\(ByVal rawName\)/, "上传文件名必须经过清洗");
assert.doesNotMatch(adminApi, /Request\.Files|multipart/,
  "上传不能依赖 multipart，后台安全网关只接受 urlencoded");
assert.match(adminApi, /InStr\(relativeName, "\.\."\) > 0/,
  "删除操作必须拒绝路径穿越");
assert.match(adminApi, /Left\(LCase\(requestedUrl\), Len\(WALLPAPER_URL_ROOT\)\)/,
  "删除与设默认必须限定在壁纸目录内");
assert.match(adminApi, /default_wallpaper/, "系统默认壁纸必须写入后台设置表");
assert.match(publicApi, /default_wallpaper/, "公开目录接口必须返回系统默认壁纸");
assert.match(publicApi, /fso\.FileExists/, "公开目录接口必须剔除已不存在的默认壁纸");
assert.match(publicApi, /If index > 1 Then payload = payload & ","/,
  "公开目录 JSON 必须在图片对象之间加入逗号");
assert.match(publicApi, /relativePath = Mid\(relativePath, 2\)/,
  "公开目录路径必须去掉系统路径分隔符，避免生成双斜线 URL");
assert.match(publicApi, /Left\(defaultWallpaper, Len\(WALLPAPER_URL_ROOT\)\)/,
  "系统默认壁纸必须按 URL 根目录校验");

/* The console must guard uploads with the size the endpoint enforces, and it
 * must verify the stored byte count so a truncated write cannot pass silently. */
assert.match(script, /MAX_UPLOAD_BYTES = 4 \* 1024 \* 1024/);
assert.match(script, /result\.bytes !== file\.size/,
  "上传后必须比对服务器保存的字节数");
assert.match(script, /security\.authorize/);
assert.match(script, /X-WebWindows-Admin-Request": "system-manager"/);
assert.match(script, /"delete"/);
assert.match(script, /"default"/);
assert.match(page, /id="wallpaperGrid"/);
assert.match(page, /assets\/js\/wallpapers\.js/);
assert.match(page, /admin-security\.js/);
assert.match(page, /page-guard\.js/);

/* New users without a stored wallpaper take the administrator default once,
 * and reapplying the same wallpaper must not restart the image request. */
assert.match(main, /wallpaperDefaultResolved/,
  "桌面启动必须只在用户未选择过壁纸时读取系统默认壁纸");
assert.match(main, /api\/wallpapers\.asp/);
assert.match(main, /dataset\.wwWallpaper/,
  "同一张壁纸重复应用必须是无操作，否则窗口开关会不断取消壁纸请求");
assert.match(main, /backgroundColor = '#042a57'/,
  "壁纸未加载完成时必须有兜底底色，不能出现纯白桌面");
assert.match(page, /assets\/js\/wallpapers\.js\?v=/,
  "壁纸管理页必须带版本号，否则浏览器会继续用旧脚本");
assert.match(settings, /assets\/js\/wallpaper\.js\?v=/,
  "设置页必须给壁纸脚本加版本号，否则线上改动无法到达用户");

assert.match(shell, /href="wallpapers\.html" target="mainFrame"[^>]*>🖼️ 壁纸管理/, "后台左侧导航必须提供壁纸管理入口");

console.log("wallpaper admin smoke test passed");
