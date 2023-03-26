import assert from 'node:assert';
import { test } from 'node:test';
import { TinylogReader, stringSource } from '../lib/main.js';

test('basics', async (t) => {
  let source = `# someperson on Station
author: someperson
avatar: 😊


## 2023-03-26 13:06 UTC
Some text

## 2023-03-25 00:47 UTC
Gemini testing 2

## 2023-03-25 00:44 UTC
More stuff`;

  let reader = new TinylogReader({
    source: stringSource(source)
  });
  
  let header = await reader.header();

  console.log("HERE", header);

  assert.equal(header.title, 'someperson on Station');
  assert.equal(header.author, 'someperson');
  assert.equal(header.avatar, '😊');
  assert.equal(header.description, undefined);
  assert.equal(header.license, undefined);
});