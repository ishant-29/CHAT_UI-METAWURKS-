"use client";
import { useState, useEffect, useMemo } from "react";
import { parseMarkdown } from "@/lib/parseMarkdown";

export default function TypewriterText({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timer = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex((i) => i + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [index, text, speed]);

  useEffect(() => {
    setDisplayed("");
    setIndex(0);
  }, [text]);

  const renderedHTML = useMemo(() => parseMarkdown(displayed), [displayed]);

  return (
    <span className="markdown-content">
      <span dangerouslySetInnerHTML={{ __html: renderedHTML }} />
      {index < text.length && <span className="animate-pulse opacity-50 ml-0.5">|</span>}
    </span>
  );
}
