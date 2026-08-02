"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, MessageSquare, Loader2, Clock, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { fmtRelative } from "@/lib/utils/format";

interface PortalMessage {
  id: string;
  direction: "incoming" | "outgoing";
  message: string;
  sender: string;
  timestamp: string;
  read: boolean;
}

export function PortalMessages() {
  const qc = useQueryClient();
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const messagesQ = useQuery<{ items: PortalMessage[] }>({
    queryKey: ["portal-messages"],
    queryFn: async () => {
      const r = await fetch("/api/portal/messages");
      if (!r.ok) throw new Error("Failed");
      return r.json();
    },
    refetchInterval: 15000, // Poll every 15s for new messages
  });

  const sendMut = useMutation({
    mutationFn: async (message: string) => {
      const r = await fetch("/api/portal/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      });
      if (!r.ok) throw new Error("Failed to send");
      return r.json();
    },
    onSuccess: () => {
      setInput("");
      qc.invalidateQueries({ queryKey: ["portal-messages"] });
    },
  });

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesQ.data?.items]);

  const messages = messagesQ.data?.items || [];

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || sendMut.isPending) return;
    sendMut.mutate(input.trim());
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="border-border/60 shadow-soft rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/60">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="size-5 text-primary" />
            Messages
            {messages.length > 0 && (
              <span className="text-xs text-muted-foreground font-normal">
                · {messages.filter(m => m.direction === "incoming" && !m.read).length} unread
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages area */}
          <div ref={scrollRef} className="h-[400px] overflow-y-auto p-4 space-y-3">
            {messagesQ.isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="size-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm text-muted-foreground">No messages yet.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Send a message to our team — we typically respond within 24 hours.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex flex-col max-w-[80%] rounded-2xl p-3",
                    msg.direction === "outgoing"
                      ? "ml-auto bg-primary text-primary-foreground rounded-br-sm"
                      : "mr-auto bg-muted rounded-bl-sm"
                  )}
                >
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                  <div className={cn(
                    "flex items-center gap-1 mt-1 text-[10px]",
                    msg.direction === "outgoing" ? "text-primary-foreground/70" : "text-muted-foreground"
                  )}>
                    <Clock className="size-2.5" />
                    {fmtRelative(msg.timestamp)}
                    {msg.direction === "outgoing" && msg.read && (
                      <CheckCheck className="size-2.5 ml-0.5" />
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Input area */}
          <form onSubmit={handleSend} className="border-t border-border/60 p-3 flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message…"
              disabled={sendMut.isPending}
              className="flex-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!input.trim() || sendMut.isPending}
              className="shrink-0"
            >
              {sendMut.isPending ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Send className="size-4" />
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
