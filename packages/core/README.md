# @civaria/core

Framework-neutral behavior and semantic contracts for Civaria. This package contains no React, Vue, Solid or Svelte imports and is safe to import during SSR.

The public surface intentionally exposes semantic controllers, component anatomy, generic DOM props and the component registry. Framework adapters translate these contracts into their native event, lifecycle, ref and rendering models.
