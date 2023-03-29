import { TinylogReader } from '../../lib/main.js';
import { fromGemini } from '../../lib/node.js';

let url = 'gemini://space.matthewphillips.info/tinylog/';

let reader = new TinylogReader({
  source: fromGemini(url)
});

console.log('header', await reader.header());

let feed = await reader.posts().all();
console.log('feed', feed);