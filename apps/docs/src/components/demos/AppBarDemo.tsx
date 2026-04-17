"use client";

import { useState } from "react";
import { AppBar, AppBarBrand, AppBarNav, AppBarLink, AppBarActions } from "@weiui/react";

const NAV_ITEMS = ["Dashboard", "Projects", "Team", "Settings"];

export function AppBarDemo() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div style={{ width: "100%" }}>
      <AppBar>
        <AppBarBrand>
          <strong>WeiUI</strong>
        </AppBarBrand>
        <AppBarNav aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <AppBarLink
              key={item}
              active={active === item}
              onClick={() => setActive(item)}
            >
              {item}
            </AppBarLink>
          ))}
        </AppBarNav>
        <AppBarActions>
          <button className="wui-button wui-button--ghost wui-button--sm" type="button">
            Sign out
          </button>
        </AppBarActions>
      </AppBar>
    </div>
  );
}
