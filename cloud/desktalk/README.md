# DeskTalk AI deployment

DeskTalk uses the BigModel OpenAI-compatible chat-completions endpoint through
chatproxy.asp. The browser never receives the provider credential. The proxy
always sends requests to https://open.bigmodel.cn/api/paas/v4/chat/completions
with model glm-4.7-flash.

## Required server configuration

1. Copy cloud/desktalk/chatproxy.config.example.asp to
   cloud/desktalk/chatproxy.config.asp on the server.
2. Replace the placeholder in chatproxy.config.asp with the BigModel API key.
   Upload that private file separately; it is intentionally ignored by Git.
   Because it is an ASP script, direct requests execute it and return no source
   or response body.
3. Deploy chatproxy.asp and chatproxy.config.asp together in the same folder.
   Classic ASP resolves the configuration through a server-side include; no
   environment variables, WScript access, or filesystem component is needed.
4. Ensure the virtual host can make outbound HTTPS requests to
   open.bigmodel.cn:443 and that the server supports TLS 1.2 or newer.
5. Request POST /cloud/desktalk/chatproxy.asp from the deployed site. A blank
   config intentionally returns HTTP 503.

Do not place the real value in client JavaScript, this repository, build
artifacts, logs, or browser storage.

The committed .gitignore excludes common local secret files in this folder.
