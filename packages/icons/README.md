# @weiui/icons

Tree-shakable SVG icons generated from source `.svg` files. Each icon is a React component rendered through a shared `Icon` primitive with `currentColor` stroke.

## Install

```bash
pnpm add @weiui/icons
```

## Usage

```tsx
import { Check, ChevronDown, Search } from "@weiui/icons";

<Check size={20} />
<ChevronDown aria-hidden />
<Search size="1.5rem" color="var(--wui-color-muted-foreground)" />
```

All icons accept any SVG attribute plus `size` (number | string) which applies to both `width` and `height`. Stroke inherits from `currentColor`.

## Icon set (61)

**Navigation & layout:** ArrowLeft, ArrowRight, ChevronDown, ChevronRight, Home, Menu, Grid, List, MoreHorizontal, MoreVertical.

**Actions:** Check, Copy, Edit, Trash, X, Plus, Minus, Download, Upload, Share, Refresh, ExternalLink, Link, Paperclip, Archive, Filter.

**Status & feedback:** AlertCircle, AlertTriangle, CheckCircle, XCircle, Info, HelpCircle, Zap.

**Content:** Heart, Star, Bookmark, Flag, Tag.

**User & communication:** User, Users, Mail, Phone, Globe, Bell, BellOff.

**Time:** Calendar, Clock.

**View & privacy:** Eye, EyeOff, Lock, Unlock, Search, Settings.

**Theme:** Sun, Moon.

**Media:** Play, Pause, Mic, MicOff, Volume2, VolumeX.

## Extending

Add new icons by dropping `.svg` files into `svg/` and running `pnpm generate`. The script sanitises with SVGO and emits React components into `src/icons/`.

## Spec

Feather-style stroke SVGs at `viewBox="0 0 24 24"` with `fill="none"`, `stroke="currentColor"`, `stroke-width="2"`, `stroke-linecap="round"`, `stroke-linejoin="round"`. All 61 ship in both ESM output and TypeScript declarations.
