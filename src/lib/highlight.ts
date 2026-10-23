export interface CodeToken {
  text: string;
  className: string;
}

const TOKEN_PATTERN =
  /(\/\/.*$)|("(?:\\.|[^"\\])*")|(\b(?:import|from|export|const)\b)|(\b[A-Za-z_$][\w$]*(?=\s*:))|(\bdefineCatalog\b)|(\bschema\b|\bz\b)|(\.(?:object|string|number|boolean|enum|any|unknown|nullable|optional|min|max)\b)|(\b\d+\b)|([{}()[\],;:])/g;

const TOKEN_CLASSES: Record<number, string> = {
  1: 'tok-comment',
  2: 'tok-string',
  3: 'tok-keyword',
  4: 'tok-key',
  5: 'tok-fn',
  6: 'tok-callee',
  7: 'tok-method',
  8: 'tok-number',
  9: 'tok-punct',
};

export function highlightCodeLine(line: string): CodeToken[] {
  const tokens: CodeToken[] = [];
  let cursor = 0;
  TOKEN_PATTERN.lastIndex = 0;

  let match: RegExpExecArray | null;
  while ((match = TOKEN_PATTERN.exec(line)) !== null) {
    if (match.index > cursor) {
      tokens.push({ text: line.slice(cursor, match.index), className: '' });
    }

    let tokenClass = '';
    for (let group = 1; group < match.length; group += 1) {
      if (match[group] !== undefined) {
        tokenClass = TOKEN_CLASSES[group] ?? '';
        break;
      }
    }

    tokens.push({ text: match[0], className: tokenClass });
    cursor = match.index + match[0].length;
  }

  if (cursor < line.length) {
    tokens.push({ text: line.slice(cursor), className: '' });
  }

  return tokens;
}
