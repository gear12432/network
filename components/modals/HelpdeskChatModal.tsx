'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Send,
  Image as ImageIcon,
  Trash2,
  Headphones,
  ShieldCheck,
  CheckCheck,
} from 'lucide-react';
import { UserStats } from '@/types/investment';
import {
  SupportChatMessage,
  saveChatMessageToFirestore,
  deleteChatMessageFromFirestore,
  getAllChatMessagesFromFirestore,
  db,
} from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface HelpdeskChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  userStats: UserStats;
}

export default function HelpdeskChatModal({
  isOpen,
  onClose,
  userStats,
}: HelpdeskChatModalProps) {
  const [messages, setMessages] = useState<SupportChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initial welcome message fallback if chat is empty
  const defaultWelcomeMessage: SupportChatMessage = {
    id: 'welcome-msg',
    sender: 'admin',
    senderName: 'VIP Helpdesk Support',
    text: `Hello ${userStats.userName || 'Valued Partner'}, welcome to 24/7 VIP Helpdesk! How can we assist you with your investments, withdrawals, or account today?`,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now() - 60000,
  };

  // 1. Fetch & Subscribe to Firestore Chat Messages in Real-Time
  useEffect(() => {
    if (!isOpen) return;

    // Load initial from Firestore or LocalStorage
    let isMounted = true;

    getAllChatMessagesFromFirestore().then((initialMsgs) => {
      if (isMounted) {
        if (initialMsgs.length > 0) {
          setMessages(initialMsgs);
        } else {
          setMessages([defaultWelcomeMessage]);
        }
      }
    });

    // Real-time listener on support_chats collection
    let unsubscribe: () => void = () => {};
    try {
      const chatsRef = collection(db, 'support_chats');
      unsubscribe = onSnapshot(
        chatsRef,
        (snapshot) => {
          if (!isMounted) return;
          const liveMsgs: SupportChatMessage[] = [];
          snapshot.forEach((docSnap) => {
            liveMsgs.push(docSnap.data() as SupportChatMessage);
          });
          if (liveMsgs.length > 0) {
            liveMsgs.sort((a, b) => a.createdAt - b.createdAt);
            setMessages(liveMsgs);
          }
        },
        (err) => {
          console.warn('Realtime chat snapshot warning:', err.message);
        }
      );
    } catch {
      // fallback
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [isOpen, userStats.userName]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Image File Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Message Handler
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!inputText.trim() && !selectedImage) return;

    setIsUploading(true);
    const newMsg: SupportChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      senderName: userStats.userName || 'User',
      senderUid: userStats.loginUid || 'GK35648',
      text: inputText.trim() || undefined,
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
    };

    // Optimistically update UI
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsUploading(false);

    // Save to Firestore
    await saveChatMessageToFirestore(newMsg);
  };

  // Delete User Message Handler (User can ONLY delete their own messages)
  const handleDeleteMessage = async (msgId: string, sender: 'user' | 'admin') => {
    if (sender !== 'user') {
      alert('You cannot delete admin messages.');
      return;
    }

    if (confirm('Are you sure you want to delete this message?')) {
      setMessages((prev) => prev.filter((m) => m.id !== msgId));
      await deleteChatMessageFromFirestore(msgId);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg h-[88vh] max-h-[680px] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-3.5 sm:p-4 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between shrink-0 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20">
              <Headphones className="w-5 h-5 text-amber-200 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">24/7 VIP Helpdesk</h3>
                <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-200 px-2 py-0.5 rounded-full font-medium border border-emerald-400/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Online
                </span>
              </div>
              <p className="text-[11px] text-amber-100/90 font-mono mt-0.5">
                UID: {userStats.loginUid || 'GK35648'} • {userStats.userName}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition-colors cursor-pointer"
            title="Close Chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Security Info Ribbon */}
        <div className="bg-amber-50 dark:bg-slate-800/80 px-3.5 py-1.5 border-b border-amber-200/60 dark:border-slate-700 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="font-medium">256-Bit Encrypted VIP Support Channel</span>
          </div>
          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Fast Response</span>
        </div>

        {/* Chat Body (Messages List) */}
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-3.5 bg-slate-50 dark:bg-slate-950">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
              >
                {/* Sender Name */}
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mb-1 px-1">
                  {msg.senderName} • {msg.timestamp}
                </span>

                {/* Message Box Container */}
                <div className="relative max-w-[82%] sm:max-w-[75%] flex items-center gap-1.5">
                  {/* Delete button (Visible ONLY for User's own messages) */}
                  {isUser && (
                    <button
                      onClick={() => handleDeleteMessage(msg.id, msg.sender)}
                      className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-rose-100 text-rose-600 transition-opacity cursor-pointer shrink-0"
                      title="Delete your message"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div
                    className={`p-3 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed space-y-2 ${
                      isUser
                        ? 'bg-amber-500 text-amber-950 font-medium rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-none'
                    }`}
                  >
                    {/* Attached Image if any */}
                    {msg.imageUrl && (
                      <div className="rounded-xl overflow-hidden max-w-full shadow-2xs border border-black/10">
                        <img
                          src={msg.imageUrl}
                          alt="Attachment"
                          className="max-h-52 w-full object-cover"
                        />
                      </div>
                    )}

                    {/* Text Message if any */}
                    {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}

                    {/* Read Receipts */}
                    <div
                      className={`text-[9.5px] text-right flex items-center justify-end gap-1 ${
                        isUser ? 'text-amber-900/80' : 'text-slate-400'
                      }`}
                    >
                      <CheckCheck className="w-3 h-3 stroke-[2.5]" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Selected Image Thumbnail Preview Bar */}
        {selectedImage && (
          <div className="p-2 bg-amber-50 dark:bg-slate-800 border-t border-amber-200 dark:border-slate-700 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <img
                src={selectedImage}
                alt="Selected preview"
                className="w-10 h-10 object-cover rounded-lg border border-amber-300"
              />
              <span className="text-xs text-amber-900 dark:text-amber-200 font-medium">
                Image attached ready to send
              </span>
            </div>
            <button
              onClick={() => setSelectedImage(null)}
              className="p-1 rounded-full hover:bg-amber-200 text-amber-900 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Hidden File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
        />

        {/* Footer Input Bar */}
        <form
          onSubmit={handleSendMessage}
          className="p-2.5 sm:p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0"
        >
          {/* Attach Image Button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer shrink-0"
            title="Attach Image"
          >
            <ImageIcon className="w-5 h-5 stroke-[2.2]" />
          </button>

          {/* Message Input */}
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/40 transition-all"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={(!inputText.trim() && !selectedImage) || isUploading}
            className="p-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-amber-950 font-bold shadow-md transition-all cursor-pointer shrink-0 active:scale-95 flex items-center justify-center"
            title="Send Message"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
          </button>
        </form>
      </div>
    </div>
  );
}
