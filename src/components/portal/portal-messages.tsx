"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Loader2, MessageSquare } from "lucide-react";
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
    refetchInterval: 10000, // Poll every 10s
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
    <div className="max-w-2xl mx-auto">
      <Card className="border-border/60 shadow-soft rounded-xl overflow-hidden">
        <CardHeader className="bg-primary/5 border-b border-border/60 py-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="size-4 text-primary" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {/* Messages */}
          <div ref={scrollRef} className="h-[350px] overflow-y-auto p-3 space-y-2">
            {messagesQ.isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <MessageSquare className="size-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground">No messages yet.</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  Send us a message — we respond within 24 hours.
                </p>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "max-w-[80%] rounded-xl px-3 py-2",
                    msg.direction === "outgoing"
                      ? "ml-auto bg-primary text-primary-foreground"
                      : "mr-auto bg-muted"
                  )}
                >
                  <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    msg.direction === "outgoing" ? "text-primary-foreground/60" : "text-muted-foreground"
                  )}>
                    {fmtRelative(msg.timestamp)}
                  </p>
                </div>
              ))
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="border-t border-border/60 p-2 flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Write a message…"
              disabled={sendMut.isPending}
              className="flex-1"
            />
            <Button type="submit" size="icon" disabled={!input.trim() || sendMut.isPending}>
              {sendMut.isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
