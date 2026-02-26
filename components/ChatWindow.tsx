"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useRef } from "react";
import { formatMessageTime } from "../lib/formatTime";

export default function ChatWindow({ conversationId }: any) {
  /* ================= ALL HOOKS FIRST ================= */

  const { user } = useUser();

  const users = useQuery(api.users.getUsers);

  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  const typingUsers = useQuery(
    api.typing.getTypingUsers,
    conversationId ? { conversationId } : "skip"
  );

  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const startTyping = useMutation(api.typing.startTyping);
  const stopTyping = useMutation(api.typing.stopTyping);

  const [message, setMessage] = useState("");
  const [showNewMessageButton, setShowNewMessageButton] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);


  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /* ================= DERIVED VALUES ================= */

  const currentUser = users?.find(
    (u) => u.clerkId === user?.id
  );

  const otherTypingUser =
    typingUsers?.find(
      (t) =>
        String(t.userId) !== String(currentUser?._id)
    );

  const typingUserData =
    otherTypingUser &&
    users?.find(
      (u) =>
        String(u._id) ===
        String(otherTypingUser.userId)
    );

  /* ================= MARK AS READ ================= */

  useEffect(() => {
  if (!messages || !currentUser || !conversationId) return;

  const lastMessage = messages[messages.length - 1];

  // If message is from other user
  if (lastMessage.senderId !== currentUser._id) {
    // 🔥 Always show button
    setShowNewMessageButton(true);
  }
}, [messages]);
  /* ================= SCROLL LISTENER ================= */

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const distanceFromBottom =
        container.scrollHeight -
        container.scrollTop -
        container.clientHeight;

      const isNearBottom = distanceFromBottom < 100;

      setShowNewMessageButton(!isNearBottom);
    };

    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  /* ================= AUTO SCROLL ================= */

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;

    const distanceFromBottom =
      container.scrollHeight -
      container.scrollTop -
      container.clientHeight;

    const isNearBottom = distanceFromBottom < 100;

    if (isNearBottom) {
      messagesEndRef.current?.scrollIntoView({
        behavior: "smooth",
      });
    }
  }, [messages]);

  /* ================= SEND MESSAGE ================= */

  const handleSend = async () => {
    if (!conversationId || !currentUser) return;
    if (!message.trim()) return;

    await sendMessage({
      conversationId,
      senderId: currentUser._id,
      body: message.trim(),
    });

    setMessage("");

    stopTyping({
      conversationId,
      userId: currentUser._id,
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  };

  /* ================= NO CHAT SELECTED ================= */

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center">
        Select a conversation
      </div>
    );
  }

  /* ================= UI ================= */

  useEffect(() => {
    if (!conversationId || !currentUser) return;

    const handleStopTyping = () => {
      stopTyping({
        conversationId,
        userId: currentUser._id,
      });
      typingTimeout.current = null;
    };

    if (typingTimeout.current) {
      clearTimeout(typingTimeout.current);
    }

    typingTimeout.current = setTimeout(handleStopTyping, 5000);

    return () => {
      if (typingTimeout.current) {
        clearTimeout(typingTimeout.current);
      }
    };
  }, [message, conversationId, currentUser, stopTyping]);

  const handleScrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
    setShowNewMessageButton(false);

    if (conversationId && currentUser) {
      markAsRead({
        conversationId,
        userId: currentUser._id,
      });
    }
  };

  return (
    <div className="relative flex-1 flex flex-col">

      {/* ========== MESSAGE AREA ========== */}
      <div
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4"
      >
        {messages?.map((msg) => {
          const isMine =
            msg.senderId === currentUser?._id;

          return (
            <div
              key={msg._id}
              className={`flex mb-2 ${
                isMine
                  ? "justify-end"
                  : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-xs break-words ${
                  isMine
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                {msg.body}

                <div className="text-xs mt-1 opacity-70 text-right">
                  {formatMessageTime(
                    msg.createdAt
                  )}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* ========== TYPING INDICATOR ========== */}
      {typingUserData && (
        <div className="px-4 pb-2 text-sm text-gray-500 italic flex items-center gap-1">
          <span>{typingUserData.name} is typing</span>
          <span className="animate-bounce">.</span>
          <span className="animate-bounce delay-100">.</span>
          <span className="animate-bounce delay-200">.</span>
        </div>
      )}

      {/* ========== NEW MESSAGE BUTTON ========== */}
      {showNewMessageButton && (
        <div className="absolute bottom-24 right-6">
          <button
            onClick={handleScrollToBottom}
            className="bg-blue-500 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-600 transition"
          >
            ↓ New Messages
          </button>
        </div>
      )}

      {/* ========== INPUT ========== */}
      <div className="p-4 flex gap-2 border-t">
        <input
          className="flex-1 bg-gray-100 p-2 rounded"
          value={message}
          onChange={(e) => {
            setMessage(e.target.value);

            if (!conversationId || !currentUser) return;

            if (!typingTimeout.current) {
              startTyping({
                conversationId,
                userId: currentUser._id,
              });
            }

            if (typingTimeout.current) {
              clearTimeout(typingTimeout.current);
            }

            typingTimeout.current = setTimeout(() => {
              typingTimeout.current = null;
            }, 5000);
}}
        />

        <button
          onClick={handleSend}
          className="bg-blue-500 text-white px-4 rounded"
        >
          Send
        </button>
      </div>
    </div>
  );
}