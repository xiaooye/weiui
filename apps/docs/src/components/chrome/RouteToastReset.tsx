"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { toast } from "@weiui/react";

/**
 * Clears the global toast store whenever the pathname changes so
 * notifications raised on one route do not linger after navigation.
 */
export function RouteToastReset() {
  const pathname = usePathname();
  useEffect(() => {
    toast.dismiss();
  }, [pathname]);
  return null;
}
