import { useState, useRef, useEffect } from "react";
import { Send, Mic, Loader2 } from "lucide-react";
import type { ClassroomContext } from "@/lib/types";
import type { ChatMessage } from "@/lib/types";
import { DEMO_QUICK_ACTIONS } from "@/lib/demo-data";

interface ChatPanelProps {
  classroomContext: ClassroomContext;
  messages?: ChatMessage[];
  isLoading?: boolean;
  onSendMessage?: (message: string) => void;
  onQuickAction?: (action: string) => void;
  children?: React.ReactNode;
}

export function ChatPanel({
  classroomContext,
  messages: messageProp,
  isLoading = false,
  onSendMessage,
  onQuickAction,
  children,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { learnerAccessProfile } = classroomContext;
  const messages = messageProp || classroomContext.messages;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    onSendMessage?.(input.trim());
    setInput("");
  };

  const handleQuickAction = (action: string) => {
    onQuickAction?.(action);
  };

  const toggleListening = () => {
    setIsListening(!isListening);
    // In real implementation, start/stop speech recognition
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">👋</div>
            <p className="text-sm text-gray-600">Say hello to start learning!</p>
            <p className="text-xs text-gray-400 mt-1">Your AI teacher is ready to help you learn</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === "student" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                  message.sender === "student"
                    ? "bg-[var(--crimson)] text-white rounded-br-md"
                    : "bg-gray-100 text-gray-800 rounded-bl-md"
                }`}
              >
                {message.message}
              </div>
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            Thinking…
          </div>
        )}

        <div ref={messagesEndRef} />
        {children}
      </div>

      {/* Quick Actions */}
      <div className="border-t border-gray-100 p-3">
        <div className="grid grid-cols-2 gap-2 mb-3">
          {DEMO_QUICK_ACTIONS.slice(0, 6).map((action) => (
            <button
              key={action.label}
              onClick={() => handleQuickAction(action.label)}
              disabled={isLoading}
              className="text-left px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 hover:border-[var(--crimson-soft)] hover:text-[var(--crimson)] disabled:opacity-50 transition-colors"
            >
              <span className="mr-1">{action.icon}</span>
              {action.label}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question…"
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-[var(--crimson)] disabled:opacity-50"
          />

          {learnerAccessProfile.voiceInputEnabled && (
            <button
              type="button"
              onClick={toggleListening}
              disabled={isLoading}
              className={`p-2.5 rounded-lg transition-colors ${
                isListening
                  ? "bg-red-100 text-red-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
              aria-label="Voice input"
            >
              <Mic size={18} />
            </button>
          )}

          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-2.5 rounded-lg bg-[var(--crimson)] text-white hover:bg-[var(--crimson-dark)] disabled:opacity-50 transition-colors"
            aria-label="Send message"
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
