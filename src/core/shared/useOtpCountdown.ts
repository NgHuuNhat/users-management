import { useEffect, useState } from "react";

export function useOtpCountdown(expiresAt: number) {
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (!expiresAt) {
      setCountdown(0);
      return;
    }

    const update = () => {
      setCountdown(Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000)));
    };

    update();

    const timer = setInterval(update, 1000);

    return () => clearInterval(timer);
  }, [expiresAt]);

  return {
    countdown,
    isExpired: countdown === 0,
  };
}