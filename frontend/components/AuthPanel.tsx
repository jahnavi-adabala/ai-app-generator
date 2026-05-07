"use client";

import { LogIn, UserPlus } from "lucide-react";
import { FormEvent, useState } from "react";
import { api } from "@/lib/api";

type Props = {
  onAuth: () => void;
};

export function AuthPanel({ onAuth }: Props) {
  const [mode, setMode] = useState<"login" | "register">("register");
  const [email, setEmail] = useState("jahnavi@example.com");
  const [password, setPassword] = useState("password123");
  const [name, setName] = useState("Jahnavi");
  const [error, setError] = useState("");

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const result = await api<{ token: string }>(`/api/auth/${mode}`, {
        method: "POST",
        body: JSON.stringify({ email, password, name })
      });
      localStorage.setItem("token", result.token);
      onAuth();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    }
  }

  async function googleDemo() {
    const result = await api<{ token: string }>("/api/auth/oauth/google", {
      method: "POST",
      body: JSON.stringify({ email: "google-user@example.com", name: "Google Demo User" })
    });
    localStorage.setItem("token", result.token);
    onAuth();
  }

  return (
    <section className="mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-8 px-5 py-8 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-teal-700">
          Track A demo
        </p>
        <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-ink md:text-6xl">
          AI App Generator
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-700">
          Generate a working app from JSON: dynamic forms, CRUD APIs, CSV import,
          multiple login methods, and event notifications.
        </p>
      </div>

      <form onSubmit={submit} className="rounded-lg border border-line bg-white p-5 shadow-sm">
        <div className="mb-5 flex rounded-md border border-line bg-panel p-1">
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium ${
              mode === "register" ? "bg-white shadow-sm" : "text-slate-600"
            }`}
          >
            <UserPlus size={16} /> Register
          </button>
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex flex-1 items-center justify-center gap-2 rounded px-3 py-2 text-sm font-medium ${
              mode === "login" ? "bg-white shadow-sm" : "text-slate-600"
            }`}
          >
            <LogIn size={16} /> Login
          </button>
        </div>

        {mode === "register" && (
          <label className="mb-3 block text-sm font-medium">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
            />
          </label>
        )}
        <label className="mb-3 block text-sm font-medium">
          Email
          <input
            value={email}
            type="email"
            onChange={(event) => setEmail(event.target.value)}
            className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
          />
        </label>
        <label className="mb-4 block text-sm font-medium">
          Password
          <input
            value={password}
            type="password"
            onChange={(event) => setPassword(event.target.value)}
            className="focus-ring mt-1 w-full rounded-md border border-line px-3 py-2"
          />
        </label>

        {error && <p className="mb-3 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

        <button className="focus-ring flex w-full items-center justify-center gap-2 rounded-md bg-blue-700 px-4 py-2.5 font-semibold text-white">
          <LogIn size={18} /> Continue
        </button>
        <button
          type="button"
          onClick={googleDemo}
          className="focus-ring mt-3 w-full rounded-md border border-line bg-white px-4 py-2.5 font-semibold text-ink"
        >
          Continue with Google demo
        </button>
      </form>
    </section>
  );
}
