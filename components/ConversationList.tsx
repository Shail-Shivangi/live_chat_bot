"use client";

import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";

interface Props {
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
}

export default function ConversationList({
  selectedConversation,
  setSelectedConversation,
}: Props) {
  const { user } = useUser();
  const users = useQuery(api.users.getUsers);
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});

  const currentUser = users?.find((u) => u.clerkId === user?.id);

  const conversations = useQuery(
    api.conversations.getUserConversations,
    currentUser ? { userId: currentUser._id } : "skip"
  );

  useEffect(() => {
    if (conversations) {
      const updatedUnreadCounts: Record<string, number> = {};
      conversations.forEach((convo) => {
        updatedUnreadCounts[convo._id] = convo.unreadCount || 0;
      });
      setUnreadCounts(updatedUnreadCounts);
    }
  }, [conversations]);

  const handleConversationClick = (convoId: string) => {
    setSelectedConversation(convoId);
    setUnreadCounts((prev) => ({
      ...prev,
      [convoId]: 0, // Clear unread count for the opened conversation
    }));
  };

  if (!users) {
    return <div className="p-4">Loading users...</div>;
  }

  if (!currentUser) {
    return <div className="p-4">Loading profile...</div>;
  }

  if (!conversations) {
    return <div className="p-4">Loading chats...</div>;
  }

  return (
    <div>
      {conversations.map((convo) => {
        const otherUserId = convo.members.find(
          (id: string) => id !== currentUser._id
        );

        const otherUser = users.find((u) => u._id === otherUserId);

        if (!otherUser) return null;

        return (
          <div
            key={convo._id}
            onClick={() => handleConversationClick(convo._id)}
            className={`flex items-center justify-between p-3 cursor-pointer transition ${
              selectedConversation === convo._id
                ? "bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={otherUser.image}
                  className="w-10 h-10 rounded-full object-cover"
                />
                {otherUser.online && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </div>

              <div>
                <p className="font-medium">{otherUser.name}</p>
                <p className="text-xs text-gray-400">
                  {otherUser.online
                    ? "Online"
                    : otherUser.lastSeen
                    ? `Last seen ${new Date(
                        otherUser.lastSeen
                      ).toLocaleTimeString()}`
                    : "Offline"}
                </p>
              </div>
            </div>

            {unreadCounts[convo._id] > 0 && (
              <div className="bg-red-500 text-white text-xs font-semibold px-2 py-1 rounded-full min-w-[22px] text-center">
                {unreadCounts[convo._id]}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}