// client/src/auth/FavoritesContext.tsx
//
// App-wide favorites ("Merkliste") state so any event card or popup can show
// the correct heart and toggle it. Loads the logged-in user's favorites once
// and keeps an id Set for O(1) lookups.
//
// `useFavorites()` returns a SAFE DEFAULT when used outside a provider
// (enabled=false), so presentational components/tests that render without a
// FavoritesProvider simply show no heart instead of crashing.

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { EventDTO } from "../../../shared/types";
import { useAuth } from "./AuthContext";
import {
  addFavorite,
  fetchFavorites,
  removeFavorite,
} from "@/lib/favorites";

interface FavoritesContextValue {
  /** True only when a user is logged in (hearts should show). */
  enabled: boolean;
  /** Full favorited events, newest first (for the profile list). */
  events: EventDTO[];
  isFavorite: (eventId: string) => boolean;
  toggle: (eventId: string) => Promise<void>;
}

const defaultValue: FavoritesContextValue = {
  enabled: false,
  events: [],
  isFavorite: () => false,
  toggle: async () => {},
};

const FavoritesContext = createContext<FavoritesContextValue | undefined>(
  undefined,
);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [ids, setIds] = useState<Set<string>>(new Set());

  const load = useCallback(async () => {
    const list = await fetchFavorites();
    setEvents(list);
    setIds(new Set(list.map((e) => e.id)));
  }, []);

  // Load on login; clear on logout.
  useEffect(() => {
    if (!user) {
      setEvents([]);
      setIds(new Set());
      return;
    }
    load().catch(() => {
      setEvents([]);
      setIds(new Set());
    });
  }, [user, load]);

  const isFavorite = useCallback((eventId: string) => ids.has(eventId), [ids]);

  const toggle = useCallback(
    async (eventId: string) => {
      const has = ids.has(eventId);
      // Optimistic heart update for instant feedback.
      setIds((prev) => {
        const next = new Set(prev);
        if (has) next.delete(eventId);
        else next.add(eventId);
        return next;
      });
      try {
        if (has) await removeFavorite(eventId);
        else await addFavorite(eventId);
      } finally {
        // Reconcile the full list (and ids) with the server.
        await load().catch(() => {});
      }
    },
    [ids, load],
  );

  const value = useMemo(
    () => ({ enabled: !!user, events, isFavorite, toggle }),
    [user, events, isFavorite, toggle],
  );

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useFavorites(): FavoritesContextValue {
  return useContext(FavoritesContext) ?? defaultValue;
}
