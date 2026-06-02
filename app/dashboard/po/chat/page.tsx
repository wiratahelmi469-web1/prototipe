"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../../../context/AuthContext";
import Workspace from "../../../../components/Workspace";
import ChatKoordinasi from "../../../../components/ChatKoordinasi";

export default function POChatPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || user.role !== "po") {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <Workspace id="po_chat_workspace">
      <div className="space-y-6" id="po_chat_viewport">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-stone-900">💬 Chat Koordinasi</h2>
          <p className="text-xs text-stone-500 mt-1">
            Ruang komunikasi dan koordinasi antar tim EventHub Kampus.
          </p>
        </div>

        <ChatKoordinasi user={user} />
      </div>
    </Workspace>
  );
}
