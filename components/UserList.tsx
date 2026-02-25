"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { useUser } from "@clerk/nextjs";

interface Props {
  setSelectedConversation: (id: string) => void;
}

export default function UserList({
  setSelectedConversation,
}: Props) {
  const { user } = useUser();
  const users = useQuery(api.users.getUsers);
  const createConversation = useMutation(
    api.conversations.createOrGetConversation
  );

  if (!users) {
    return <div className="p-4">Loading users...</div>;
  }

  const currentUser = users.find(
    (u) => u.clerkId === user?.id
  );

  if (!currentUser) {
    return <div className="p-4">Loading profile...</div>;
  }

  const otherUsers = users.filter(
    (u) => u.clerkId !== user?.id
  );

  return (
    <div>
      {otherUsers.map((u) => (
        <div
          key={u._id}
          onClick={async () => {
            const convoId = await createConversation({
              user1: currentUser._id,
              user2: u._id,
            });

            setSelectedConversation(convoId);
          }}
          className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-100 transition"
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
  );
}