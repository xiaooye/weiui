# @civaria/css

## 0.1.0

### Minor Changes

- d84d1cd: Add a canonical `civ-theme` cascade slot for product-level semantic token overrides and make the framework-agnostic CSS consumption path explicit for non-React hosts.
- 8765340: Add a build-time config layer for deterministic on-demand CSS bundles, real fragment subpath outputs, automatic element dependency closure, and a zero-runtime-JavaScript `civaria-css` bundle CLI.

## 0.0.1

- Initial pre-release: zero-JavaScript CSS layer for 65 components, cascade layers (`civ-reset`, `civ-tokens`, `civ-base`, `civ-elements`, `civ-utilities`), OKLCH color space, logical properties throughout, and `prefers-reduced-motion` guards on all animations.
