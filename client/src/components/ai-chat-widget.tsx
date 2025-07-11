import { useState, useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Send, Bot, User, MessageSquare, X, Minimize2, Maximize2 } from 'lucide-react';
import { format } from 'date-fns';

interface ChatMessage {
  id: number;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  category?: string;
}

interface AIChatWidgetProps {
  context: 'installation' | 'fault-detection';
  isOpen: boolean;
  onToggle: () => void;
}

export default function AIChatWidget({ context, isOpen, onToggle }: AIChatWidgetProps) {
  const [message, setMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Initialize with context-specific welcome message
  useEffect(() => {
    const contextMessages = {
      installation: "Hi! I'm here to help with your solar panel installation planning. Ask me about optimal placement, system sizing, roof requirements, or any installation questions!",
      'fault-detection': "Hello! I can help you with solar panel fault detection and troubleshooting. Ask me about identifying defects, performance issues, or maintenance recommendations!"
    };

    setMessages([{
      id: 1,
      message: contextMessages[context],
      sender: 'ai',
      timestamp: new Date(),
      category: context
    }]);
  }, [context]);

  const aiChatMutation = useMutation({
    mutationFn: async (userMessage: string) => {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: userMessage }),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return response.json();
    },
    onSuccess: (response) => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        message: response.response,
        sender: 'ai',
        timestamp: new Date(),
        category: response.category || 'general'
      }]);
      scrollToBottom();
    },
    onError: () => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        message: "I'm having trouble right now. Please try again in a moment.",
        sender: 'ai',
        timestamp: new Date(),
        category: 'error'
      }]);
      scrollToBottom();
    }
  });

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      const userMessage = {
        id: Date.now(),
        message: message.trim(),
        sender: 'user' as const,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage]);
      aiChatMutation.mutate(`${context === 'installation' ? 'Installation planning: ' : 'Fault detection: '}${message.trim()}`);
      setMessage('');
      scrollToBottom();
    }
  };

  const getContextColor = () => {
    return context === 'installation' ? 'text-blue-600' : 'text-red-600';
  };

  const getContextBg = () => {
    return context === 'installation' ? 'bg-blue-50 dark:bg-blue-900/20' : 'bg-red-50 dark:bg-red-900/20';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className={`w-96 ${isMinimized ? 'h-16' : 'h-96'} flex flex-col shadow-lg border-2`}>
        <CardHeader className={`pb-2 ${getContextBg()} border-b`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bot className={`h-5 w-5 ${getContextColor()}`} />
              <CardTitle className="text-sm font-medium">
                AI Assistant - {context === 'installation' ? 'Installation' : 'Fault Detection'}
              </CardTitle>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMinimized(!isMinimized)}
                className="h-6 w-6 p-0"
              >
                {isMinimized ? <Maximize2 className="h-3 w-3" /> : <Minimize2 className="h-3 w-3" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {!isMinimized && (
          <CardContent className="flex-1 flex flex-col p-0">
            {/* Messages Area */}
            <ScrollArea className="flex-1 px-3 py-2" ref={scrollRef}>
              <div className="space-y-3">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.sender === 'ai' && (
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-xs">
                          <Bot className="h-3 w-3 text-purple-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[80%] p-2 rounded-lg text-sm ${
                      msg.sender === 'ai' 
                        ? 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100' 
                        : 'bg-purple-600 text-white'
                    }`}>
                      <p className="leading-relaxed">{msg.message}</p>
                      <span className="text-xs opacity-70 mt-1 block">
                        {format(msg.timestamp, 'HH:mm')}
                      </span>
                    </div>
                    {msg.sender === 'user' && (
                      <Avatar className="h-6 w-6 shrink-0">
                        <AvatarFallback className="text-xs">
                          <User className="h-3 w-3 text-blue-600" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                ))}
                
                {aiChatMutation.isPending && (
                  <div className="flex items-start gap-2">
                    <Avatar className="h-6 w-6 shrink-0">
                      <AvatarFallback className="text-xs">
                        <Bot className="h-3 w-3 text-purple-600" />
                      </AvatarFallback>
                    </Avatar>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2 rounded-lg">
                      <div className="flex items-center gap-2 text-sm">
                        <div className="animate-bounce w-1 h-1 bg-purple-500 rounded-full"></div>
                        <div className="animate-bounce w-1 h-1 bg-purple-500 rounded-full" style={{ animationDelay: '0.1s' }}></div>
                        <div className="animate-bounce w-1 h-1 bg-purple-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                        <span className="text-xs text-gray-500">Thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Message Input */}
            <div className="p-3 border-t">
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <Input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={`Ask about ${context === 'installation' ? 'installation' : 'fault detection'}...`}
                  className="flex-1 text-sm"
                  disabled={aiChatMutation.isPending}
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={!message.trim() || aiChatMutation.isPending}
                  className="px-3"
                >
                  <Send className="h-3 w-3" />
                </Button>
              </form>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}