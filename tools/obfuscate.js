/**
 * =========================================================================
 * Mobile Gallery — Standalone Production Code Obfuscator
 * =========================================================================
 * Transforms clean source code from `src/js/*.js` into heavily obfuscated,
 * tamper-resistant production code in `assets/js/*.js`.
 *
 * Techniques Applied:
 *   1. Full lexical stripping of comments and developer notes
 *   2. Complete hexadecimal encoding of all string literals (\xHH)
 *   3. Semicolon-preserving whitespace compaction
 *   4. Automated compiler syntax validation (`node -c`)
 *   5. Tamper-defense production header
 * =========================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SRC_DIR = path.resolve(__dirname, '../src/js');
const DIST_DIR = path.resolve(__dirname, '../assets/js');

// Convert string to hex escape sequence (\xHH)
function toHexEscape(str) {
  let res = '';
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    if (code === 92) { // \
      res += '\\\\';
    } else if (code === 10) { // \n
      res += '\\n';
    } else if (code === 13) { // \r
      res += '\\r';
    } else if (code === 9) { // \t
      res += '\\t';
    } else if (code < 128) {
      res += '\\x' + code.toString(16).padStart(2, '0');
    } else {
      res += '\\u' + code.toString(16).padStart(4, '0');
    }
  }
  return res;
}

// Lexical tokenizer regex for JS:
// Matches double strings, single strings, template literals, regexes, single-line comments, multi-line comments
const LEX_REGEX = /("(?:\\[\s\S]|[^"\\])*"|'(?:\\[\s\S]|[^'\\])*'|`(?:\\[\s\S]|[^`\\])*`|\/(?![*\/])(?:\\[\s\S]|[^\/\\\n])+\/(?:[gimsuy]*)|(?:\/\/[^\r\n]*)|(?:\/\*[\s\S]*?\*\/))/g;

function obfuscateCode(source) {
  // Step 1: Lexical comment stripping and string hex-encoding
  const transformed = source.replace(LEX_REGEX, match => {
    // Single-line comment -> drop
    if (match.startsWith('//')) {
      return '';
    }
    // Block comment -> drop
    if (match.startsWith('/*')) {
      return '';
    }
    // Single or double quoted strings -> hex-encode content
    if (match.startsWith('"') || match.startsWith("'")) {
      const quote = match[0];
      const rawContent = match.slice(1, -1);
      if (rawContent.length === 0) return quote + quote;

      // Unescape any already-escaped chars before hexing
      let unescaped = rawContent;
      try {
        unescaped = (quote === '"') ? JSON.parse('"' + rawContent + '"') : eval(match);
      } catch (_) {}

      return quote + toHexEscape(unescaped) + quote;
    }
    // Template literals or regexes -> leave tokens intact so interpolation ${...} never breaks
    return match;
  });

  // Step 2: Safe whitespace compaction (remove blank lines, trim line ends)
  const compacted = transformed
    .split('\n')
    .map(l => l.trimRight())
    .filter(l => l.trim().length > 0)
    .join('\n');

  const header = `/* Mobile Gallery v1.0.0 - Production Protected Build. (c) 2026 Mobile Gallery Inc. All Rights Reserved. Reverse-engineering, redistribution or copying is prohibited. */\n`;

  return header + compacted;
}

function run() {
  console.log('--- MOBILE GALLERY PRODUCTION OBFUSCATION ---');
  if (!fs.existsSync(SRC_DIR)) {
    console.error('Source directory src/js does not exist!');
    process.exit(1);
  }

  const files = fs.readdirSync(SRC_DIR).filter(f => f.endsWith('.js'));
  console.log(`Found ${files.length} source files to obfuscate from ${SRC_DIR}:`);

  let successCount = 0;
  for (const file of files) {
    const srcFile = path.join(SRC_DIR, file);
    const targets = (file === 'sheet-endpoint.js')
      ? [path.resolve(__dirname, '../tools/sheet-endpoint.js'), path.join(DIST_DIR, file)]
      : [path.join(DIST_DIR, file)];

    const sourceCode = fs.readFileSync(srcFile, 'utf8');

    try {
      const obfuscated = obfuscateCode(sourceCode);
      for (const target of targets) {
        fs.writeFileSync(target, obfuscated, 'utf8');
        execSync(`node -c "${target}"`, { stdio: 'pipe' });
      }

      const srcSize = (sourceCode.length / 1024).toFixed(1);
      const distSize = (obfuscated.length / 1024).toFixed(1);
      console.log(`  [OK] ${file}: Obfuscated & validated (${srcSize} KB -> ${distSize} KB) [${targets.length} target(s)]`);
      successCount++;
    } catch (err) {
      console.error(`  [ERROR] Syntax validation failed for ${file}:`, err.message);
      for (const target of targets) {
        fs.writeFileSync(target, sourceCode, 'utf8');
      }
    }
  }

  console.log(`\n======================================================`);
  console.log(`Obfuscation Status: ${successCount}/${files.length} files successfully compiled into assets/js/`);
  console.log(`Private Source Code: Safe in src/js/ (ignored in .gitignore)`);
  console.log(`======================================================\n`);

  if (successCount !== files.length) {
    process.exit(1);
  }
}

run();
