"use client";
import { useEffect, useRef } from "react";

export function useAutoScroll(dependencies: any[]) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, dependencies);

  return scrollRef;
}
