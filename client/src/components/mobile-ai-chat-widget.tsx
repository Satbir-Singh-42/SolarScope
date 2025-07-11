import { useState, useRef, useEffect } from 'react';
import { Bot, Send, X, Minimize2, Mic, MicOff, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import robotIcon from '/assets/robot-chat-bot-concept-illustration-vector_1752050227392.jpg';

interface ChatMessage {
  id: number;
  message: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatOpen') === 'true';
    }
    return false;
  });
  const [isMinimized, setIsMinimized] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('chatMinimized') === 'true';
    }
    return false;
  });
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('chatMessages');
      if (saved) {
        try {
          return JSON.parse(saved).map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
        } catch (e) {
          console.error('Error parsing saved messages:', e);
        }
      }
    }
    return [
      {
        id: 1,
        message: "Hello! I'm your AI assistant. How can I help you with solar panel analysis today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ];
  });
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);
  const [typingMessageId, setTypingMessageId] = useState<number | null>(null);
  const [displayedText, setDisplayedText] = useState<{ [key: number]: string }>({});
  const [isTyping, setIsTyping] = useState(false);
  const [copiedMessageId, setCopiedMessageId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const widgetRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Save chat state to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('chatOpen', isOpen.toString());
  }, [isOpen]);

  useEffect(() => {
    localStorage.setItem('chatMinimized', isMinimized.toString());
  }, [isMinimized]);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = false;
      recognitionInstance.interimResults = false;
      recognitionInstance.lang = 'en-US';

      recognitionInstance.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
      };

      recognitionInstance.onerror = () => {
        setIsListening(false);
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  // Handle click outside to close (but not when minimized)
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (widgetRef.current && !widgetRef.current.contains(event.target as Node) && !isMinimized) {
        setIsOpen(false);
        setIsMinimized(false);
      }
    };

    if (isOpen && !isMinimized) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, isMinimized]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Typing animation effect
  const startTypingAnimation = (messageId: number, fullText: string) => {
    setTypingMessageId(messageId);
    setIsTyping(true);
    setDisplayedText(prev => ({ ...prev, [messageId]: '' }));
    
    let index = 0;
    const typeNextCharacter = () => {
      if (index < fullText.length) {
        setDisplayedText(prev => ({
          ...prev,
          [messageId]: fullText.substring(0, index + 1)
        }));
        index++;
        typingTimeoutRef.current = setTimeout(typeNextCharacter, 20); // Fast typing
      } else {
        setTypingMessageId(null);
        setIsTyping(false);
      }
    };
    
    typeNextCharacter();
  };

  const copyToClipboard = (text: string, messageId: number) => {
    // Remove markdown formatting for cleaner copy
    const cleanText = text.replace(/\*\*(.*?)\*\*/g, '$1') // Bold
                         .replace(/\*(.*?)\*/g, '$1')     // Italic
                         .replace(/`(.*?)`/g, '$1')       // Inline code
                         .replace(/^#+\s/gm, '')         // Headers
                         .replace(/^\-\s/gm, '• ');      // List items
    
    navigator.clipboard.writeText(cleanText).then(() => {
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = cleanText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedMessageId(messageId);
      setTimeout(() => setCopiedMessageId(null), 2000);
    });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: ChatMessage = {
      id: messages.length + 1,
      message: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: inputValue }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Handle both JSON responses and error responses
      let aiResponseText = "";
      if (data.error) {
        if (data.error.includes('503') || data.error.includes('overloaded') || data.error.includes('UNAVAILABLE')) {
          aiResponseText = "I'm currently experiencing high demand. Please wait a moment and try again. The AI service is temporarily overloaded.";
        } else {
          aiResponseText = `I apologize, but I'm experiencing some technical difficulties: ${data.error}`;
        }
      } else if (typeof data === 'string') {
        try {
          const jsonData = JSON.parse(data);
          aiResponseText = jsonData.response || data;
        } catch {
          aiResponseText = data;
        }
      } else {
        aiResponseText = data.response || data.message || "I'm sorry, I couldn't process your request right now.";
      }
      
      const aiMessage: ChatMessage = {
        id: messages.length + 2,
        message: aiResponseText,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      
      // Start typing animation for AI response
      startTypingAnimation(aiMessage.id, aiResponseText);
    } catch (error) {
      console.error('AI Chat error:', error);
      let errorText = "I'm experiencing connection issues. Please check your internet connection and try again.";
      
      if (error instanceof Error) {
        if (error.message.includes('503') || error.message.includes('overloaded')) {
          errorText = "The AI service is currently experiencing high demand. Please wait a few minutes and try again.";
        } else if (error.message.includes('timeout')) {
          errorText = "The request timed out. Please try again with a shorter message.";
        } else if (error.message.includes('network')) {
          errorText = "Network connection failed. Please check your internet connection and try again.";
        }
      }
      
      const errorMessage: ChatMessage = {
        id: messages.length + 2,
        message: errorText,
        sender: 'ai',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    // Clear chat data when user explicitly closes the chat
    localStorage.removeItem('chatMessages');
    localStorage.removeItem('chatOpen');
    localStorage.removeItem('chatMinimized');
    // Reset to initial state
    setMessages([
      {
        id: 1,
        message: "Hello! I'm your AI assistant. How can I help you with solar panel analysis today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    setIsMinimized(false);
  };

  const startNewConversation = () => {
    // Clear chat data
    localStorage.removeItem('chatMessages');
    
    // Reset to initial state without showing quick start
    setMessages([
      {
        id: 1,
        message: "Hello! I'm your AI assistant. How can I help you with solar panel analysis today?",
        sender: 'ai',
        timestamp: new Date()
      }
    ]);
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleListening = () => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-[9999]">
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-full shadow-lg transition-all duration-300 border-2 border-white cursor-pointer hover:scale-105"
          aria-label="Open AI Chat"
        >
          <img 
            src={robotIcon} 
            alt="AI Robot" 
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-full object-cover"
          />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-[9999]" ref={widgetRef}>
      <Card className={`w-[calc(100vw-2rem)] max-w-sm md:max-w-md lg:max-w-lg transition-all duration-300 ${isMinimized ? 'h-12' : 'h-[70vh] max-h-96 md:max-h-[500px]'} shadow-xl`}>
        <CardHeader className="flex flex-row items-center justify-between p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
          <CardTitle className="text-sm sm:text-base font-medium flex items-center">
            <img 
              src={robotIcon} 
              alt="AI Robot" 
              className="w-5 h-5 sm:w-6 sm:h-6 rounded-full object-cover mr-2"
            />
            AI Assistant
          </CardTitle>
          <div className="flex items-center gap-3 sm:gap-4">
            {/* New Conversation Button - Always show when chat is open */}
            <Button
              variant="ghost"
              size="sm"
              onClick={startNewConversation}
              className="h-7 w-auto px-2 sm:h-8 sm:px-3 hover:bg-white/20 text-xs rounded-md"
              title="Start new conversation"
            >
              <span className="text-[10px] sm:text-xs font-medium">New Chat</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-white/20"
            >
              <Minimize2 className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-6 w-6 sm:h-7 sm:w-7 p-0 hover:bg-white/20"
            >
              <X className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        </CardHeader>
        
        {!isMinimized && (
          <CardContent className="p-0 flex flex-col h-[calc(100%-3rem)]">
            <ScrollArea className="flex-1 p-3 sm:p-4">
              <div className="space-y-3 sm:space-y-4">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] ${msg.sender === 'user' ? 'ml-auto' : 'mr-auto'}`}>
                      <div
                        className={`px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base ${
                          msg.sender === 'user'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {msg.sender === 'ai' ? (
                          <div>
                            <ReactMarkdown 
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                                ul: ({ children }) => <ul className="mb-2 last:mb-0 ml-4 list-disc">{children}</ul>,
                                ol: ({ children }) => <ol className="mb-2 last:mb-0 ml-4 list-decimal">{children}</ol>,
                                li: ({ children }) => <li className="mb-1">{children}</li>,
                                strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                                em: ({ children }) => <em className="italic">{children}</em>,
                                code: ({ children, className }) => {
                                  const isInline = !className?.includes('language-');
                                  return isInline ? (
                                    <code className="bg-gray-200 px-1 py-0.5 rounded text-xs font-mono">
                                      {children}
                                    </code>
                                  ) : (
                                    <pre className="bg-gray-200 p-2 rounded text-xs font-mono overflow-x-auto mb-2">
                                      <code>{children}</code>
                                    </pre>
                                  );
                                },
                                blockquote: ({ children }) => (
                                  <blockquote className="border-l-4 border-purple-500 pl-3 italic mb-2">
                                    {children}
                                  </blockquote>
                                ),
                                hr: () => <hr className="my-2 border-gray-300" />
                              }}
                            >
                              {typingMessageId === msg.id ? displayedText[msg.id] || '' : msg.message}
                            </ReactMarkdown>
                            {typingMessageId === msg.id && (
                              <span className="inline-block w-2 h-4 bg-purple-500 animate-pulse ml-1 rounded-sm"></span>
                            )}
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.message}</div>
                        )}
                      </div>
                      
                      {/* Copy button for AI messages (positioned at right lower corner) */}
                      {msg.sender === 'ai' && typingMessageId !== msg.id && (
                        <div className="flex justify-end mt-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(msg.message, msg.id)}
                            className="h-6 w-6 p-0 hover:bg-gray-200 opacity-70 hover:opacity-100 transition-opacity rounded-md"
                            title={copiedMessageId === msg.id ? "Copied!" : "Copy message"}
                          >
                            <Copy className={`h-3 w-3 ${copiedMessageId === msg.id ? 'text-green-600' : 'text-gray-600'}`} />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-800 px-3 py-2 sm:px-4 sm:py-3 rounded-lg text-sm sm:text-base">
                      <div className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <div className="p-3 sm:p-4 border-t bg-gray-50">
              <div className="flex items-center gap-3 sm:gap-4">
                <Input
                  type="text"
                  placeholder={isListening ? "Listening..." : "Ask about solar panels..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 text-sm sm:text-base h-9 sm:h-10"
                  disabled={isLoading || isListening}
                />
                {recognition && (
                  <Button
                    size="sm"
                    onClick={toggleListening}
                    disabled={isLoading}
                    className={`h-9 w-9 sm:h-10 sm:w-10 p-0 ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-gray-500 hover:bg-gray-600'}`}
                  >
                    {isListening ? <MicOff className="h-3 w-3 sm:h-4 sm:w-4" /> : <Mic className="h-3 w-3 sm:h-4 sm:w-4" />}
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading || isListening}
                  className="bg-purple-600 hover:bg-purple-700 h-9 w-9 sm:h-10 sm:w-10 p-0"
                >
                  <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}