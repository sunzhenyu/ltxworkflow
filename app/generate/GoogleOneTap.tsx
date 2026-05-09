"use client";

import Script from "next/script";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef } from "react";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: object) => void;
          prompt: () => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const fired = useRef(false);

  if (status === "loading" || session) return null;

  async function handleCredential(response: { credential: string }) {
    const result = await signIn("google-one-tap", {
      credential: response.credential,
      redirect: false,
    });
    if (result?.ok) router.refresh();
  }

  function onLoad() {
    if (fired.current || !window.google) return;
    fired.current = true;
    setTimeout(() => {
      window.google!.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredential,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google!.accounts.id.prompt();
    }, 1500);
  }

  return (
    <Script
      src="https://accounts.google.com/gsi/client"
      strategy="afterInteractive"
      onLoad={onLoad}
    />
  );
}
