"use client";

import { Editor } from "@weiui/react/editor";

export default function EditorDemoInner() {
  return (
    <div style={{ inlineSize: "100%" }}>
      <Editor
        defaultValue={
          "<h2>Welcome to WeiUI Editor</h2>" +
          "<p>Try formatting this text. Select a word and click <strong>B</strong>, <em>I</em>, or the list buttons.</p>" +
          "<ul><li>Rich text formatting</li><li>Image upload hook</li><li>Markdown export</li><li>Undo / redo</li><li>Syntax-highlighted code blocks</li></ul>" +
          "<pre><code class=\"language-ts\">const hello = (name: string) => `Hi, ${name}!`;</code></pre>"
        }
        placeholder="Start typing..."
        showCount
      />
    </div>
  );
}
