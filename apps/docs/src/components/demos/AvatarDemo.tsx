"use client";

import { Avatar, AvatarImage, AvatarFallback } from "@weiui/react";

export function AvatarDemo() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--wui-spacing-3)",
        flexWrap: "wrap",
      }}
    >
      <Avatar size="sm">
        <AvatarFallback>SM</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>MD</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>LG</AvatarFallback>
      </Avatar>
      <Avatar size="xl">
        <AvatarImage
          src="https://i.pravatar.cc/96?img=12"
          alt="Avatar photo"
          loading="lazy"
        />
        <AvatarFallback>XL</AvatarFallback>
      </Avatar>
    </div>
  );
}
