
import assert from 'node:assert';
import { test } from 'node:test';
import { TinylogReader } from '../../lib/main.js';

test('UTC offset time', async (t) => {
  let source = `## 2023-03-26 13:06 UTC
Some text

## 2023-03-29 07:45 -0500
More stuff

## 2023-03-29 07:45 +0200
Another`;

  let reader = TinylogReader.fromString(source);
  let posts = await reader.posts().all();

  await t.test('UTC', t => {
    let date = posts[0].date;
    assert.equal(date.getUTCHours(), 13);
  });

  await t.test('minus UTC', t => {
    let date = posts[1].date;

    assert.equal(date.getUTCHours(), 12);
    assert.equal(date.getUTCMinutes(), 45);
  });

  await t.test('plus UTC', t => {
    let date = posts[2].date;

    assert.equal(date.getUTCHours(), 5);
    assert.equal(date.getUTCMinutes(), 45);
  });
});