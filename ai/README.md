# WebWindows DeskTalk AI

## Request flow

1. DeskTalk sends recent conversation messages plus a small, allow-listed runtime context.
2. chatproxy.asp extracts only the latest user question.
3. index.inc.asp scores topic keywords and selects at most three Markdown knowledge files.
4. The server injects the formal system prompt and selected knowledge as a system message.
5. The proxy forces glm-4.7-flash and forwards the request without exposing its credential.

The response header X-WebWindows-Knowledge lists selected topic IDs for testing.
General questions select no product topic and continue to the base model.

## Maintenance

Product facts live in ai/knowledge/*.md. Update the matching topic when the UI
changes; do not paste development history or source code into the knowledge.
Keyword routing lives only in index.inc.asp and is independent from the content.

## Runtime context

runtime-context.schema.json defines the safe version-1 contract. The current
client sends only language, environment, two capability booleans, online state,
and an optional version. It does not send account identity, filenames, file
contents, battery percentage, installed-function lists, or other user data.

## Tool registry

assets/js/ai-tool-registry.js defines registration, recursive schema
validation, permission resolution, model-visible metadata and invocation
boundaries. ai/tools/registry.json is the declarative inventory.

File Search Tool v1 registers two controlled tools in
assets/js/ai-file-tools.js:

- searchFiles is model-visible and delegates every real lookup to the existing
  WebWindows.files.search() Unified File Search API.
- openFile is not model-visible. It accepts only an opaque, short-lived result
  token and requires a DeskTalk confirmation or an explicit open request with
  one high-confidence result.

Search results stay in the browser and are rendered under the heading
"搜索结果". They are not sent back to the model. Device URIs and local paths
remain only in the short-lived browser cache. No delete, move, rename, upload,
sync, recommendation, content extraction, or autonomous operation exists.
