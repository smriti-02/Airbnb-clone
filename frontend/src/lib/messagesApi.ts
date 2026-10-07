export const fetchConversations = async (userId: number, signal?: AbortSignal) => {
  const res = await fetch(`http://localhost:8000/api/conversations`, {
    headers: { 'X-User-Id': userId.toString() },
    signal
  });
  if (!res.ok) throw new Error('Failed to fetch conversations');
  return res.json();
};

export const fetchUnreadCount = async (userId: number, signal?: AbortSignal) => {
  const res = await fetch(`http://localhost:8000/api/messages/unread-count`, {
    headers: { 'X-User-Id': userId.toString() },
    signal
  });
  if (!res.ok) throw new Error('Failed to fetch unread count');
  return res.json();
};

export const fetchConversation = async (conversationId: number, userId: number, signal?: AbortSignal) => {
  const res = await fetch(`http://localhost:8000/api/conversations/${conversationId}`, {
    headers: { 'X-User-Id': userId.toString() },
    signal
  });
  if (!res.ok) throw new Error('Failed to fetch conversation');
  return res.json();
};

export const sendMessage = async (conversationId: number, body: string, userId: number) => {
  const res = await fetch(`http://localhost:8000/api/conversations/${conversationId}/messages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId.toString(),
    },
    body: JSON.stringify({ body })
  });
  if (!res.ok) throw new Error('Failed to send message');
  return res.json();
};

export const markConversationRead = async (conversationId: number, userId: number) => {
  const res = await fetch(`http://localhost:8000/api/conversations/${conversationId}/read`, {
    method: 'POST',
    headers: { 'X-User-Id': userId.toString() }
  });
  if (!res.ok) throw new Error('Failed to mark read');
  return res.json();
};

export const getOrCreateConversation = async (listingId: number, userId: number, message?: string) => {
  const res = await fetch(`http://localhost:8000/api/conversations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': userId.toString(),
    },
    body: JSON.stringify({ listing_id: listingId, message: message || undefined })
  });
  if (!res.ok) throw new Error('Failed to get or create conversation');
  return res.json();
};
