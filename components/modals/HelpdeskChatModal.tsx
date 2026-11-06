'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft,
  X,
  Send,
  Image as ImageIcon,
  Trash2,
  Headphones,
  ShieldCheck,
  CheckCheck,
  Sparkles,
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
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const myUid = userStats.loginUid || 'GK35648';

  // Initial welcome message fallback if chat is empty
  const defaultWelcomeMessage: SupportChatMessage = {
    id: 'welcome-msg',
    sender: 'admin',
    senderName: 'VIP Helpdesk Support',
    userUid: myUid,
    text: `Hello ${userStats.userName || 'Valued Partner'}, welcome to 24/7 VIP Helpdesk! How can we assist you with your investments, withdrawals, or account today?`,
    timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    createdAt: Date.now() - 60000,
  };

  // 1. Fetch & Subscribe to Firestore Chat Messages in Real-Time
  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;

    // Filter helper: show welcome message or messages matching current user's UID
    const filterForUser = (allMsgs: SupportChatMessage[]) => {
      const userList = allMsgs.filter(
        (m) =>
          m.id === 'welcome-msg' ||
          m.userUid === myUid ||
          m.senderUid === myUid ||
          (m.sender === 'user' && m.senderUid === myUid)
      );
      if (userList.length === 0) {
        return [defaultWelcomeMessage];
      }
      return userList.sort((a, b) => a.createdAt - b.createdAt);
    };

    getAllChatMessagesFromFirestore().then((initialMsgs) => {
      if (isMounted) {
        const filtered = filterForUser(initialMsgs);
        setMessages(filtered);
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
          const filtered = filterForUser(liveMsgs);
          setMessages(filtered);
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
  }, [isOpen, myUid, userStats.userName]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Image File Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be under 5MB');
        return;
      }
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
      senderUid: myUid,
      userUid: myUid,
      userName: userStats.userName || 'User',
      userMobile: userStats.mobile || '',
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
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* 1. Full-Width Top Header */}
      <div className="w-full px-4 py-3 sm:py-3.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            className="p-2 -ml-1 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-white transition-all cursor-pointer flex items-center justify-center"
            title="Back to App"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/20 shadow-xs">
            <Headphones className="w-5 h-5 text-amber-200 stroke-[2.5]" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base leading-tight">24/7 VIP Helpdesk</h3>
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-500/25 text-emerald-100 px-2 py-0.5 rounded-full font-bold border border-emerald-400/40">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Online
              </span>
            </div>
            <p className="text-[11px] text-amber-100/90 font-mono mt-0.5">
              UID: {myUid} • {userStats.userName}
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-2 rounded-xl bg-black/20 hover:bg-black/30 active:scale-95 text-white transition-all cursor-pointer"
          title="Close Chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Security / VIP Status Ribbon */}
      <div className="w-full bg-amber-50 dark:bg-slate-900 px-4 py-2 border-b border-amber-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-bold">256-Bit Encrypted VIP Support Channel</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
          <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
          Fast Response
        </span>
      </div>

      {/* 3. Full-Screen Chat Viewport (Messages List) */}
      <div className="flex-1 w-full p-4 sm:p-5 overflow-y-auto space-y-3.5 bg-[#f4f7f9] dark:bg-slate-950">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group`}
            >
              {/* Sender Name & Timestamp */}
              <span className="text-[10.5px] font-bold text-slate-500 dark:text-slate-400 mb-1 px-1">
                {msg.senderName} • {msg.timestamp}
              </span>

              {/* Message Box Container */}
              <div className="relative max-w-[85%] sm:max-w-[70%] flex items-center gap-1.5">
                {/* Delete button (Visible ONLY for User's own messages) */}
                {isUser && (
                  <button
                    onClick={() => handleDeleteMessage(msg.id, msg.sender)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-full hover:bg-rose-100 dark:hover:bg-rose-950 text-rose-600 transition-opacity cursor-pointer shrink-0"
                    title="Delete your message"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}

                <div
                  className={`p-3.5 rounded-2xl shadow-xs text-xs sm:text-sm leading-relaxed space-y-2.5 ${
                    isUser
                      ? 'bg-amber-500 text-amber-950 font-medium rounded-tr-none'
                      : 'bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-sm'
                  }`}
                >
                  {/* Attached Image if any */}
                  {msg.imageUrl && (
                    <div
                      className="rounded-xl overflow-hidden max-w-full shadow-2xs border border-black/10 cursor-pointer"
                      onClick={() => setPreviewImage(msg.imageUrl || null)}
                    >
                      <img
                        src={msg.imageUrl}
                        alt="Attachment"
                        className="max-h-64 w-full object-cover rounded-xl hover:opacity-95 transition-opacity"
                      />
                    </div>
                  )}

                  {/* Text Message if any */}
                  {msg.text && <p className="whitespace-pre-wrap break-words">{msg.text}</p>}

                  {/* Read Receipts */}
                  <div
                    className={`text-[9.5px] text-right flex items-center justify-end gap-1 font-mono ${
                      isUser ? 'text-amber-900/80 font-bold' : 'text-slate-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    <CheckCheck className="w-3 h-3 stroke-[2.5]" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* 4. Selected Image Thumbnail Preview Bar */}
      {selectedImage && (
        <div className="w-full px-4 py-2.5 bg-amber-50 dark:bg-slate-900 border-t border-amber-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={selectedImage}
              alt="Selected preview"
              className="w-12 h-12 object-cover rounded-xl border-2 border-amber-400 shadow-xs"
            />
            <div>
              <p className="text-xs text-amber-950 dark:text-amber-100 font-bold">
                Image attachment ready
              </p>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300">
                Tap send to upload to VIP Helpdesk
              </p>
            </div>
          </div>
          <button
            onClick={() => setSelectedImage(null)}
            className="p-1.5 rounded-full hover:bg-amber-200 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 5. Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* 6. Full-Width Footer Reply Bar */}
      <form
        onSubmit={handleSendMessage}
        className="w-full p-3 sm:p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2.5 shrink-0 shadow-lg"
      >
        {/* Attach Image Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 active:scale-95 transition-all cursor-pointer shrink-0"
          title="Attach Image"
        >
          <ImageIcon className="w-5 h-5 stroke-[2.2]" />
        </button>

        {/* Message Input */}
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your message to VIP support..."
          className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
        />

        {/* Send Button */}
        <button
          type="submit"
          disabled={(!inputText.trim() && !selectedImage) || isUploading}
          className="p-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-amber-950 font-extrabold shadow-md transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5"
          title="Send Message"
        >
          <Send className="w-5 h-5 stroke-[2.5]" />
          <span className="hidden sm:inline text-xs font-black">SEND</span>
        </button>
      </form>

      {/* Image Zoom Preview Modal */}
      {previewImage && (
        <div
          className="fixed inset-0 z-60 bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-3xl max-h-[90vh]">
            <img
              src={previewImage}
              alt="Zoomed Attachment"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute top-3 right-3 p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
