
"use client";

import { useEffect, useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import Sidebar from "@/components/Sidebar";
import ChatWindow from "@/components/ChatWindow";

export default function ChatPage() {
  const { user } = useUser();

  const users = useQuery(api.users.getUsers);
  const createUser = useMutation(api.users.createUser);
  const setOnline = useMutation(api.presence.setOnline);
  const setOffline = useMutation(api.presence.setOffline);

  const [selectedConversation, setSelectedConversation] =
    useState<string | null>(null);

  const userCreatedRef = useRef(false);
  const presenceSetRef = useRef(false);

  const currentUser = users?.find(
    (u) => u.clerkId === user?.id
  );

  // ✅ CREATE USER ONLY ONCE
  useEffect(() => {
    if (!user || !users) return;
    if (userCreatedRef.current) return;

    const existingUser = users.find(
      (u) => u.clerkId === user.id
    );

    if (!existingUser) {
      userCreatedRef.current = true;

      createUser({
        clerkId: user.id,
        name: user.fullName || "Unknown",
        image: user.imageUrl,
        online: true,
        lastSeen: Date.now(),
      });
    }
  }, [user, users]);

  // ✅ SET ONLINE ONLY ONCE
  useEffect(() => {
    if (!currentUser) return;
    if (presenceSetRef.current) return;

    presenceSetRef.current = true;

    setOnline({ userId: currentUser._id,online:true });

    const handleBeforeUnload = () => {
      setOffline({ userId: currentUser._id });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );
    };
  }, [currentUser?._id]);

  return (
    <div className="flex h-screen">
      <Sidebar
        selectedConversation={selectedConversation}
        setSelectedConversation={setSelectedConversation}
      />

      <ChatWindow conversationId={selectedConversation} />
    </div>
  );
}