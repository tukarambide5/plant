'use client';

import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Send, Bot, User, Loader2 } from 'lucide-react';
import type { ChatMessage } from '@/types';

type ChatAssistantProps = {
  plantName: string;
  messages: ChatMessage[];
  onSendMessage: (message: string) => Promise<void>;
  isLoading: boolean;
};

export default function ChatAssistant({ plantName, messages, onSendMessage, isLoading }: ChatAssistantProps) {
  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to the bottom when new messages are added
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const messageToSend = input;
    setInput('');
    await onSendMessage(messageToSend);
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="flex items-center gap-3 font-headline text-2xl md:text-3xl text-primary">
          <Bot className="h-6 w-6" />
          Chat with Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[400px]">
          <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : ''
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`rounded-lg px-4 py-2 max-w-[80%] ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <div className="bg-accent/20 p-2 rounded-full">
                      <User className="h-5 w-5 text-accent" />
                    </div>
                  )}
                </div>
              ))}
               {isLoading && messages.length > 0 && messages[messages.length-1].role === 'user' && (
                  <div className="flex items-start gap-3 mt-4">
                     <div className="bg-primary/10 p-2 rounded-full">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div className="rounded-lg px-4 py-2 bg-secondary text-secondary-foreground flex items-center justify-center">
                        <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                    </div>
                  </div>
                )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSubmit} className="mt-4 flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask about your ${plantName}...`}
              disabled={isLoading}
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
