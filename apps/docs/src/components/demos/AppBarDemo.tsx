"use client";

import { useState } from "react";
import { AppBar, AppBarBrand, AppBarNav, AppBarLink, AppBarActions, Button } from "civaria";

const NAV_ITEMS = ["Dashboard", "Projects", "Team", "Settings"];

export function AppBarDemo() {
  const [active, setActive] = useState("Dashboard");

  return (
    <div style={{ width: "100%" }}>
      <AppBar>
        <AppBarBrand>
          <strong>Civaria</strong>
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
          <Button variant="ghost" size="sm">
            Sign out
          </Button>
        </AppBarActions>
      </AppBar>
    </div>
  );
}
