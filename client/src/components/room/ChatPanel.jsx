import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageSquare } from 'lucide-react';
import { useChat } from '../../context/ChatContext';
import { useAuth } from '../../context/AuthContext';

export default function ChatPanel() {
  const { messages, sendMessage } = useChat();
  const { currentUser } = useAuth();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(inputText);
    setInputText('');
  };

  const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="w-full bg-watchmate-surface border border-watchmate-border rounded-3xl p-4 sm:p-5 flex flex-col flex-1 min-h-[320px] max-h-[500px] shadow-card-subtle">
      {/* Chat Header */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-watchmate-border/60 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-watchmate-cyan" />
          <h3 className="font-display font-bold text-xs tracking-wider text-watchmate-text uppercase">
            Room Chat
          </h3>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs select-text">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-4 text-watchmate-muted">
            <MessageSquare className="w-6 h-6 mb-2 opacity-30 text-watchmate-cyan" />
            <p className="font-medium text-xs text-watchmate-text/80">No chat messages yet</p>
            <p className="text-[11px] text-watchmate-muted">Say something to the room...</p>
          </div>
        ) : (
          messages.map((msg) => {
            if (msg.type === 'system') {
              return (
                <div key={msg.id} className="text-center py-1 select-none">
                  <span className="inline-block px-3 py-0.5 rounded-full bg-watchmate-elevated border border-watchmate-border/60 text-[10px] text-watchmate-muted">
                    {msg.text}
                  </span>
                </div>
              );
            }

            const isMe = msg.senderId === currentUser?.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 items-start ${isMe ? 'flex-row-reverse' : ''}`}
              >
                {/* Avatar */}
                <div className="shrink-0 mt-0.5">
                  {msg.senderAvatar ? (
                    <img
                      src={msg.senderAvatar}
                      alt={msg.senderName}
                      className="w-6 h-6 rounded-full object-cover border border-watchmate-border"
                    />
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isMe
                          ? 'bg-watchmate-primary/30 text-watchmate-cyan border border-watchmate-cyan/40'
                          : 'bg-watchmate-elevated text-watchmate-text border border-watchmate-border'
                      }`}
                    >
                      {getInitials(msg.senderName)}
                    </div>
                  )}
                </div>

                {/* Message Bubble */}
                <div className={`max-w-[78%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className="text-[10px] font-semibold text-watchmate-text">
                      {isMe ? 'You' : msg.senderName}
                    </span>
                    <span className="text-[9px] text-watchmate-muted">
                      {formatMessageTime(msg.timestamp)}
                    </span>
                  </div>
                  <div
                    className={`px-3 py-2 rounded-2xl break-words leading-relaxed ${
                      isMe
                        ? 'btn-primary rounded-tr-sm shadow-md'
                        : 'bg-watchmate-elevated text-watchmate-text rounded-tl-sm border border-watchmate-border'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <form onSubmit={handleSend} className="mt-3 pt-2 border-t border-watchmate-border/60 shrink-0">
        <div className="relative flex items-center">
          <input
            type="text"
            placeholder="Say something to the room..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl bg-watchmate-elevated border border-watchmate-border focus:border-watchmate-cyan text-xs text-watchmate-text placeholder:text-watchmate-muted focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="btn-primary absolute right-1.5 p-1.5 rounded-xl text-white disabled:opacity-30 disabled:hover:scale-100 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>
    </div>
  );
}
