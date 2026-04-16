export function announce(message: string, priority: "polite" | "assertive" = "polite"): void {
  const id = `wui-live-region-${priority}`;
  let region = document.getElementById(id);

  if (!region) {
    region = document.createElement("div");
    region.id = id;
    region.setAttribute("role", priority === "assertive" ? "alert" : "status");
    region.setAttribute("aria-live", priority);
    region.setAttribute("aria-atomic", "true");
    region.className = "wui-sr-only";
    document.body.appendChild(region);
  }

  region.textContent = "";
  requestAnimationFrame(() => {
    region!.textContent = message;
  });
}
