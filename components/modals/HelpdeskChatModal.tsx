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
  CheckCircle2,
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

  // Multi-Selection State for deleting user messages
  const [selectedMsgIds, setSelectedMsgIds] = useState<string[]>([]);
  const [isDeletingSelected, setIsDeletingSelected] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggered = useRef(false);

  const myUid = userStats.loginUid || 'GK35648';
  const isSelectionMode = selectedMsgIds.length > 0;

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

  // Scroll to bottom on new message if not selecting
  useEffect(() => {
    if (!isSelectionMode) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isSelectionMode]);

  // Focus input when modal opens (works for web and mobile)
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        textInputRef.current?.focus();
      }, 300);
    } else {
      setSelectedMsgIds([]);
    }
  }, [isOpen]);

  // Handle Image File Selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 8 * 1024 * 1024) {
        alert('File size must be under 8MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
        // Reset file input value so same file can be reselected if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  // Send Message Handler (Universal Web View & Mobile View execution)
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedText = inputText.trim();
    if (!trimmedText && !selectedImage) return;
    if (isUploading) return;

    setIsUploading(true);
    const newMsg: SupportChatMessage = {
      id: `chat-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      sender: 'user',
      senderName: userStats.userName || 'VIP Member',
      senderUid: myUid,
      userUid: myUid,
      userName: userStats.userName || 'VIP Member',
      userMobile: userStats.mobile || '',
      text: trimmedText || undefined,
      imageUrl: selectedImage || undefined,
      timestamp: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
      createdAt: Date.now(),
    };

    // Optimistically update UI immediately
    setMessages((prev) => [...prev, newMsg]);
    setInputText('');
    setSelectedImage(null);
    setIsUploading(false);

    // Save to Firestore
    await saveChatMessageToFirestore(newMsg);
  };

  // Long Press & Touch Selection Handlers for Mobile & Web
  const startLongPress = (msgId: string, isUser: boolean) => {
    if (!isUser) return;
    isLongPressTriggered.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggered.current = true;
      toggleSelectMessage(msgId);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate(50);
        } catch {
          // ignore
        }
      }
    }, 400);
  };

  const cancelLongPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleMessageClick = (msgId: string, isUser: boolean) => {
    // If long press just fired, don't trigger regular click
    if (isLongPressTriggered.current) {
      isLongPressTriggered.current = false;
      return;
    }

    // In selection mode, click toggles selection
    if (isSelectionMode && isUser) {
      toggleSelectMessage(msgId);
    }
  };

  const toggleSelectMessage = (msgId: string) => {
    setSelectedMsgIds((prev) =>
      prev.includes(msgId) ? prev.filter((id) => id !== msgId) : [...prev, msgId]
    );
  };

  // Delete All Selected Messages Handler
  const handleDeleteSelectedMessages = async () => {
    if (selectedMsgIds.length === 0) return;

    const count = selectedMsgIds.length;
    const confirmText =
      count === 1
        ? 'Delete this selected message?'
        : `Delete ${count} selected messages?`;

    if (!confirm(confirmText)) return;

    setIsDeletingSelected(true);
    const idsToDelete = [...selectedMsgIds];

    // Optimistically remove from state
    setMessages((prev) => prev.filter((m) => !idsToDelete.includes(m.id)));
    setSelectedMsgIds([]);

    // Delete each from Firestore
    for (const id of idsToDelete) {
      await deleteChatMessageFromFirestore(id);
    }
    setIsDeletingSelected(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 w-full h-full min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col overflow-hidden animate-in fade-in duration-200">
      {/* 1. Full-Width Top Header */}
      <div className="w-full px-3.5 sm:px-6 py-3 sm:py-3.5 bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white flex items-center justify-between shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <button
            type="button"
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
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl bg-black/20 hover:bg-black/30 active:scale-95 text-white transition-all cursor-pointer"
          title="Close Chat"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Security / VIP Status Ribbon */}
      <div className="w-full bg-amber-50 dark:bg-slate-900 px-3.5 sm:px-6 py-2 border-b border-amber-200/70 dark:border-slate-800 flex items-center justify-between text-[11px] text-amber-900 dark:text-amber-200 shrink-0">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span className="font-bold">256-Bit Encrypted VIP Support Channel</span>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 dark:text-amber-300">
          <Sparkles className="w-3 h-3 text-amber-500 animate-spin" />
          Fast Response
        </span>
      </div>

      {/* 3. Messages Viewport (Responsive for Mobile & Desktop Web View) */}
      <div className="flex-1 w-full overflow-y-auto px-3.5 sm:px-6 py-4 space-y-3.5 bg-[#f4f7f9] dark:bg-slate-950 flex flex-col items-center">
        <div className="w-full max-w-4xl space-y-3.5">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            const isSelected = selectedMsgIds.includes(msg.id);

            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} group select-none`}
              >
                {/* Sender Name & Timestamp */}
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1 px-1">
                  {msg.senderName} • {msg.timestamp}
                </span>

                {/* Message Bubble Container with Long-Press & Tap Handlers */}
                <div
                  onTouchStart={() => startLongPress(msg.id, isUser)}
                  onTouchEnd={cancelLongPress}
                  onTouchMove={cancelLongPress}
                  onMouseDown={() => startLongPress(msg.id, isUser)}
                  onMouseUp={cancelLongPress}
                  onMouseLeave={cancelLongPress}
                  onContextMenu={(e) => {
                    if (isUser) {
                      e.preventDefault();
                      toggleSelectMessage(msg.id);
                    }
                  }}
                  onClick={() => handleMessageClick(msg.id, isUser)}
                  className={`relative max-w-[88%] sm:max-w-[70%] transition-transform duration-150 ${
                    isUser ? 'cursor-pointer active:scale-[0.99]' : ''
                  }`}
                  title={isUser ? 'Long press to select & delete' : ''}
                >
                  {/* Selection Checkmark Badge */}
                  {isSelected && (
                    <div className="absolute -top-2 -left-2 z-20 bg-rose-600 text-white rounded-full p-0.5 shadow-md">
                      <CheckCircle2 className="w-5 h-5 fill-rose-600 text-white" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div
                    className={`rounded-2xl overflow-hidden shadow-sm transition-all ${
                      isSelected ? 'ring-3 ring-rose-500 shadow-md' : ''
                    } ${
                      isUser
                        ? 'bg-amber-600 dark:bg-amber-600 rounded-tr-none'
                        : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {/* Attached Image (No outer padding squishing the image) */}
                    {msg.imageUrl && (
                      <div
                        className="cursor-pointer overflow-hidden bg-black/5"
                        onClick={(e) => {
                          if (!isSelectionMode) {
                            e.stopPropagation();
                            setPreviewImage(msg.imageUrl || null);
                          }
                        }}
                      >
                        <img
                          src={msg.imageUrl}
                          alt="Attachment"
                          className="max-h-80 sm:max-h-96 w-full object-cover hover:opacity-95 transition-opacity"
                        />
                      </div>
                    )}

                    {/* Text Message: Bright White Font, Clear, Prominent, and Crisp */}
                    {msg.text && (
                      <div className="px-3.5 py-2">
                        <p
                          className={`whitespace-pre-wrap break-words leading-relaxed ${
                            isUser
                              ? 'text-white font-semibold text-sm sm:text-base tracking-wide drop-shadow-xs'
                              : 'text-slate-900 dark:text-slate-100 font-medium text-xs sm:text-sm'
                          }`}
                        >
                          {msg.text}
                        </p>
                      </div>
                    )}

                    {/* Footer Info: Timestamp & Checkmarks */}
                    <div
                      className={`px-3 py-1 flex items-center justify-end gap-1.5 font-mono text-[10.5px] ${
                        isUser ? 'text-white/90 font-bold' : 'text-slate-400'
                      }`}
                    >
                      <span>{msg.timestamp}</span>
                      <CheckCheck
                        className={`w-3.5 h-3.5 stroke-[2.5] ${
                          isUser ? 'text-white' : 'text-slate-400'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 4. Small Floating Action Box (Appears on Long-Press / Multi-Select) */}
      {selectedMsgIds.length > 0 && (
        <div className="fixed bottom-24 sm:bottom-28 left-1/2 -translate-x-1/2 z-50 bg-slate-900/95 text-white backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-2xl border border-white/20 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <span className="text-xs sm:text-sm font-bold text-slate-100 pr-1">
            {selectedMsgIds.length} {selectedMsgIds.length === 1 ? 'selected' : 'selected'}
          </span>

          {/* Delete Icon Button */}
          <button
            type="button"
            onClick={handleDeleteSelectedMessages}
            disabled={isDeletingSelected}
            className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
            title="Delete selected"
          >
            <Trash2 className="w-4 h-4 stroke-[2.2]" />
            <span>Delete</span>
          </button>

          {/* Cancel Icon Button */}
          <button
            type="button"
            onClick={() => setSelectedMsgIds([])}
            className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 text-slate-300 hover:text-white transition-all cursor-pointer"
            title="Cancel selection"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5. Selected Image Preview Strip */}
      {selectedImage && (
        <div className="w-full px-4 py-2 bg-amber-50 dark:bg-slate-900 border-t border-amber-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <img
              src={selectedImage}
              alt="Selected preview"
              className="w-12 h-12 object-cover rounded-xl border-2 border-amber-500 shadow-xs"
            />
            <div>
              <p className="text-xs text-amber-950 dark:text-amber-100 font-bold">
                Image attachment ready
              </p>
              <p className="text-[10px] text-amber-800/80 dark:text-amber-300">
                Press send or hit Enter to upload
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSelectedImage(null)}
            className="p-1.5 rounded-full hover:bg-amber-200 dark:hover:bg-slate-800 text-amber-900 dark:text-amber-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 6. Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* 7. Footer Reply Bar (Works for Mobile & Web View seamlessly) */}
      <div className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 shadow-lg flex justify-center">
        <form
          onSubmit={handleSendMessage}
          className="w-full max-w-4xl p-3 sm:p-4 flex items-center gap-2.5"
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

          {/* Message Input with Enter key submission support for Web View */}
          <input
            ref={textInputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            placeholder="Type your message to VIP support..."
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all font-medium"
          />

          {/* Send Button */}
          <button
            type="submit"
            onClick={handleSendMessage}
            disabled={(!inputText.trim() && !selectedImage) || isUploading}
            className="p-3 px-4 sm:px-5 rounded-2xl bg-amber-500 hover:bg-amber-600 disabled:opacity-40 text-amber-950 font-extrabold shadow-md transition-all cursor-pointer shrink-0 active:scale-95 flex items-center gap-1.5"
            title="Send Message"
          >
            <Send className="w-5 h-5 stroke-[2.5]" />
            <span className="hidden sm:inline text-xs font-black">SEND</span>
          </button>
        </form>
      </div>

      {/* 8. Image Zoom Modal */}
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
              type="button"
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
