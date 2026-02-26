"use client";

import { useState } from "react";
import ConversationList from "./ConversationList";
import UserList from "./UserList";

interface Props {
  selectedConversation: string | null;
  setSelectedConversation: (id: string) => void;
  setSelectedUserId: (id: string) => void;
}

export default function Sidebar({
  selectedConversation,
  setSelectedConversation,
  setSelectedUserId,
}: Props) {

  const [showUsers, setShowUsers] = useState(false);
  const [search, setSearch] = useState("");

  return (
    <div className="w-80 border-r h-screen flex flex-col bg-white">

      {/* 🔍 SEARCH BAR */}
      <div className="p-3 border-b">
        <input
          type="text"
          placeholder={showUsers ? "Search users..." : "Search chats..."}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">

        {showUsers ? (
          <UserList
            search={search}
            setSelectedConversation={(id: string) => {
              setSelectedConversation(id);
              setShowUsers(false);
            }}
            setSelectedUserId={setSelectedUserId}
          />
        ) : (
          <ConversationList
            search={search}
            selectedConversation={selectedConversation}
            setSelectedConversation={setSelectedConversation}
          />
        )}

      </div>

      

    </div>
  );
}