import assert from 'node:assert';
import { test } from 'node:test';
import { TinylogReader } from '../../lib/main.js';

test('Header with no title', async (t) => {
  let source = `author: someperson
avatar: 😊


## 2023-03-26 13:06 UTC
Some text`;

  let reader = TinylogReader.fromString(source);

  await t.test('header', async t => {
    let header = await reader.header();
    assert.notEqual(header, undefined);
    assert.equal(header.author, 'someperson');
    assert.equal(header.avatar, '😊');
  });
});
