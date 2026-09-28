import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const html = read('index.html');
const client = read('assets/js/desktalk.js');
const handler = read('mail-center-net47/ApiHandler.cs');
const store = read('mail-center-net47/AccountStore.cs');
const config = read('web.config');

for (const id of ['mailbox-inbox-list', 'mailbox-sent-list', 'mailbox-trash-list', 'mailbox-compose-form', 'mailbox-address-form']) {
  assert.match(html, new RegExp(`id=["']${id}["']`), `missing mailbox UI contract: ${id}`);
}

for (const action of ['account-save', 'account-delete', 'accounts', 'test-mailbox', 'send', 'folder', 'message', 'mark-read', 'move']) {
  assert.match(handler, new RegExp(`action==["']${action}["']`), `missing mail-center action: ${action}`);
  assert.match(client, new RegExp(`mailCenter\\(["']${action}["']`), `mailbox client does not call: ${action}`);
}

assert.match(client, /loadRemoteAccounts\(true\)/, 'saved accounts must bypass the initial empty-account cache');
assert.match(client, /!selectedAddress\.remote/, 'local legacy addresses must be removable without a remote API call');
assert.match(handler, /X-WebWindows-Mail-Center/, 'mail-center mutation header guard is missing');
assert.match(store, /encrypted_password/, 'mail credentials must be stored encrypted');
assert.doesNotMatch(client, /localStorage\.setItem\([^\n]*(appPassword|password)/, 'mail authorization codes must not be written to localStorage');

const keyMatch = config.match(/key="MailCenterEncryptionKeyBase64"\s+value="([^"]*)"/);
assert.ok(keyMatch, 'mail-center encryption configuration entry is missing');
assert.equal(keyMatch[1], '', 'repository web.config must not contain a real mail encryption key');

console.log('mailbox center smoke: ok');
