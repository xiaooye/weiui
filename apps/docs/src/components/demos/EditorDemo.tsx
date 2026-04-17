"use client";

import { Editor } from "@weiui/react";

export function EditorDemo() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <Editor
        defaultValue="<h2>Welcome to WeiUI Editor</h2><p>Try formatting this text. Select a word and click <strong>B</strong>, <em>I</em>, or the list buttons in the toolbar.</p><ul><li>Rich text formatting</li><li>Keyboard shortcuts</li><li>Accessible toolbar</li></ul>"
        placeholder="Start typing..."
      />
    </div>
  );
}
