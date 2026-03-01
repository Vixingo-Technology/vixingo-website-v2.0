"use client";

import { useState, useRef, useEffect } from "react";
import { ChatCircle, X, PaperPlaneRight } from "@phosphor-icons/react";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Vix, your Vixingo AI assistant. Ask me anything about our services, portfolio, or how we can help your business.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: input,
          history: messages.slice(-6).map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.reply ||
            "I'm sorry, I couldn't process that. Can I connect you with our team?",
          timestamp: new Date(),
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, something went wrong. Please try again or reach out to us at hello@vixingo.com.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-[380px] h-[520px] bg-bg-secondary border border-bg-border rounded-lg shadow-2xl flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-bg-elevated border-b border-bg-border">
            <div className="flex items-center gap-2">
              <span className="font-display text-lg text-accent-gold tracking-wider">
                VIX
              </span>
              <span className="text-text-secondary text-sm">AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-text-muted hover:text-text-primary transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    msg.role === "user"
                      ? "bg-accent-gold text-[#1A1A16]"
                      : "bg-bg-elevated text-text-primary"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-bg-elevated px-3 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-accent-gold rounded-full animate-bounce" />
                    <span
                      className="w-2 h-2 bg-accent-gold rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <span
                      className="w-2 h-2 bg-accent-gold rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={sendMessage}
            className="border-t border-bg-border p-3 flex gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything about Vixingo..."
              className="flex-1 bg-bg-elevated border border-bg-border rounded-lg px-3 py-2 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent-gold"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 bg-accent-gold text-[#1A1A16] rounded-lg hover:bg-accent-gold-light transition-colors disabled:opacity-50 cursor-pointer"
            >
              <PaperPlaneRight size={18} weight="fill" />
            </button>
          </form>
        </div>
      )}

      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 sm:right-6 z-50 w-14 h-14 bg-accent-gold text-[#1A1A16] rounded-full shadow-lg flex items-center justify-center hover:bg-accent-gold-light hover:scale-105 transition-all cursor-pointer"
        aria-label="Open chat"
      >
        {isOpen ? (
          <X size={24} weight="bold" />
        ) : (
          <ChatCircle size={24} weight="fill" />
        )}
      </button>
    </>
  );
}
