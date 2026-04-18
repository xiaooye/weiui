"use client";

import { Avatar, AvatarGroup, AvatarImage, AvatarFallback } from "@weiui/react";

export function AvatarGroupDemo() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--wui-spacing-4)" }}>
      <AvatarGroup max={4}>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/64?img=1" alt="Ana" />
          <AvatarFallback>AN</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/64?img=2" alt="Ben" />
          <AvatarFallback>BE</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarImage src="https://i.pravatar.cc/64?img=3" alt="Cai" />
          <AvatarFallback>CA</AvatarFallback>
        </Avatar>
        <Avatar name="Diana Li" />
        <Avatar name="Emil Gerova" />
        <Avatar name="Fan Sung" />
        <Avatar name="Gabor Kovacs" />
      </AvatarGroup>
      <AvatarGroup max={3}>
        <Avatar size="sm" name="Hugo Quan" />
        <Avatar size="sm" name="Isa Park" />
        <Avatar size="sm" name="Jin Wang" />
        <Avatar size="sm" name="Kay Otis" />
      </AvatarGroup>
    </div>
  );
}
