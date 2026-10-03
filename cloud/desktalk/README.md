# DeskTalk AI deployment

DeskTalk uses the Groq OpenAI-compatible chat-completions endpoint through
chatproxy.asp. The browser never receives the provider credential. The proxy
always sends requests to https://api.groq.com/openai/v1/chat/completions
with model openai/gpt-oss-120b (Groq free Developer plan).

## Required server configuration

1. Register at https://console.groq.com/ and create an API key (free
   Developer plan, no credit card).
2. Create the GROQ_API_KEY environment variable in the IIS application-pool
   process environment (see groq.env.example), then recycle the application
   pool so the new worker process picks it up. Remove the obsolete
   BIGMODEL_API_KEY variable while you are there.
3. Keep cloud/desktalk/chatproxy.config.asp in the same folder as
   chatproxy.asp (copy chatproxy.config.example.asp when first creating it).
   Classic ASP resolves it through a server-side include, so the file must
   exist even though the key itself comes from the environment variable.
4. Ensure the virtual host can make outbound HTTPS requests to
   api.groq.com:443 and that the server supports TLS 1.2 or newer.
5. Request POST /cloud/desktalk/chatproxy.asp from the deployed site. A
   missing GROQ_API_KEY intentionally returns HTTP 503.

## Free-tier limits (Groq Developer plan)

- 30 requests/minute, 1,000 requests/day.
- 8K tokens/minute, 200K tokens/day; cached prompt tokens do not count.
- A single request charges prompt plus max_completion_tokens against the
  minute budget, so DeskTalk caps output at 1,200 tokens with
  reasoning_effort low to stay inside 8K.
- Exceeding the minute budget returns HTTP 429 (the client waits and
  retries). A request that cannot fit returns HTTP 413 (the client then
  resets the conversation context and asks the user to resend).

Do not place the real value in client JavaScript, this repository, build
artifacts, logs, or browser storage.

The committed .gitignore excludes common local secret files in this folder.
