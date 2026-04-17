import { readFile } from "fs/promises";
import { join } from "path";

export async function extractTextFromFile(
  filePath: string,
  fileType: string
): Promise<string | null> {
  try {
    const fullPath = join(process.cwd(), "public", filePath);
    const buffer = await readFile(fullPath);

    // Extract text based on file type
    if (fileType === "application/pdf") {
      const pdfParse = require("pdf-parse");
      const data = await pdfParse(buffer);
      return data.text;
    } else if (fileType === "text/plain") {
      return buffer.toString("utf-8");
    } else if (
      fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (fileType === "application/msword") {
      // Basic DOC support (limited)
      return buffer.toString("utf-8");
    }

    return null;
  } catch (error) {
    console.error("Error extracting text from file:", error);
    return null;
  }
}

export async function processAttachments(
  attachments: any[]
): Promise<{ textContent: string }> {
  if (!attachments || attachments.length === 0) {
    return { textContent: "" };
  }

  const processedFiles: string[] = [];

  for (const attachment of attachments) {
    const { name, type, url } = attachment;

    // For videos, just mention them
    if (type.startsWith("video/")) {
      processedFiles.push(`[Video: ${name}]`);
      continue;
    }

    // For documents, extract text
    if (
      type === "application/pdf" ||
      type === "text/plain" ||
      type.includes("word")
    ) {
      const text = await extractTextFromFile(url, type);
      if (text) {
        processedFiles.push(
          `[Document: ${name}]\nContent:\n${text.substring(0, 10000)}\n[End of ${name}]`
        );
      } else {
        processedFiles.push(`[Document: ${name} - Unable to extract text]`);
      }
    }
  }

  if (processedFiles.length === 0) {
    return { textContent: "" };
  }

  const textContent = `\n\n--- Attached Files ---\n${processedFiles.join("\n\n")}\n--- End of Attachments ---\n\n`;
  return { textContent };
}
