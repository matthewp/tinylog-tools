import assert from 'node:assert';
import { test } from 'node:test';
import { TinylogReader, stringSource } from '../../lib/main.js';

test('basics', async (t) => {
  let source = `# someperson on Station
author: someperson
avatar: 😊


## 2023-03-26 13:06 UTC
Some text

## 2023-03-25 00:47 UTC
Gemini testing 2

Another line

## 2023-03-25 00:44 UTC
More stuff`;

  let reader = new TinylogReader({
    source: stringSource(source)
  });

  await t.test('header', async t => {
    let header = await reader.header();

    assert.equal(header.title, 'someperson on Station');
    assert.equal(header.author, 'someperson');
    assert.equal(header.avatar, '😊');
    assert.equal(header.description, undefined);
    assert.equal(header.license, undefined);
  });

  await t.test('posts', async t => {
    let all = await reader.posts().all();

    assert.equal(all.length, 3);

    let date = all[0].date;
    assert.equal(date.getFullYear(), 2023);
    assert.equal(date.getMonth(), 2);
    assert.equal(date.getDate(), 26);
    assert.equal(date.getUTCHours(), 13);
    assert.equal(date.getUTCMinutes(), 6);

    assert.equal(all[0].body, 'Some text');
    assert.equal(all[1].body, `Gemini testing 2

Another line`);
  });

  await t.test('posts iteration', async t => {
    let reader = new TinylogReader({
      source: stringSource(source)
    });
    let posts = [];
    for await(let post of reader.posts()) {
      posts.push(post);
    }
    assert.equal(posts.length, 3);
  });
});