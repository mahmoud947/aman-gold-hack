"use client";
import { createContext, useCallback, useContext, useState } from "react";

export type ScreenName = "home" | "landing" | "onboarding" | "dashboard" | "buy" | "sell" | "portfolio" | "transactions" | "txDetail" | "profile" | "dailyPnl" | "cash";
export interface Route { name: ScreenName; params?: Record<string, string> }

interface Nav {
  route: Route; canBack: boolean;
  push: (name: ScreenName, params?: Record<string, string>) => void;
  pop: () => void;
  /** Replace the whole stack (used by the Gold tab bar and after flows complete). */
  reset: (name: ScreenName, params?: Record<string, string>) => void;
}
const Ctx = createContext<Nav | null>(null);
export const useNav = () => { const n = useContext(Ctx); if (!n) throw new Error("NavProvider missing"); return n; };

export function NavProvider({ children }: { children: React.ReactNode }) {
  const [stack, setStack] = useState<Route[]>([{ name: "home" }]);
  const push = useCallback((name: ScreenName, params?: Record<string, string>) => setStack((s) => [...s, { name, params }]), []);
  const pop = useCallback(() => setStack((s) => (s.length > 1 ? s.slice(0, -1) : s)), []);
  const reset = useCallback((name: ScreenName, params?: Record<string, string>) => setStack(name === "home" ? [{ name: "home" }] : [{ name: "home" }, { name, params }]), []);
  return <Ctx.Provider value={{ route: stack[stack.length - 1], canBack: stack.length > 1, push, pop, reset }}>{children}</Ctx.Provider>;
}
