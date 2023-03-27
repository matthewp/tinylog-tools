# Tinylog Tools

A suite of tools for working with the [Tinylogs format](https://codeberg.org/bacardi55/gemini-tinylog-rfc). A Tinylog is a gemtext file that contains individual posts sorted by date, like in a microblogging site.

## Usage

### Reading

The `TinylogReader` class is used to read a Tinylog from an external source. This source can be a string or any remote location. For example, creating a reader from a string:

```js
import { TinylogReader } from '@matthewp/tinylog-tools';

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

let reader = TinylogReader.fromString(source);

let header = await reader.header();
console.log(header.title); // -> "someperson on Station"
```

You can also use any external source you want, by passing in an async iterator to the `source` option:

```js
import { TinylogReader } from '@matthewp/tinylog-tools';

let reader = new TinylogReader({
  source: (async function*() {
    yield '# someperson on  Station';
    yield 'author: someperson';
    // ...
  })()
})
```

This can be used to retrieve external sources of logs, such as from network. For example, if the tinylog is available over HTTP you could do:

```js
import { TinylogReader } from '@matthewp/tinylog-tools';

let reader = new TinylogReader({
  source: fetch('https://example.com/tinylog')
});
```

#### Methods

The reader has the following methods you'll find useful:

__reader.header()__

```js
let header = await reader.header();
```

The header contains metadata about the feed, the title, description, author, avatar, and license. Since headers are optional, this method will return `undefined` if there is no header.

__reader.posts()__

This starts retrieving individual posts in the feed. This is done incrementally, so you can stop reading posts any time, which prevents buffering the entire feed into memory (in the case of long feeds).

```js
for await(let post of reader.posts()) {
  console.log(post.body);

  if(post.date < yesterday) {
    break;
  }
}
```

Additionally posts() returns an object with an `all()` method that can be used to collect all of the posts into an array:

```js
let allPosts = await reader.posts().all();

console.log(allPosts); // [{ ... }]
```

### Types

The header and posts are represented as:

```ts
type Header = {
  title: string;
  description: string;
  author: string;
  avatar: string;
  license: string;
};

type Post = {
  date: Date | undefined;
  body: string;
};
```

## License

BSD-2-Clause