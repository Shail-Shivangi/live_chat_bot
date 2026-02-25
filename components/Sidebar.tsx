"use client";

import { useState } from "react";
import ConversationList from "./ConversationList";
import UserList from "./UserList";

interface Props {
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
}

export default function Sidebar({
  selectedConversation,
  setSelectedConversation,
}: Props) {
  const [showUsers, setShowUsers] = useState(false);

  return (
    <div className="w-80 border-r h-screen flex flex-col bg-white">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">
          Chats
        </h2>

        <button
          onClick={() => setShowUsers(!showUsers)}
          className="text-sm text-blue-500 hover:underline"
        >
          {showUsers ? "Back" : "New Chat"}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {showUsers ? (
          <UserList
            setSelectedConversation={
              setSelectedConversation
            }
          />
        ) : (
          <ConversationList
            selectedConversation={
              selectedConversation
            }
            setSelectedConversation={
              setSelectedConversation
            }
          />
        )}
      </div>
    </div>
  );
}