# Unified File Search Query Understanding v2

All natural-language file searches use `WebWindows.fileQuery` before reaching a provider.

```text
Cloud Files / DeskTalk
        -> WebWindows.fileQuery.parseAsync()
        -> Structured Search Query
        -> WebWindows.files.search()
        -> cloud + private session + current device providers
        -> unified client-side validation, ranking and deduplication
```

## Query AST

The v2 AST contains `intent`, `text`, `extensions`, `mimeTypes`, `fileCategory`,
`dateCreated`, `dateModified`, `dateUploaded`, `size`, `path`, `source`, `sort`,
`order`, and `limit`. Provider compatibility fields such as `modifiedFrom` are
derived from the AST in one place; providers do not parse natural language.

## Deterministic parser

The local parser handles explicit extensions, Markdown, Excel/spreadsheets,
Word, broad documents, PDF, PowerPoint, images, videos, archives, Chinese,
Japanese and English date expressions, name-contains expressions, source
selection and recently-modified sorting. Consumed filter words are removed from
the residual filename text.

`Word` maps only to `doc` and `docx`. The broader `文档` category maps to
`doc`, `docx`, `odt`, `rtf`, `pdf`, `md`, and `txt`.

## AI parser

GLM is not used for deterministic searches or while a user is typing. On an
explicit submit, a query with unresolved complex markers such as size, path,
before/after, exclusion, or comparison may be sent to the existing server-side
DeskTalk proxy. Only the query text is sent. The model can only call the strict
`parseFileSearchQuery` schema and never receives file lists or contents.

Unknown fields, invalid dates, invalid sources, and invalid enums are rejected.
Any HTTP, model, JSON, or validation failure falls back to the deterministic
keyword result and adds `ai-query-parser-fallback` to warnings.

`openedAt` is not currently available in file metadata. A recently-opened query
therefore returns an explicit `opened-at-metadata-unavailable` warning instead
of pretending that modification time is open history.
