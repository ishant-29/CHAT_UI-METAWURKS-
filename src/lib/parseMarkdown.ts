export function parseMarkdown(raw: string): string {
  if (!raw) return "";

  let text = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const lines = text.split("\n");
  const output: string[] = [];
  let inUl = false;
  let inOl = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    const ulMatch = line.match(/^\s*[\*\-]\s+(.+)/);
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

    if (inUl) { output.push("</ul>"); inUl = false; }
    if (inOl) { output.push("</ol>"); inOl = false; }

    if (line.trim() === "") {
      output.push("<br/>");
      continue;
    }

    output.push(line);
    if (i < lines.length - 1) {
      const nextLine = lines[i + 1];
      const nextIsUl = /^\s*[\*\-]\s+/.test(nextLine);
      const nextIsOl = /^\s*\d+\.\s+/.test(nextLine);
      if (!nextIsUl && !nextIsOl && nextLine.trim() !== "") {
        output.push("<br/>");
      }
    }
  }
  if (inUl) output.push("</ul>");
  if (inOl) output.push("</ol>");

  let html = output.join("\n");

  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  html = html.replace(/(?<!\w)\*([^\*\n]+?)\*(?!\w)/g, "<em>$1</em>");

  // Handle markdown links [text](url)
  html = html.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\)]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
  );

  // Handle plain URLs
  html = html.replace(
    /(?<!href=")(https?:\/\/[^\s\)<]+)/g,
    '<a href="$1" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline">$1</a>'
  );

  return html;
}
