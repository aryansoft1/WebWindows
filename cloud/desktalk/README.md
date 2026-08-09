# DeskTalk AI deployment

DeskTalk uses the BigModel OpenAI-compatible chat-completions endpoint through
chatproxy.asp. The browser never receives the provider credential. The proxy
always sends requests to https://open.bigmodel.cn/api/paas/v4/chat/completions
with model glm-4.7-flash.

## Required server configuration

1. Prefer adding BIGMODEL_API_KEY to the environment of the IIS application
   pool that serves this site, then recycle that application pool.
2. On shared hosting where application-pool variables are unavailable, copy
   /App_Data/bigmodel.env.example to /App_Data/bigmodel.env on the server and
   replace the placeholder there. Upload the real file separately; it is
   intentionally ignored by Git.
3. Confirm that requesting /App_Data/bigmodel.env returns 404 or 403. IIS
   normally protects App_Data; do not use the file fallback if the host exposes
   that directory as static content.
4. Ensure the application pool identity can make outbound HTTPS requests to
   open.bigmodel.cn:443 and that the server supports TLS 1.2 or newer.
5. Request POST /cloud/desktalk/chatproxy.asp from the deployed site. Without
   either server-side configuration source the endpoint intentionally returns
   HTTP 503.

In IIS Manager, configure the variable at the application-pool level (or use
the protected App_Data fallback), not in client JavaScript or a tracked
configuration file. Do not place the real value in this repository, build
artifacts, logs, or browser storage.

The committed .gitignore excludes common local secret files in this folder.
