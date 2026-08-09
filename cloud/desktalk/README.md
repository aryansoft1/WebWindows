# DeskTalk AI deployment

DeskTalk uses the BigModel OpenAI-compatible chat-completions endpoint through
chatproxy.asp. The browser never receives the provider credential. The proxy
always sends requests to https://open.bigmodel.cn/api/paas/v4/chat/completions
with model glm-4.7-flash.

## Required server configuration

1. Add BIGMODEL_API_KEY to the environment of the IIS application pool that
   serves this site. Use bigmodel.env.example only as a name/value example;
   Classic ASP does not load .env files automatically.
2. Recycle that application pool so its worker process inherits the variable.
3. Ensure the application pool identity can make outbound HTTPS requests to
   open.bigmodel.cn:443 and that the server supports TLS 1.2 or newer.
4. Request POST /cloud/desktalk/chatproxy.asp from the deployed site. Without
   the environment variable the endpoint intentionally returns HTTP 503.

In IIS Manager, configure the variable at the application-pool level (or in the
service account's process environment), not in client JavaScript or a tracked
configuration file. Do not place the real value in this repository, build
artifacts, logs, or browser storage.

The committed .gitignore excludes common local secret files in this folder.
