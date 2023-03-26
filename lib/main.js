const PARSE_STAGE_HEADER = 0;
const PARSE_STAGE_POST = 1;

const HEADER_STAGE_TITLE = 0;
const HEADER_STAGE_DESCRIPTION = 1;
const HEADER_STAGE_META = 2;

const POST_STAGE_TITLE = 0;
const POST_STAGE_BODY = 1;

const headerMetaExp = /^(author|avatar|license):/;

function saveMeta(header, res, line) {
  header[res[1]] = line.slice(res[0].length).trim();
}

function newPost() {
  return {
    title: undefined,
    body: undefined,
  };
}

class TinylogParser {
  newline = true;
  line = '';
  header = {
    title: undefined,
    description: undefined,
    author: undefined,
    avatar: undefined,
    license: undefined
  };
  post = newPost();
  stage = PARSE_STAGE_HEADER;
  substage = HEADER_STAGE_TITLE;
  content = '';
  
  * #lines(chunk) {
    let lines = chunk.split('\n');
    if(!this.newline) {
      lines[0] = this.line + lines[0];
      this.line = '';
    }

    let lastLine = lines.at(-1);
    if(lastLine === '') {
      this.newline = true;
      this.line = '';
    } else {
      this.newline = false;
      this.line = lastLine;
      lines.pop();
    }

    yield * lines;
  }

  * #readLine(line) {
    if(this.stage === PARSE_STAGE_HEADER) {
      if(line.startsWith('##')) {
        this.stage = PARSE_STAGE_POST;
        this.substage = POST_STAGE_TITLE;

        if(this.content) {
          this.header.description = content;
          this.content = '';
        }

        if(this.header.title || this.header.description) {
          yield ['header', this.header];
        }
      } else {
        if(this.substage === HEADER_STAGE_TITLE) {
          if(line.startsWith('#')) {
            this.header.title = line.slice(1).trim();
            this.substage = HEADER_STAGE_DESCRIPTION;
          } else {
            this.substage = HEADER_STAGE_DESCRIPTION;
          }
        }
        
        if(this.substage === HEADER_STAGE_DESCRIPTION) {
          headerMetaExp.lastIndex = 0;
          let res = headerMetaExp.exec(line);
          if(res) {
            if(this.content) {
              this.header.description = this.content;
              this.content = '';
            }
            saveMeta(this.header, res, line);
            this.substage = HEADER_STAGE_META;
          } else {
            this.content += line;
          }
        } else {
          if(this.content) {
            this.header.description = content;
            this.content = '';
          }
          headerMetaExp.lastIndex = 0;
          let res = headerMetaExp.exec(line);
          if(res) {
            saveMeta(this.header, res, line);
          }
        }
      }
    }

    if(this.stage === PARSE_STAGE_POST) {
      if(this.substage === POST_STAGE_TITLE) {
        if(this.post.title) {
          yield ['post', this.post];
          this.post = newPost();
        }
        if(line.startsWith('##')) {
          this.post.title = line.slice(2).trim();
        }
      }
    }
  }

  *read(chunk) {
    for(let line of this.#lines(chunk)) {
      yield * this.#readLine(line);
    }
  }

  *end() {
    if(this.line) {
      yield * this.#readLine(this.line);
    }
  }
}

async function* parseAsync(source) {
  let parser = new TinylogParser();
  for await(let chunk of source) {
    yield * parser.read(chunk);
  }
  yield * parser.end();
}

async function * stringSource(text) {
  yield text;
}

const noValue = Symbol('no.value');

class TinylogReader {
  #source;
  #header = null;
  #buffer = [];
  constructor(options) {
    this.#source = parseAsync(options.source);
  }
  async header() {
    if(this.#header) {
      if(this.#header === noValue) {
        return undefined;
      }
      return this.#header;
    }
    let result = await this.#source.next();
    if(result.value) {
      let [type, value] = result.value;
      if(type === 'post') {
        this.#buffer.push(value);
        this.#header = noValue;
      } else {
        this.#header = value;
        return value;
      }
    }
  }
  async * posts() {
    if(this.#buffer.length) {
      let posts = Array.from(this.#buffer);
      this.#buffer.length = 0;
      yield * posts;
    }

    for(let [type, value] of this.#source) {
      if(type === 'header') {
        this.#header = value;
      } else {
        yield value;
      }
    }
  }
}

export {
  TinylogParser,
  parseAsync,
  stringSource,
  TinylogReader
}