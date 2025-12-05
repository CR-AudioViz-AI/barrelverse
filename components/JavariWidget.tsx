'use client';

/**
 * JAVARI AI ASSISTANT WIDGET
 * ==========================
 * Embedded on every page for instant help
 * 
 * Features:
 * - Floating chat widget
 * - Context-aware assistance
 * - Quick actions
 * - Ticket creation
 * - Feature suggestions
 * - Knowledge base search
 * 
 * Built by Claude + Roy Henderson
 * CR AudioViz AI, LLC - BarrelVerse
 * 2025-12-04
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, X, Send, HelpCircle, Bug, Lightbulb, 
  Search, ChevronDown, ExternalLink, Sparkles, Bot
} from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: QuickAction[];
}

interface QuickAction {
  label: string;
  action: string;
  icon?: string;
}

interface JavariWidgetProps {
  pageContext?: string;
  userId?: string;
  userTier?: string;
}

export default function JavariWidget({ pageContext, userId, userTier }: JavariWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Quick actions based on context
  const quickActions: QuickAction[] = [
    { label: 'How do I add a bottle?', action: 'how_to_add_bottle', icon: '🥃' },
    { label: 'Report a problem', action: 'report_problem', icon: '🐛' },
    { label: 'Suggest a feature', action: 'suggest_feature', icon: '💡' },
    { label: 'Search help articles', action: 'search_help', icon: '📚' },
    { label: 'Contact support', action: 'contact_support', icon: '💬' },
  ];

  // Initialize with welcome message
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = getContextualGreeting(pageContext, userTier);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: greeting,
        timestamp: new Date(),
        actions: quickActions.slice(0, 3)
      }]);
    }
  }, [pageContext, userTier]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getContextualGreeting(context?: string, tier?: string): string {
    const name = tier === 'master' ? 'Master Distiller' : tier === 'premium' ? 'Connoisseur' : 'Collector';
    
    const greetings: Record<string, string> = {
      'collection': `Hey ${name}! 👋 Need help managing your collection? I can help you add bottles, organize shelves, or track values.`,
      'trivia': `Ready to test your spirits knowledge? 🧠 I'm here if you need hints or want to learn more about any topic!`,
      'museum': `Welcome to the Spirits Museum! 🏛️ Ask me about any exhibit, historical period, or artifact.`,
      'marketplace': `Looking to buy or sell? 💰 I can help you list items, find deals, or understand pricing.`,
      'pricing': `Thinking about upgrading? 🌟 I can explain the benefits of each tier and help you choose.`,
      'default': `Hey there! 👋 I'm Javari, your spirits guide. How can I help you today?`
    };

    return greetings[context || 'default'] || greetings['default'];
  }

  async function handleSend() {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);
    setShowQuickActions(false);

    try {
      const response = await fetch('/api/javari/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: pageContext,
          userId,
          history: messages.slice(-10) // Last 10 messages for context
        })
      });

      const data = await response.json();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        actions: data.actions
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting. Please try again or contact support.",
        timestamp: new Date()
      }]);
    } finally {
      setIsTyping(false);
    }
  }

  async function handleQuickAction(action: string) {
    setShowQuickActions(false);

    switch (action) {
      case 'report_problem':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I'm sorry you're having trouble! 😟 Please describe the issue and I'll create a ticket immediately. Include:\n\n• What you were trying to do\n• What happened instead\n• Any error messages you saw",
          timestamp: new Date()
        }]);
        break;

      case 'suggest_feature':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "Love hearing ideas! 💡 Tell me about the feature you'd like to see. Be as detailed as possible - what would it do and why would it help you?",
          timestamp: new Date()
        }]);
        break;

      case 'search_help':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "What do you need help with? I'll search our knowledge base and find the best articles for you. 📚",
          timestamp: new Date()
        }]);
        break;

      case 'contact_support':
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: "I can help with most things! But if you need human support, I can create a ticket that our team will respond to within 24 hours. What's your question?",
          timestamp: new Date()
        }]);
        break;

      default:
        // Handle as a regular question
        setInput(action.replace(/_/g, ' '));
        handleSend();
    }
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  // Pulse animation for unread
  const pulseClass = unreadCount > 0 ? 'animate-pulse' : '';

  if (!isOpen) {
    return (
      <button
        onClick={() => { setIsOpen(true); setUnreadCount(0); }}
        className={`fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-amber-500 to-amber-600 
          rounded-full shadow-lg hover:shadow-xl transition-all duration-300 
          flex items-center justify-center group z-50 ${pulseClass}`}
      >
        <Bot className="w-8 h-8 text-white group-hover:scale-110 transition-transform" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 rounded-full 
            text-white text-xs flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
        <span className="absolute -top-12 right-0 bg-stone-900 text-white text-sm px-3 py-1 
          rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Ask Javari ✨
        </span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-6 right-6 w-96 bg-stone-900 rounded-2xl shadow-2xl 
      border border-stone-700 overflow-hidden z-50 flex flex-col
      ${isMinimized ? 'h-16' : 'h-[500px]'} transition-all duration-300`}>
      
      {/* Header */}
      <div 
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r 
          from-amber-600 to-amber-700 cursor-pointer"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Javari</h3>
            <p className="text-xs text-amber-100">Your AI Spirits Guide</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); setIsMinimized(!isMinimized); }}
            className="p-1 hover:bg-white/10 rounded"
          >
            <ChevronDown className={`w-5 h-5 text-white transition-transform 
              ${isMinimized ? 'rotate-180' : ''}`} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
            className="p-1 hover:bg-white/10 rounded"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-amber-600 text-white rounded-br-sm'
                      : 'bg-stone-800 text-stone-100 rounded-bl-sm'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Quick action buttons */}
                  {message.actions && message.actions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {message.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleQuickAction(action.action)}
                          className="text-xs bg-stone-700 hover:bg-stone-600 
                            px-3 py-1.5 rounded-full transition-colors flex items-center gap-1"
                        >
                          {action.icon && <span>{action.icon}</span>}
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-stone-800 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" 
                      style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" 
                      style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" 
                      style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="px-4 py-2 border-t border-stone-700">
              <p className="text-xs text-stone-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-2">
                {quickActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickAction(action.action)}
                    className="text-xs bg-stone-800 hover:bg-stone-700 
                      px-3 py-1.5 rounded-full text-stone-300 transition-colors
                      flex items-center gap-1"
                  >
                    <span>{action.icon}</span>
                    {action.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-stone-700">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 bg-stone-800 border border-stone-600 rounded-lg px-4 py-2 
                  text-white placeholder-stone-500 focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-amber-600 hover:bg-amber-500 disabled:bg-stone-700 
                  disabled:cursor-not-allowed p-2 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5 text-white" />
              </button>
            </div>
            <p className="text-xs text-stone-500 mt-2 text-center">
              Powered by Javari AI • <a href="/help" className="text-amber-500 hover:underline">Help Center</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// ============================================
// HELP CENTER LINK COMPONENT
// ============================================

interface HelpLinkProps {
  articleId?: string;
  topic?: string;
  children?: React.ReactNode;
  className?: string;
}

export function HelpLink({ articleId, topic, children, className }: HelpLinkProps) {
  const href = articleId 
    ? `/help/article/${articleId}` 
    : `/help/search?q=${encodeURIComponent(topic || '')}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1 text-amber-500 hover:text-amber-400 
        hover:underline text-sm ${className}`}
    >
      <HelpCircle className="w-4 h-4" />
      {children || 'Need help?'}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

// ============================================
// INLINE HELP TOOLTIP
// ============================================

interface HelpTooltipProps {
  content: string;
  articleId?: string;
  children: React.ReactNode;
}

export function HelpTooltip({ content, articleId, children }: HelpTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="inline-flex items-center gap-1 cursor-help"
      >
        {children}
        <HelpCircle className="w-4 h-4 text-stone-500" />
      </div>

      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 -translate-x-1/2 mb-2 
          w-64 bg-stone-800 border border-stone-600 rounded-lg p-3 shadow-xl">
          <p className="text-sm text-stone-300">{content}</p>
          {articleId && (
            <a
              href={`/help/article/${articleId}`}
              className="text-xs text-amber-500 hover:underline mt-2 inline-block"
            >
              Learn more →
            </a>
          )}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 
            w-3 h-3 bg-stone-800 border-r border-b border-stone-600 rotate-45" />
        </div>
      )}
    </div>
  );
}

