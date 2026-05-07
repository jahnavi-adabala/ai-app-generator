"use client";

import { useEffect, useState } from "react";
import { AuthPanel } from "@/components/AuthPanel";
import { AppGenerator } from "@/components/AppGenerator";
import { getToken } from "@/lib/api";

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    setAuthenticated(Boolean(getToken()));
  }, []);

  if (!authenticated) {
    return <AuthPanel onAuth={() => setAuthenticated(true)} />;
  }

  return <AppGenerator onLogout={() => setAuthenticated(false)} />;
}
