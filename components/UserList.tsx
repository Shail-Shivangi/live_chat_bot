"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";

export default function UserList({
  search,
  setSelectedConversation,
  setSelectedUserId,
}: any){
  const { user } = useUser();
  const users = useQuery(api.users.getUsers);
  const createConversation = useMutation(
    api.conversations.createOrGetConversation
  );

  const [localSearch, setLocalSearch] = useState("");

  if (!users) return <div className="p-3">Loading users...</div>;

  const currentUser = users.find(
    (u) => u.clerkId === user?.id
  );

  if (!currentUser) return null;

  // Exclude self
  const otherUsers = users.filter(
    (u) => u._id !== currentUser._id
  );

  // Filter by search
  const filteredUsers = otherUsers.filter((u) =>
    u.name.toLowerCase().includes(localSearch.toLowerCase())
  );
  return (
    <div className="flex flex-col h-full">

      {/* 🔍 SEARCH BAR */}
      <div className="p-3 border-b bg-white">
        <input
          type="text"
          placeholder="Search users..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full px-3 py-2 rounded-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* 👥 USER LIST */}
      <div className="flex-1 overflow-y-auto">
        {filteredUsers.length === 0 && (
          <p className="p-3 text-sm text-gray-400">
            No users found
          </p>
        )}

        {filteredUsers.map((u) => (
          <div
            key={u._id}
            className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition"
            onClick={async () => {
              const convoId = await createConversation({
                user1: currentUser._id,
                user2: u._id,
              });

              setSelectedConversation(convoId);
              setSelectedUserId(u._id);
            }}
          >
            <div className="relative">
              <img
                src={u.image}
                className="w-10 h-10 rounded-full object-cover"
              />
              {u.online && (
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
              )}
            </div>

            <div>
              <p className="font-medium">{u.name}</p>
              <p className="text-xs text-gray-400">
                {u.online
                  ? "Online"
                  : u.lastSeen
                  ? `Last seen ${new Date(
                      u.lastSeen
                    ).toLocaleTimeString()}`
                  : "Offline"}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}