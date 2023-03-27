type TinylogAsyncGenerator = AsyncGenerator<string, void, unknown>;

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

type HeaderResult = ['header', Header];
type PostResult = ['post', Post];


type ParseResult = Array<HeaderResult | PostResult>;

export class TinylogParser {
  parse(content: string): Generator<ParseResult, void, unknown>;
};

export function parseAsync(source: TinylogAsyncGenerator): AsyncGenerator<ParseResult, void, unknown>;

export class TinylogReader {
  constructor(options: { source: TinylogAsyncGenerator });
  header(): Promise<Header | undefined>;
  posts(): AsyncGenerator<Post, void, unknown> & {
    all(): Promise<Post[]>;
  };
}