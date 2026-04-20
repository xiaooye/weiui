"use client";
import {
  ToggleGroup,
  ToggleGroupItem,
  Switch,
  Button,
  Kbd,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@weiui/react";
import { useInteractionManager, type ZoomLevel } from "../lib/interaction-manager";

export interface ComposerAppBarProps {
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onOpenPalette: () => void;
}

export function ComposerAppBar({
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onOpenPalette,
}: ComposerAppBarProps) {
  const im = useInteractionManager();
  return (
    <TooltipProvider>
      <div
        className="wui-composer__appbar"
        role="toolbar"
        aria-label="Composer actions"
      >
        <Tooltip>
          <TooltipTrigger>
            <Button
              size="sm"
              variant="ghost"
              iconOnly
              disabled={!canUndo}
              onClick={onUndo}
              aria-label="Undo"
            >
              {"\u21B6"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Undo <Kbd>{"\u2318"}Z</Kbd>
          </TooltipContent>
        </Tooltip>
        <Tooltip>
          <TooltipTrigger>
            <Button
              size="sm"
              variant="ghost"
              iconOnly
              disabled={!canRedo}
              onClick={onRedo}
              aria-label="Redo"
            >
              {"\u21B7"}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            Redo <Kbd>{"\u2318"}{"\u21E7"}Z</Kbd>
          </TooltipContent>
        </Tooltip>
        <span className="wui-composer__appbar-sep" aria-hidden="true" />
        <ToggleGroup
          type="single"
          size="sm"
          value={String(im.state.zoom)}
          onChange={(v) => {
            const next = Array.isArray(v) ? v[0] : v;
            if (next) im.setZoom(Number(next) as ZoomLevel);
          }}
          label="Zoom"
        >
          {[50, 75, 100, 125, 150].map((z) => (
            <ToggleGroupItem key={z} value={String(z)}>
              {z}%
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="wui-composer__appbar-sep" aria-hidden="true" />
        <ToggleGroup
          type="single"
          size="sm"
          value={im.state.theme}
          onChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v;
            im.setTheme((val as "auto" | "light" | "dark") || "auto");
          }}
          label="Stage theme"
        >
          <ToggleGroupItem value="auto">Auto</ToggleGroupItem>
          <ToggleGroupItem value="light">Light</ToggleGroupItem>
          <ToggleGroupItem value="dark">Dark</ToggleGroupItem>
        </ToggleGroup>
        <span className="wui-composer__appbar-sep" aria-hidden="true" />
        <label className="wui-composer__appbar-switch">
          <Switch
            checked={im.state.previewMode}
            onChange={(e) => im.setPreviewMode(e.currentTarget.checked)}
          />
          Preview
        </label>
        <label className="wui-composer__appbar-switch">
          <Switch
            checked={im.state.rulers}
            onChange={(e) => im.setRulers(e.currentTarget.checked)}
          />
          Rulers
        </label>
        <span className="wui-composer__appbar-spacer" />
        <Button size="sm" variant="outline" onClick={onOpenPalette}>
          Commands <Kbd>{"\u2318"}K</Kbd>
        </Button>
      </div>
    </TooltipProvider>
  );
}
