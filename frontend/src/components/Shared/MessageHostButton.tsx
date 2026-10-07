"use client";
import React from 'react';
import { useUser } from '../../contexts/UserContext';
import { Button } from '../UI';
import { useRouter } from 'next/navigation';
import { getOrCreateConversation } from '../../lib/messagesApi';

export default function MessageHostButton({ listingId, hostId, hostName }: { listingId: number, hostId: number, hostName: string }) {
  const { user } = useUser();
  const router = useRouter();

  if (user?.id === hostId) {
    return null; // hide if I am the host
  }

  const handleMessage = async () => {
    if (!user) {
      // Simulate opening the login/switch-user prompt (user menu)
      const el = document.querySelector('[tabindex="0"]') as HTMLElement;
      if (el) el.click();
      return;
    }
    try {
      await getOrCreateConversation(listingId, user.id);
      router.push('/messages');
    } catch (e) {
      alert("Failed to start conversation.");
    }
  };

  return (
    <Button onClick={handleMessage} className="mt-4 font-bold border-black px-6">
      Message {hostName}
    </Button>
  );
}
