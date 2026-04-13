/**
 * Lightweight markdown-to-HTML parser for chat messages.
 * Handles: bold, italic, bullet lists, numbered lists, line breaks, and code.
 */
export function parseMarkdown(raw: string): string {
  if (!raw) return "";

  let text = raw
    // Escape HTML entities to prevent injection
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  // --- Block-level: convert lines into structured HTML ---
  const lines = text.split("\n");
  const output: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Unordered list item:  * item  or  - item
    const ulMatch = line.match(/^\s*[\*\-]\s+(.+)/);
    // Ordered list item:  1. item
    const olMatch = line.match(/^\s*\d+\.\s+(.+)/);

    if (ulMatch) {
      if (inOl) { output.push("</ol>"); inOl = false; }
      if (!inUl) { output.push("<ul>"); inUl = true; }
      output.push(`<li>${ulMatch[1]}</li>`);
      continue;
    }

    if (olMatch) {
      if (inUl) { output.push("</ul>"); inUl = false; }
      if (!inOl) { output.push("<ol>"); inOl = true; }
      output.push(`<li>${olMatch[1]}</li>`);
      continue;
    }

    // Close any open list
    if (inUl) { output.push("</ul>"); inUl = false; }
    if (inOl) { output.push("</ol>"); inOl = false; }

    // Empty line → paragraph break
    if (line.trim() === "") {
      output.push("<br/>");
      continue;
    }

    output.push(line);
    // Add a line break between non-list lines unless it's the last line
    if (i < lines.length - 1) {
      const nextLine = lines[i + 1];
      const nextIsUl = /^\s*[\*\-]\s+/.test(nextLine);
      const nextIsOl = /^\s*\d+\.\s+/.test(nextLine);
      if (!nextIsUl && !nextIsOl && nextLine.trim() !== "") {
        output.push("<br/>");
      }
    }
  }
  // Close any open lists at end
  if (inUl) output.push("</ul>");
  if (inOl) output.push("</ol>");

  let html = output.join("\n");

  // --- Inline formatting ---
  // Inline code: `code`
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  // Bold: **text**
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  // Italic: *text*  (but not inside list markers already handled)
  html = html.replace(/(?<!\w)\*([^\*\n]+?)\*(?!\w)/g, "<em>$1</em>");

  return html;
}
