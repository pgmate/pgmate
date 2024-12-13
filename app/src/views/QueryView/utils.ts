export const splitIntoStatements1 = (content: string): string[] => {
  const lines = content.split("\n");
  const statements: string[] = [];
  let currentStatement = "";

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    currentStatement += trimmedLine + "\n";

    // Check if the line ends with a semicolon
    if (trimmedLine.endsWith(";")) {
      statements.push(currentStatement.trim());
      currentStatement = ""; // Reset for the next statement
    }
  });

  // Add the last statement if it doesn't end with a semicolon
  if (currentStatement.trim()) {
    statements.push(currentStatement.trim());
  }

  return statements;
};

export const splitIntoStatements2 = (source: string): string[] => {
  // Equivalent logic simplified for JavaScript
  let delimiter = ";";
  const space = "(?:\\s|/\\*[\\s\\S]*?\\*/|(?:#|-- )[^\\n]*\\n?|--\\r?\\n)";
  // Assuming jush = "sql"
  const parse = `[\'"\`#]|/\\*|-- |$`;

  const statements: string[] = [];
  let query = source;
  let offset = 0;

  while (query !== "") {
    const delimiterMatch = new RegExp(
      `^${space}*DELIMITER\\s+(\\S+)`,
      "i"
    ).exec(query);
    if (!offset && delimiterMatch) {
      delimiter = delimiterMatch[1];
      query = query.slice(delimiterMatch[0].length);
    } else {
      const mainRegex = new RegExp(`(${delimiter}\\s*|${parse})`);
      const match = mainRegex.exec(query.slice(offset));
      if (!match) {
        if (query.trim() !== "") statements.push(query.trim());
        break;
      } else {
        const found = match[1];
        const pos = offset + match.index!;

        if (found && found.trim() !== delimiter) {
          // Consume until matching closing token (comment, quote, etc.)
          let closePattern: string;
          if (found === "/*") {
            closePattern = "\\*/";
          } else if (
            found === "-- " ||
            found === "#" ||
            found === "--\n" ||
            found === "--\r\n"
          ) {
            closePattern = "\n";
          } else if (found === '"' || found === "'" || found === "`") {
            const qChar = found[0];
            // Find the same quote not preceded by a backslash
            closePattern = `(${qChar}|\\\\.)`;
          } else {
            // No special handling, just move on
            offset = pos + found.length;
            continue;
          }

          const innerRegex = new RegExp(`(${closePattern}|$)`, "g");
          innerRegex.lastIndex = pos + found.length;
          let innerMatch;
          let done = false;
          while ((innerMatch = innerRegex.exec(query))) {
            if (!innerMatch[1]) {
              offset = query.length;
              done = true;
              break;
            }
            if (innerMatch[1][0] !== "\\") {
              offset = innerRegex.lastIndex;
              done = true;
              break;
            }
          }
          if (!done) offset = query.length;
        } else {
          // End of a statement
          const q = query.slice(0, pos);
          if (q.trim() !== "") statements.push(q.trim());
          query = query.slice(pos + (found ? found.length : 0));
          offset = 0;
        }
      }
    }
  }

  return statements;
};
