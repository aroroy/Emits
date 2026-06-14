"use client";

import "./app.css";
import "@appwrite.io/pink-icons";
import { useEffect, useRef, useState } from "react";
import { databases } from "@/lib/appwrite";
import { ID, Query } from "appwrite";

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sender, setSender] = useState("");
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const messageListRef = useRef(null);
  const hasInitialScroll = useRef(false);

  useEffect(() => {
    const loadMessages = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await databases.listDocuments(
          process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
          process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID,
          [Query.orderAsc("$createdAt"), Query.limit(67)]
        );

        setMessages(Array.isArray(res.documents) ? res.documents : []);
      } catch (err) {
        setError(err?.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    loadMessages();
  }, []);

  useEffect(() => {
    if (loading || hasInitialScroll.current || !messageListRef.current) return;

    messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    hasInitialScroll.current = true;
  }, [loading, messages]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanSender = sender.trim();
    const cleanContent = content.trim();

    if (!cleanSender || !cleanContent || sending) return;

    try {
      setSending(true);
      setError("");

      const newMessage = await databases.createDocument(
        process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID,
        process.env.NEXT_PUBLIC_APPWRITE_MESSAGES_TABLE_ID,
        ID.unique(),
        {
          sender: cleanSender,
          content: cleanContent,
          isDirect: false,
          toDirect: null,
        }
      );

      setMessages((prev) => [...prev, newMessage]);
      setContent("");
    } catch (err) {
      setError(err?.message || "Failed to send message");
    } finally {
      setSending(false);
    }
  };

  return (
    <section className="chatCard">
      <h1 className="chatTitle">Emit</h1>

      <div className="chatContainer">
        {loading && <p className="statusMessage">Loading...</p>}
        {error && <p className="statusMessage error">{error}</p>}

        {!loading && !error && messages.length === 0 && <p className="statusMessage">No messages yet. Be the first one.</p>}

        <div className="messageList" aria-live="polite" ref={messageListRef}>
          {!loading &&
            messages.map((msg) => (
              <article className="messageItem" key={msg.$id}>
                <p className="messageText">
                  {msg.sender} • {new Date(msg.$createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  <br />
                  {msg.content}
                </p>
              </article>
            ))}
        </div>
      </div>
      <form className="messageForm" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Your name..."
          className="nameInput"
          value={sender}
          onChange={(event) => setSender(event.target.value)}
        />
        <input
          type="text"
          placeholder="Type your message..."
          className="messageInput"
          value={content}
          onChange={(event) => setContent(event.target.value)}
        />
        <button type="submit" disabled={sending || !sender.trim() || !content.trim()}>
          {sending ? "Sending..." : "Send"}
        </button>
      </form>

    </section>
  );
}

export default ChatPage;