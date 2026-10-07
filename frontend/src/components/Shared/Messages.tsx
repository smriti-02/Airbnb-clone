import React, { useState, useEffect, useRef } from 'react';
import { fetchConversations, fetchConversation, sendMessage, markConversationRead } from '../../lib/messagesApi';
import { useUser } from '../../contexts/UserContext';
import SafeImage from '../SafeImage';
import { Button } from '../UI';

export function Avatar({ url, name, className = "" }: any) {
  if (url) return <SafeImage src={url} alt={name} className={`rounded-full object-cover ${className}`} />;
  return (
    <div className={`bg-neutral-800 text-white flex items-center justify-center rounded-full font-bold ${className}`}>
      {name ? name[0].toUpperCase() : '?'}
    </div>
  );
}

function formatDate(dateStr: string) {
  let isoStr = dateStr.replace(' ', 'T');
  if (!isoStr.endsWith('Z')) isoStr += 'Z';
  const d = new Date(isoStr);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'Asia/Kolkata' });
}

function formatTime(dateStr: string) {
  let isoStr = dateStr.replace(' ', 'T');
  if (!isoStr.endsWith('Z')) isoStr += 'Z';
  const d = new Date(isoStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
}

export function MessagingLayout() {
  const { user } = useUser();
  const [conversations, setConversations] = useState<any[]>([]);
  const [activeConvId, setActiveConvId] = useState<number | null>(null);
  const [activeConv, setActiveConv] = useState<any | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingThread, setLoadingThread] = useState(false);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [msgInput, setMsgInput] = useState('');

  const loadList = async (isPoll = false) => {
    if (!user) return;
    try {
      const abort = new AbortController();
      abortControllerRef.current = abort;
      const data = await fetchConversations(user.id, abort.signal);
      setConversations(data.items);
      if (!isPoll) setLoadingList(false);
    } catch (e: any) {
      if (e.name !== 'AbortError' && !isPoll) setLoadingList(false);
    }
  };

  const loadThread = async (id: number, isPoll = false) => {
    if (!user) return;
    if (!isPoll) setLoadingThread(true);
    try {
      const abort = new AbortController();
      abortControllerRef.current = abort;
      const data = await fetchConversation(id, user.id, abort.signal);
      setActiveConv(data);
      if (!isPoll) {
        setLoadingThread(false);
        // mark read if unread
        if (data.messages && data.messages.length > 0) {
          const lastMsg = data.messages[data.messages.length - 1];
          if (lastMsg.sender_id !== user.id && (!data.last_read_message_id || data.last_read_message_id < lastMsg.id)) {
            await markConversationRead(id, user.id);
            loadList(true); // update badges
          }
        }
      }
    } catch (e: any) {
      if (e.name !== 'AbortError' && !isPoll) setLoadingThread(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadList();
    
    // Polling logic
    let listInterval: any;
    let threadInterval: any;
    
    const handleVis = () => {
      if (document.hidden) {
        clearInterval(listInterval);
        clearInterval(threadInterval);
      } else {
        startPolling();
      }
    };
    
    const startPolling = () => {
      clearInterval(listInterval);
      clearInterval(threadInterval);
      listInterval = setInterval(() => {
        loadList(true);
      }, 10000);
      
      threadInterval = setInterval(() => {
        if (activeConvId) loadThread(activeConvId, true);
      }, 4000);
    };

    if (!document.hidden) startPolling();
    document.addEventListener('visibilitychange', handleVis);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVis);
      clearInterval(listInterval);
      clearInterval(threadInterval);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, [user, activeConvId]);

  useEffect(() => {
    if (activeConvId) {
      loadThread(activeConvId);
    } else {
      setActiveConv(null);
    }
  }, [activeConvId]);
  
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgInput.trim() || !activeConvId || !user) return;
    try {
      const sent = await sendMessage(activeConvId, msgInput.trim(), user.id);
      setActiveConv((prev: any) => ({
        ...prev,
        messages: [...(prev.messages || []), sent]
      }));
      setMsgInput('');
      loadList(true);
    } catch (e) {
      alert("Failed to send message");
    }
  };

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-80px)] border-t border-[color:var(--color-airbnb-border)] bg-white max-w-7xl mx-auto w-full">
      {/* List Pane */}
      <div className={`w-full md:w-1/3 border-r border-[color:var(--color-airbnb-border)] flex flex-col ${activeConvId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-6 border-b border-[color:var(--color-airbnb-border)]">
          <h1 className="text-2xl font-bold">Messages</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loadingList ? (
            <div className="p-4 space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-4 items-center">
                  <div className="w-14 h-14 bg-neutral-200 rounded-full animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-neutral-200 w-1/2 rounded animate-pulse" />
                    <div className="h-3 bg-neutral-200 w-3/4 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-neutral-500">You have no messages.</div>
          ) : (
            <div className="flex flex-col">
              {conversations.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveConvId(c.id)}
                  className={`flex gap-4 p-4 items-center text-left hover:bg-neutral-50 transition ${activeConvId === c.id ? 'bg-neutral-100' : ''}`}
                >
                  <Avatar url={c.other_user.avatar_url} name={c.other_user.name} className="w-14 h-14 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                      <h3 className="font-semibold truncate">{c.other_user.name}</h3>
                      {c.last_message && (
                        <span className="text-xs text-neutral-500 ml-2 whitespace-nowrap">
                          {formatDate(c.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${c.unread_count > 0 ? 'font-semibold text-black' : 'text-neutral-500'}`}>
                      {c.last_message ? (c.last_message.kind === 'system' ? 'System: ' + c.last_message.body : c.last_message.body) : 'No messages'}
                    </p>
                    <p className="text-xs text-neutral-500 truncate mt-0.5">{c.listing.title}</p>
                  </div>
                  {c.unread_count > 0 && (
                    <div className="w-3 h-3 bg-[color:var(--color-airbnb-primary)] rounded-full flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Thread Pane */}
      <div className={`w-full md:w-2/3 flex flex-col bg-white ${!activeConvId ? 'hidden md:flex items-center justify-center' : 'flex'}`}>
        {!activeConvId ? (
          <div className="text-neutral-500">Select a thread to view</div>
        ) : loadingThread ? (
          <div className="flex-1 flex items-center justify-center">Loading...</div>
        ) : activeConv ? (
          <>
            <div className="p-4 border-b border-[color:var(--color-airbnb-border)] flex items-center justify-between sticky top-0 bg-white z-10">
              <div className="flex items-center gap-3">
                <button className="md:hidden p-2 -ml-2" onClick={() => setActiveConvId(null)}>
                  <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 fill-current"><path d="M20 28L8.7 16.7a1 1 0 0 1 0-1.4L20 4"></path></svg>
                </button>
                <Avatar url={activeConv.other_user.avatar_url} name={activeConv.other_user.name} className="w-10 h-10" />
                <div>
                  <h2 className="font-bold">{activeConv.other_user.name}</h2>
                  <p className="text-sm text-neutral-500">Joined {activeConv.other_user.joined_at ? new Date(activeConv.other_user.joined_at).getFullYear() : 'recently'}</p>
                </div>
              </div>
              <a href={`/listings/${activeConv.listing.id}`} target="_blank" className="text-sm font-semibold underline">
                Go to listing
              </a>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 flex flex-col">
              {/* Context Header */}
              <div className="text-center pb-6 border-b border-[color:var(--color-airbnb-border)]">
                <h3 className="font-bold text-lg">{activeConv.listing.title}</h3>
                {activeConv.booking ? (
                  <p className="text-neutral-500 mt-1">
                    {formatDate(activeConv.booking.check_in)} - {formatDate(activeConv.booking.check_out)} · {activeConv.booking.guests} guests
                  </p>
                ) : (
                  <p className="text-neutral-500 mt-1">Inquiry</p>
                )}
              </div>
              
              {activeConv.messages?.map((m: any, i: number) => {
                const isMe = m.sender_id === user.id;
                const isSystem = m.kind === 'system';
                
                if (isSystem) {
                  return (
                    <div key={m.id} className="flex justify-center my-4">
                      <div className="bg-neutral-100 text-neutral-600 px-4 py-2 rounded-full text-sm">
                        {m.body}
                      </div>
                    </div>
                  );
                }
                
                return (
                  <div key={m.id} className={`flex flex-col max-w-[70%] ${isMe ? 'self-end items-end' : 'self-start items-start'}`}>
                    <div className={`px-4 py-3 rounded-2xl ${isMe ? 'bg-black text-white' : 'bg-neutral-100 text-black'}`}>
                      {m.body}
                    </div>
                    <span className="text-xs text-neutral-400 mt-1">{formatTime(m.created_at)}</span>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            
            <div className="p-4 border-t border-[color:var(--color-airbnb-border)] sticky bottom-0 bg-white">
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 border border-neutral-300 rounded-full px-6 py-3 focus:outline-none focus:border-black"
                  value={msgInput}
                  onChange={(e) => setMsgInput(e.target.value)}
                />
                <Button primary type="submit" className="rounded-full px-6" disabled={!msgInput.trim()}>
                  Send
                </Button>
              </form>
            </div>
          </>
        ) : null}
      </div>
    </div>
  );
}
