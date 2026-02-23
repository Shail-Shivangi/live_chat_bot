"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import { formatMessageTime } from "../lib/formatTime";
export default function ChatWindow({ conversationId }: any) {
  const { user } = useUser();
  const users = useQuery(api.users.getUsers);
  const sendMessage = useMutation(api.messages.sendMessage);
  const [message, setMessage] = useState("");
  const setTyping = useMutation(api.typing.setTyping);
const typingUsers = useQuery(
  api.typing.getTypingUsers,
  conversationId ? { conversationId } : "skip"
);
  const messages = useQuery(
    api.messages.getMessages,
    conversationId ? { conversationId } : "skip"
  );

  if (!conversationId)
    return (
      <div className="flex-1 flex items-center justify-center">
        Select a user to chat
      </div>
    );

  const currentUser = users?.find(
    (u) => u.clerkId === user?.id
  );

  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 p-4 overflow-y-auto">
      
        {messages?.map((msg) => (
  <div
    key={msg._id}
    className={`mb-3 ${
      msg.senderId === currentUser?._id
        ? "text-right"
        : "text-left"
    }`}
  >
    
    <div className="inline-block bg-blue-500 text-white px-3 py-2 rounded-lg">
      <div>{msg.body}</div>
      

      <div className="text-xs text-gray-200 mt-1 text-right">
        {formatMessageTime(msg.createdAt)}
      </div>
    </div>
  </div>
))}
      </div>

      <div className="p-4 flex gap-2">
        <input
          className="flex-1 bg-gray-100 p-2 rounded"
          value={message}
         onChange={(e) => {
  setMessage(e.target.value);

  setTyping({
    conversationId,
    userId: currentUser!._id,
  });
}}
        />
        {typingUsers?.some(
  (t) => t.userId !== currentUser?._id
) && (
  <div className="flex items-center gap-2 px-4 pb-2 text-gray-500">
    <span>Typing</span>
    <span className="animate-bounce">.</span>
    <span className="animate-bounce delay-100">.</span>
    <span className="animate-bounce delay-200">.</span>
  </div>
)}

        <button
          className="bg-blue-500 text-white px-4 rounded"
          onClick={() => {
            sendMessage({
              conversationId,
              senderId: currentUser!._id,
              body: message,
            });
            setMessage("");
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}