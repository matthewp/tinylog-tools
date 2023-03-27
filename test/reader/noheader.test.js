import assert from 'node:assert';
import { test } from 'node:test';
import { TinylogReader, stringSource } from '../../lib/main.js';

test('No header provided', async (t) => {
  let source = `## 2023-03-26 13:06 UTC
Some text

## 2023-03-25 00:44 UTC
More stuff`;

  let reader = new TinylogReader({
    source: stringSource(source)
  });

  await t.test('header', async t => {
    let header = await reader.header();
    assert.equal(header, undefined);
  });

  await t.test('posts', async t => {
    let posts = await reader.posts().all();
    assert.equal(posts.length, 2);
  });
});
