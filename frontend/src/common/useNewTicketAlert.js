import { useEffect, useRef, useState } from "react";
import { playBeep } from "./orderUtils";

// Diffs the set of order ids currently in `statusToWatch` against the last
// known set, and flashes/beeps when a genuinely new one appears. The first
// run only establishes the baseline so orders already on the board don't
// trigger a false alert on page load.
export function useNewTicketAlert(orders, statusToWatch, muted) {
  const knownIds = useRef(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    const currentIds = new Set(orders.filter((o) => o.status === statusToWatch).map((o) => o.id));
    if (knownIds.current === null) {
      knownIds.current = currentIds;
      return;
    }
    const hasNewTicket = [...currentIds].some((id) => !knownIds.current.has(id));
    if (hasNewTicket) {
      setFlash(true);
      setTimeout(() => setFlash(false), 1500);
      if (!muted) playBeep();
    }
    knownIds.current = currentIds;
  }, [orders, statusToWatch, muted]);

  return flash;
}
