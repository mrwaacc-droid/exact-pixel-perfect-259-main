import React, { useEffect, useRef, useState } from "react";
import { Loader2, Volume2, Pause, Play } from "lucide-react";
import type { BoardWriteItem, WritingSpeed } from "@/lib/types";

interface AnimatedWhiteboardProps {
  items: BoardWriteItem[];
  isPlaying?: boolean;
  onItemComplete?: (itemId: string) => void;
  onSequenceComplete?: () => void;
  writingSpeed?: WritingSpeed;
  isReplayMode?: boolean;
  showHandCursor?: boolean;
}

interface AnimatedLine {
  id: string;
  fullText: string;
  displayText: string;
  item: BoardWriteItem;
  isComplete: boolean;
}

export function AnimatedWhiteboard({
  items,
  isPlaying = true,
  onItemComplete,
  onSequenceComplete,
  writingSpeed = "normal",
  isReplayMode = false,
  showHandCursor = true,
}: AnimatedWhiteboardProps) {
  const [animatedLines, setAnimatedLines] = useState<AnimatedLine[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [handPosition, setHandPosition] = useState({ x: 0, y: 0 });
  const boardRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const speedMap = {
    slow: 80,
    normal: 50,
    fast: 25,
  };

  const charDelay = speedMap[writingSpeed];

  // Initialize lines
  useEffect(() => {
    if (items.length === 0) return;
    setAnimatedLines(
      items.map((item) => ({
        id: item.id,
        fullText: item.text,
        displayText: "",
        item,
        isComplete: false,
      })),
    );
  }, [items]);

  // Main animation loop
  useEffect(() => {
    if (!isPlaying || animatedLines.length === 0 || !boardRef.current) return;

    const interval = setInterval(() => {
      setAnimatedLines((prevLines) => {
        if (currentItemIndex >= prevLines.length) {
          clearInterval(interval);
          onSequenceComplete?.();
          return prevLines;
        }

        const currentLine = prevLines[currentItemIndex];
        if (currentLine.isComplete) {
          setCurrentItemIndex(currentItemIndex + 1);
          return prevLines;
        }

        const nextCharIndex = currentLine.displayText.length;
        const nextChar = currentLine.fullText[nextCharIndex];

        if (nextChar === undefined) {
          const newLines = [...prevLines];
          newLines[currentItemIndex] = { ...currentLine, isComplete: true };
          onItemComplete?.(currentLine.id);

          // Auto-scroll
          setTimeout(() => {
            if (boardRef.current) {
              const lineElements = boardRef.current.querySelectorAll(".whiteboard-line");
              const lastLine = lineElements[currentItemIndex];
              if (lastLine) {
                lastLine.scrollIntoView({
                  behavior: "smooth",
                  block: "nearest",
                });
              }
            }
          }, 200);

          return newLines;
        }

        const newLines = [...prevLines];
        newLines[currentItemIndex] = {
          ...currentLine,
          displayText: currentLine.displayText + nextChar,
        };

        // Update hand position
        const lineElement = boardRef.current?.querySelector(
          `[data-line-id="${currentLine.id}"]`,
        ) as HTMLElement;
        if (lineElement && showHandCursor) {
          const rect = lineElement.getBoundingClientRect();
          const boardRect = boardRef.current?.getBoundingClientRect();
          if (boardRect) {
            setHandPosition({
              x: rect.right + 10,
              y:
                rect.top - boardRect.top + (boardRef.current ? boardRef.current.scrollTop : 0) + 20,
            });
          }
        }

        return newLines;
      });
    }, charDelay);

    return () => clearInterval(interval);
  }, [
    isPlaying,
    animatedLines,
    currentItemIndex,
    charDelay,
    onItemComplete,
    onSequenceComplete,
    showHandCursor,
  ]);

  const getLineClass = (item: BoardWriteItem) => {
    const baseClass = "whiteboard-line font-handwriting text-gray-900 mb-6 leading-relaxed";
    const typeClasses = {
      heading: "text-3xl font-bold",
      bullet: "text-xl ml-6 relative before:content-['•'] before:absolute before:left-0",
      equation: "text-2xl font-bold font-mono",
      calculation: "text-xl font-mono",
      question: "text-lg italic text-[var(--crimson-dark)]",
      answer: "text-lg font-semibold text-green-700",
      diagram_label: "text-lg text-gray-700",
      step_number: "text-lg font-semibold text-gray-600",
    };
    return `${baseClass} ${typeClasses[item.type] || ""}`;
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm font-semibold text-gray-600">Learning Whiteboard</span>
        </div>
        <div className="flex items-center gap-2">
          {isAnimating && (
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Loader2 className="h-3 w-3 animate-spin" />
              Writing...
            </div>
          )}
        </div>
      </div>

      {/* Whiteboard Container */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto bg-gradient-to-br from-white via-[var(--crimson-soft)]/30 to-white relative"
      >
        {/* Whiteboard Content */}
        <div
          ref={boardRef}
          className="kr-learning-whiteboard p-12 max-w-4xl mx-auto relative"
          style={{
            fontFamily: "'Patrick Hand', 'Caveat', cursive",
            minHeight: "100%",
          }}
        >
          {animatedLines.map((line, index) => (
            <div
              key={line.id}
              data-line-id={line.id}
              className={getLineClass(line.item)}
              style={{
                minHeight: "2rem",
                animation: line.isComplete ? "fadeIn 0.3s ease-out" : "none",
              }}
            >
              {line.displayText}
              {!line.isComplete && currentItemIndex === index && (
                <span className="animate-pulse">|</span>
              )}
            </div>
          ))}

          {/* Hand Cursor */}
          {showHandCursor && isPlaying && currentItemIndex < animatedLines.length && (
            <div
              className="pointer-events-none absolute"
              style={{
                left: `${handPosition.x}px`,
                top: `${handPosition.y}px`,
                fontSize: "24px",
              }}
            >
              ✍️
            </div>
          )}

          {/* Empty State */}
          {animatedLines.length === 0 && (
            <div className="flex items-center justify-center h-64 text-gray-400">
              <p>Whiteboard ready. Waiting for content...</p>
            </div>
          )}
        </div>
      </div>

      {/* Control Bar */}
      <div className="px-6 py-4 border-t border-gray-100 bg-white flex items-center justify-between text-xs text-gray-600">
        <div>
          Item {currentItemIndex + 1} of {animatedLines.length}
        </div>
        <div className="flex items-center gap-2">
          <span>Writing Speed: {writingSpeed}</span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .kr-learning-whiteboard {
          font-family: "Patrick Hand", "Caveat", cursive;
        }

        .whiteboard-line {
          transition: all 0.1s ease-out;
        }
      `}</style>
    </div>
  );
}