// ============================================
// FEEDBACK BUTTON
// ============================================

interface FeedbackButtonProps {
  context: string;
  className?: string;
}

export function FeedbackButton({ context, className }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<'bug' | 'feature' | 'feedback'>('feedback');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!message.trim()) return;

    try {
      await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: feedbackType,
          message,
          context,
          url: window.location.href
        })
      });

      setSubmitted(true);
      setTimeout(() => {
        setIsOpen(false);
        setSubmitted(false);
        setMessage('');
      }, 2000);
    } catch (error) {
      console.error('Feedback error:', error);
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={`flex items-center gap-2 text-sm text-stone-400 hover:text-amber-500 
          transition-colors ${className}`}
      >
        <MessageCircle className="w-4 h-4" />
        Feedback
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-stone-900 rounded-xl border border-stone-700 w-full max-w-md p-6">
            {submitted ? (
              <div className="text-center py-8">
                <div className="text-4xl mb-4">🎉</div>
                <h3 className="text-xl font-bold text-white mb-2">Thank you!</h3>
                <p className="text-stone-400">Your feedback helps us improve.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold text-white">Send Feedback</h3>
                  <button onClick={() => setIsOpen(false)}>
                    <X className="w-5 h-5 text-stone-400" />
                  </button>
                </div>

                <div className="flex gap-2 mb-4">
                  {(['bug', 'feature', 'feedback'] as const).map((type) => (
                    <button
                      key={type}
                      onClick={() => setFeedbackType(type)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm 
                        transition-colors ${
                          feedbackType === type
                            ? 'bg-amber-600 text-white'
                            : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                        }`}
                    >
                      {type === 'bug' && <Bug className="w-4 h-4" />}
                      {type === 'feature' && <Lightbulb className="w-4 h-4" />}
                      {type === 'feedback' && <MessageCircle className="w-4 h-4" />}
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </button>
                  ))}
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={
                    feedbackType === 'bug' 
                      ? 'Describe the problem...' 
                      : feedbackType === 'feature'
                      ? 'Describe your idea...'
                      : 'Share your thoughts...'
                  }
                  className="w-full h-32 bg-stone-800 border border-stone-600 rounded-lg 
                    px-4 py-3 text-white placeholder-stone-500 resize-none 
                    focus:outline-none focus:border-amber-500"
                />

                <button
                  onClick={handleSubmit}
                  disabled={!message.trim()}
                  className="w-full mt-4 bg-amber-600 hover:bg-amber-500 
                    disabled:bg-stone-700 disabled:cursor-not-allowed
                    text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Send Feedback
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
