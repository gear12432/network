'use client';

import React, { useState } from 'react';
import {
  DollarSign,
  Calendar,
  Tag,
  TrendingUp,
  MoreHorizontal,
  FileSpreadsheet,
  Phone,
  Video,
  Send,
  Plus,
  ChevronLeft,
  CheckCheck,
  Smile,
  Paperclip,
  Check,
} from 'lucide-react';
import {
  FINANCE_SUMMARY_DATA,
  ACTIVITY_CHART_DATA,
  BROWSER_ACTIVITY_DATA,
} from '@/data/initialData';

interface DesktopAnalyticsCardsProps {
  onViewTaxDetails?: () => void;
}

interface ChatMessage {
  id: string;
  sender: 'james' | 'me';
  text?: string;
  time: string;
  isImage?: boolean;
}

export default function DesktopAnalyticsCards({
  onViewTaxDetails,
}: DesktopAnalyticsCardsProps) {
  // Activity Card State
  const [activityTab, setActivityTab] = useState<'overview' | 'sales'>('overview');
  const [selectedActivityDay, setSelectedActivityDay] = useState<string>('4 April');

  // Unique Visitors Card State
  const [visitorTab, setVisitorTab] = useState<'overview' | 'sales'>('overview');
  const [selectedVisitorDay, setSelectedVisitorDay] = useState<number>(14);

  // Visitors 7-Day Data (Matching Screenshot 1: 11, 12, 13, 14, 15, 16, 17)
  const visitorsData = [
    { day: 11, value: 35, count: '1,420' },
    { day: 12, value: 48, count: '2,150' },
    { day: 13, value: 68, count: '3,020' },
    { day: 14, value: 92, count: '3,867', isFeatured: true },
    { day: 15, value: 32, count: '1,310' },
    { day: 16, value: 88, count: '3,650' },
    { day: 17, value: 58, count: '2,480' },
  ];

  // Interactive Live Chat State (Matching Screenshot 1 Right Panel)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', sender: 'james', text: "Hey what's up", time: '5:10 PM' },
    { id: '2', sender: 'james', text: 'Do you work on my new project?', time: '5:11 PM' },
    { id: '3', sender: 'james', text: 'We need a design tomorrow', time: '5:11 PM' },
    { id: '4', sender: 'me', text: 'Hi James, everything is fine', time: '5:12 PM' },
    { id: '5', sender: 'me', text: 'Yes, your design is completed', time: '5:13 PM' },
    { id: '6', sender: 'me', isImage: true, time: '5:13 PM' },
    { id: '7', sender: 'james', text: 'Looks good, I like it', time: '5:14 PM' },
    { id: '8', sender: 'james', text: 'Share it with our developer', time: '5:15 PM' },
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSendMessage = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'me',
      text: inputMessage.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, newMsg]);
    setInputMessage('');

    // Simulated friendly automated reply after 1.5 seconds
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now() + 1}`,
          sender: 'james',
          text: 'Got it! Thanks for the update.',
          time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
        },
      ]);
    }, 1500);
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5 mb-6 w-full text-[#46280b]">
      {/* =========================================================================
          COLUMN 1 (LEFT): Finance Summary + Activity 12-Bar Chart
          ========================================================================= */}
      <div className="xl:col-span-4 flex flex-col gap-5">
        {/* 1. Finance Summary Card (Matches Screenshot 1 Left Top Card) */}
        <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl p-5 border border-[#dfbe7e] shadow-xs flex flex-col justify-between">
          <div>
            {/* Card Header & Icon */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-extrabold text-[#46280b] text-base">Finance Summary</h3>
                <p className="text-xs text-[#8a5b28]">Check out each column for more details</p>
              </div>
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#f5e4bd] to-[#edd199] border border-[#dfbe7e] text-[#5c3710] flex items-center justify-center shadow-2xs">
                <FileSpreadsheet className="w-4 h-4 text-[#7d511f]" />
              </div>
            </div>

            {/* 2x2 Financial Metrics Grid */}
            <div className="grid grid-cols-2 gap-4 py-2 border-y border-[#ebd5ad]">
              <div>
                <span className="text-[11px] font-medium text-[#8a5b28] block mb-0.5">
                  Annual Companies Taxes
                </span>
                <span className="text-base font-extrabold text-[#46280b] tracking-tight font-mono">
                  $500,580
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8a5b28] block mb-0.5">
                  Next Tax Review Date
                </span>
                <span className="text-sm font-bold text-[#55361e]">
                  April 26, 2025
                </span>
              </div>

              <div>
                <span className="text-[11px] font-medium text-[#8a5b28] block mb-0.5">
                  Average Product Price
                </span>
                <span className="text-sm font-bold text-[#55361e] font-mono">
                  $65.54
                </span>
              </div>

              <div>
                <div className="flex items-center justify-between text-[11px] font-medium text-[#8a5b28] mb-1">
                  <span>Satisfaction Rate</span>
                  <span className="font-bold text-[#46280b]">68%</span>
                </div>
                <div className="w-full bg-[#ecd7b0] h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#d9a54c] to-[#be8832] h-full rounded-full transition-all duration-500"
                    style={{ width: '68%' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Team Avatars & SEE MORE Link */}
          <div className="mt-4 pt-3 flex items-center justify-between">
            <div className="flex items-center -space-x-1.5">
              {[
                { name: 'AI', bg: 'bg-[#ffdca0] text-[#7d511f] border-[#dfbe7e]' },
                { name: 'LS', bg: 'bg-[#ebd3f7] text-[#6b21a8] border-[#d8b4e2]' },
                { name: 'DJ', bg: 'bg-[#fed7e2] text-[#9d174d] border-[#fbcfe8]' },
                { name: 'RI', bg: 'bg-[#cffafe] text-[#155e75] border-[#a5f3fc]' },
                { name: 'SA', bg: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]' },
              ].map((chip, idx) => (
                <div
                  key={idx}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center text-[10px] font-bold shadow-2xs ${chip.bg}`}
                >
                  {chip.name}
                </div>
              ))}
            </div>

            <button
              onClick={onViewTaxDetails}
              className="text-[11px] font-bold text-[#8a5b28] hover:text-[#46280b] tracking-wider uppercase transition-colors cursor-pointer"
            >
              SEE MORE +
            </button>
          </div>
        </div>

        {/* 2. Activity Vertical Bar Chart Card (Matches Screenshot 1 Left Bottom Card) */}
        <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl p-5 border border-[#dfbe7e] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-[#46280b] text-base">Activity</h3>
                <p className="text-xs text-[#8a5b28]">Check out each column for more details</p>
              </div>
              <button className="text-[#8a5b28] hover:text-[#46280b] p-1 cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Overview / Sales Tabs */}
            <div className="flex items-center gap-4 border-b border-[#ebd5ad] pt-1 pb-2 mb-4">
              <button
                onClick={() => setActivityTab('overview')}
                className={`text-xs font-bold pb-1 transition-colors relative cursor-pointer ${
                  activityTab === 'overview'
                    ? 'text-[#46280b] border-b-2 border-[#8a5b28]'
                    : 'text-[#8a5b28]/70 hover:text-[#46280b]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActivityTab('sales')}
                className={`text-xs font-bold pb-1 transition-colors relative cursor-pointer ${
                  activityTab === 'sales'
                    ? 'text-[#46280b] border-b-2 border-[#8a5b28]'
                    : 'text-[#8a5b28]/70 hover:text-[#46280b]'
                }`}
              >
                Sales
              </button>
            </div>

            {/* 12 Vertical Bars matching Screenshot 1 */}
            <div className="h-36 flex items-end justify-between gap-1 pt-2">
              {ACTIVITY_CHART_DATA.map((item) => {
                const val = activityTab === 'overview' ? item.overview : item.sales;
                const isSelected = selectedActivityDay === item.day;

                return (
                  <div
                    key={item.day}
                    onClick={() => setSelectedActivityDay(item.day)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                    title={`${item.day}: ${val}% activity`}
                  >
                    <div
                      className={`w-full max-w-[10px] rounded-t-sm transition-all duration-300 ${
                        isSelected
                          ? 'bg-[#1b7f4e] scale-110 shadow-xs ring-2 ring-[#a3e4c4]'
                          : 'bg-[#22c55e]/75 group-hover:bg-[#16a34a]'
                      }`}
                      style={{ height: `${val}%` }}
                    />
                    <span className="text-[8px] font-medium text-[#8a5b28] mt-2 truncate max-w-full text-center">
                      {item.day.split(' ')[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 text-center text-[10px] text-[#55361e] bg-[#f5e9d3] border border-[#e4cc9f] py-1 rounded-md">
            Selected: <span className="font-bold text-[#8a5b28]">{selectedActivityDay}</span> (
            {ACTIVITY_CHART_DATA.find((x) => x.day === selectedActivityDay)?.[activityTab]}k returns)
          </div>
        </div>
      </div>

      {/* =========================================================================
          COLUMN 2 (CENTER): Unique Visitors Graph + Browser Activity & Total Sales
          ========================================================================= */}
      <div className="xl:col-span-5 flex flex-col gap-5">
        {/* 3. Unique Visitors Graph Card (Matches Screenshot 1 Center Large Card) */}
        <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl p-5 border border-[#dfbe7e] shadow-xs flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-extrabold text-[#46280b] text-base">Unique Visitors Graph</h3>
                <p className="text-xs text-[#8a5b28]">Check out each column for more details</p>
              </div>
              <button className="text-[#8a5b28] hover:text-[#46280b] p-1 cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </div>

            {/* Overview / Sales Tabs */}
            <div className="flex items-center gap-4 border-b border-[#ebd5ad] pt-1 pb-2 mb-4">
              <button
                onClick={() => setVisitorTab('overview')}
                className={`text-xs font-bold pb-1 transition-colors relative cursor-pointer ${
                  visitorTab === 'overview'
                    ? 'text-[#46280b] border-b-2 border-[#8a5b28]'
                    : 'text-[#8a5b28]/70 hover:text-[#46280b]'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setVisitorTab('sales')}
                className={`text-xs font-bold pb-1 transition-colors relative cursor-pointer ${
                  visitorTab === 'sales'
                    ? 'text-[#46280b] border-b-2 border-[#8a5b28]'
                    : 'text-[#8a5b28]/70 hover:text-[#46280b]'
                }`}
              >
                Sales
              </button>
            </div>

            {/* 7 Wide Columns Graph with Featured Pill on Day 14 */}
            <div className="h-64 flex items-end justify-between gap-3 pt-8 pb-1 px-2">
              {visitorsData.map((item) => {
                const isDay14 = item.day === 14;
                const isSelected = selectedVisitorDay === item.day;

                return (
                  <div
                    key={item.day}
                    onClick={() => setSelectedVisitorDay(item.day)}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                  >
                    {/* Floating Pill Badge on Day 14 (Matches Screenshot 1 exact badge!) */}
                    {isDay14 && (
                      <div className="absolute -top-7 z-10 bg-[#16a34a] text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs animate-pulse">
                        3,867
                      </div>
                    )}

                    {/* Wide Bar Pillar */}
                    <div
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                        isDay14
                          ? 'bg-[#16a34a] shadow-md ring-2 ring-[#a3e4c4]'
                          : isSelected
                          ? 'bg-[#d9a54c] ring-2 ring-[#dfbe7e]'
                          : 'bg-[#e2e8f0] hover:bg-[#cbd5e1]'
                      }`}
                      style={{ height: `${item.value}%` }}
                    />

                    {/* Day Number Label */}
                    <span
                      className={`text-xs font-extrabold mt-2 ${
                        isDay14 ? 'text-[#16a34a]' : isSelected ? 'text-[#46280b]' : 'text-[#8a5b28]'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="text-center text-[11px] text-[#55361e] bg-[#f5e9d3] border border-[#e4cc9f] py-1.5 rounded-xl mt-2 font-medium">
            Day {selectedVisitorDay} Visitors:{' '}
            <strong className="text-[#16a34a] font-mono">
              {visitorsData.find((x) => x.day === selectedVisitorDay)?.count} visitors
            </strong>
          </div>
        </div>

        {/* 4. Bottom Row: Browser Activity + Total Sales Cards (Side-by-Side) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sub-card A: Browser Activity */}
          <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl p-4 border border-[#dfbe7e] shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className="font-extrabold text-[#46280b] text-xs">Browser Activity</h4>
                  <p className="text-[10px] text-[#8a5b28]">Check out more details</p>
                </div>
                <div className="w-6 h-6 rounded-lg bg-[#faecd4] text-[#8a5b28] flex items-center justify-center border border-[#e8d2aa]">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {/* Chrome */}
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                    C
                  </div>
                  <div className="flex-1 bg-[#ecd7b0] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-emerald-500" style={{ width: '75%' }} />
                  </div>
                  <span className="w-8 text-right font-bold text-[#46280b] font-mono">75%</span>
                </div>

                {/* Safari */}
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-4 h-4 rounded-full bg-blue-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                    S
                  </div>
                  <div className="flex-1 bg-[#ecd7b0] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: '15%' }} />
                  </div>
                  <span className="w-8 text-right font-bold text-[#46280b] font-mono">15%</span>
                </div>

                {/* Firefox / Opera */}
                <div className="flex items-center gap-2 text-[11px]">
                  <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0">
                    O
                  </div>
                  <div className="flex-1 bg-[#ecd7b0] h-1.5 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: '10%' }} />
                  </div>
                  <span className="w-8 text-right font-bold text-[#46280b] font-mono">10%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-card B: Total Sales & Transactions with Sparklines */}
          <div className="bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl p-4 border border-[#dfbe7e] shadow-xs flex flex-col justify-between">
            <div className="space-y-2.5">
              {/* Total Sales */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#8a5b28] font-bold block">Total Sales</span>
                  <span className="text-sm font-extrabold text-[#46280b] font-mono">5836</span>
                </div>
                {/* Blue Sparkline SVG Wave */}
                <svg className="w-14 h-5 text-blue-500 stroke-current fill-none stroke-2" viewBox="0 0 60 20">
                  <path d="M0,15 Q15,5 30,12 T60,6" />
                </svg>
              </div>

              {/* Transactions */}
              <div className="flex items-center justify-between border-t border-[#ebd5ad] pt-2">
                <div>
                  <span className="text-[10px] text-[#8a5b28] font-bold block">Transactions</span>
                  <span className="text-sm font-extrabold text-[#965c19] font-mono">+7580</span>
                </div>
                {/* Orange Sparkline SVG Wave */}
                <svg className="w-14 h-5 text-amber-600 stroke-current fill-none stroke-2" viewBox="0 0 60 20">
                  <path d="M0,12 Q20,18 35,8 T60,10" />
                </svg>
              </div>

              {/* Completed Transactions */}
              <div className="flex items-center justify-between border-t border-[#ebd5ad] pt-2">
                <div>
                  <span className="text-[10px] text-[#8a5b28] font-bold block">Completed Transactions</span>
                  <span className="text-sm font-extrabold text-emerald-800 font-mono">6584</span>
                </div>
                {/* Green Sparkline SVG Wave */}
                <svg className="w-14 h-5 text-emerald-600 stroke-current fill-none stroke-2" viewBox="0 0 60 20">
                  <path d="M0,16 Q18,4 32,10 T60,4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          COLUMN 3 (RIGHT): Live Integrated Customer Chat (James Davidson)
          ========================================================================= */}
      <div className="xl:col-span-3 bg-gradient-to-b from-[#fffefc] via-[#fbf5e7] to-[#f4e4c2] rounded-3xl border border-[#dfbe7e] shadow-xs flex flex-col justify-between overflow-hidden min-h-[580px]">
        {/* Chat Header */}
        <div className="px-4 py-3.5 border-b border-[#dfbe7e] bg-white/70 backdrop-blur-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <button className="text-[#8a5b28] hover:text-[#46280b] p-1 cursor-pointer" title="Back">
              <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* User Avatar with Green Pulse Indicator */}
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#cffafe] to-[#a5f3fc] border border-[#67e8f9] flex items-center justify-center font-bold text-xs text-[#0e7490] shadow-2xs">
                JD
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-1 ring-emerald-300" />
            </div>

            <div className="truncate">
              <h4 className="font-extrabold text-xs text-[#46280b] truncate">James Davidson</h4>
              <span className="text-[10px] text-[#8a5b28] block truncate">Active 12 min ago</span>
            </div>
          </div>

          {/* Action Icons: Phone Call + Video Call */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => alert('Starting audio call with James Davidson...')}
              className="w-8 h-8 rounded-xl bg-[#faecd4] hover:bg-[#edd199] text-[#7d511f] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Call"
            >
              <Phone className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => alert('Starting video call with James Davidson...')}
              className="w-8 h-8 rounded-xl bg-[#faecd4] hover:bg-[#edd199] text-[#7d511f] flex items-center justify-center transition-colors cursor-pointer shadow-2xs"
              title="Video Call"
            >
              <Video className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Message Stream */}
        <div className="flex-1 p-3.5 overflow-y-auto space-y-2.5 max-h-[440px] text-xs">
          {/* Timestamp Separator */}
          <div className="text-center my-1">
            <span className="text-[10px] text-[#8a5b28] font-bold bg-[#faecd4]/80 px-2.5 py-0.5 rounded-full border border-[#e8d2aa]">
              Wed 5:10 PM
            </span>
          </div>

          {chatMessages.map((msg) => {
            const isMe = msg.sender === 'me';

            return (
              <div
                key={msg.id}
                className={`flex items-end gap-1.5 ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                {!isMe && (
                  <div className="w-6 h-6 rounded-full bg-[#cffafe] text-[#0e7490] text-[9px] font-bold flex items-center justify-center shrink-0 border border-[#a5f3fc]">
                    JD
                  </div>
                )}

                <div className="max-w-[78%]">
                  {msg.isImage ? (
                    /* Mockup Design Preview Attachment */
                    <div className="rounded-2xl p-2 bg-gradient-to-r from-[#15803d] to-[#166534] text-white shadow-xs border border-emerald-400/40">
                      <div className="w-full h-16 rounded-xl bg-white/20 border border-white/25 flex items-center justify-center font-mono text-[10px] font-bold">
                        ✦ Project Design Mockup ✦
                      </div>
                      <span className="text-[8px] text-emerald-200 block text-right mt-1">
                        {msg.time} ✓✓
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`px-3 py-2 rounded-2xl shadow-2xs leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-[#16a34a] to-[#15803d] text-white rounded-br-xs'
                          : 'bg-white text-[#46280b] border border-[#ebd5ad] rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.text}</p>
                      <span
                        className={`text-[8px] block text-right mt-0.5 ${
                          isMe ? 'text-emerald-100' : 'text-[#8a5b28]'
                        }`}
                      >
                        {msg.time} {isMe ? '✓✓' : ''}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white/90 border-t border-[#dfbe7e] flex items-center gap-2">
          {/* Plus Attachment Button */}
          <button
            type="button"
            onClick={() => alert('Add attachment or document')}
            className="w-8 h-8 rounded-xl bg-[#16a34a] hover:bg-[#15803d] active:scale-95 text-white flex items-center justify-center shrink-0 transition-colors cursor-pointer shadow-xs"
            title="Attach File"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
          </button>

          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-[#faf6ee] border border-[#dfbe7e] rounded-xl px-3 py-2 text-xs text-[#46280b] placeholder-[#a68255] focus:outline-none focus:ring-2 focus:ring-[#d9a54c]/30 focus:border-[#d9a54c] transition-all"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim()}
            className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all cursor-pointer ${
              inputMessage.trim()
                ? 'bg-[#4e2e0f] text-[#ffebbe] hover:bg-[#3b220a] shadow-xs active:scale-95'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
            title="Send"
          >
            <Send className="w-3.5 h-3.5 stroke-[2.2]" />
          </button>
        </form>
      </div>
    </div>
  );
}
