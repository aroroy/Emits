"use client";

import "./app.css";
import "@appwrite.io/pink-icons";
import { useState } from "react";
import { account } from "@/lib/appwrite";
import { ID } from "appwrite";

function UserSignup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanEmail = email.trim();
    const cleanUsername = username.trim() || cleanEmail.split("@")[0];

    if (!cleanEmail || !password) {
      setError("Please provide email and password.");
      setSuccess("");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");
      setSuccess("");

      let createdNewAccount = false;

      try {
        await account.create(ID.unique(), cleanEmail, password, cleanUsername);
        createdNewAccount = true;
      } catch (createErr) {
        const accountExists = createErr?.code === 409;

        if (!accountExists) throw createErr;
      }

      try {
        await account.deleteSession("current");
      } catch {}

      await account.createEmailPasswordSession(cleanEmail, password);

      await account.createVerification(`${window.location.origin}/chat`);

      setSuccess(
        createdNewAccount
          ? "Account created. Verification email sent. Use that link to open messaging."
          : "Welcome back. Verification email sent. Use that link to open messaging."
      );
      setEmail("");
      setPassword("");
      setUsername("");
    } catch (err) {
      setError(err?.message || "Could not continue. Please try again.");
      setSuccess("");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="chatCard">
      <h1 className="chatTitle">Continue To Messaging</h1>

      <form className="messageForm" onSubmit={handleSubmit}>
        <input
          type="text"
          className="nameInput"
          placeholder="Username"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          disabled={isSubmitting}
        />
        <input
          type="email"
          className="messageInput"
          placeholder="Email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={isSubmitting}
        />
        <input
          type="password"
          className="messageInput"
          placeholder="Password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Checking account..." : "Continue"}
        </button>
      </form>

      {error && <p className="statusMessage error">{error}</p>}
      {success && <p className="statusMessage">{success}</p>}
    </section>
  );
}

export default UserSignup;