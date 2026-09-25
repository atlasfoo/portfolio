/**
 * `AstroContainer.create()` starts with an empty renderer list — any
 * `.astro` component it renders that mounts a `client:*` framework island
 * (`HeroTerminal`, `ProjectsGrid`, `ArchitectureDiagram`, ...) throws
 * `NoMatchingRenderer` unless the React renderer is registered on that
 * specific container instance. Tests call `AstroContainer.create()` with no
 * arguments (see e.g. `Hero.test.ts`), so there is no per-test call site to
 * pass `renderers` to. Patching the static factory here, once, makes every
 * container test-wide auto-register the React renderer — additive only, it
 * doesn't change behavior for `.astro` components that mount no island.
 *
 * Guarded to the (default) node environment: the island component tests
 * (`HeroTerminal.test.tsx` & co.) opt into `// @vitest-environment jsdom`
 * and never touch `AstroContainer`. Running this setup's dynamic
 * `astro:react:opts` resolution under jsdom trips an unrelated
 * jsdom/esbuild `TextEncoder` incompatibility, so it's skipped there.
 */
if (typeof window === 'undefined') {
  const { getContainerRenderer } = await import(
    '@astrojs/react/container-renderer'
  );
  const { experimental_AstroContainer: AstroContainer } = await import(
    'astro/container'
  );
  const { loadRenderers } = await import('astro:container');

  const originalCreate = AstroContainer.create.bind(AstroContainer);

  AstroContainer.create = (async (options = {}) => {
    const reactRenderers = await loadRenderers([getContainerRenderer()]);
    return originalCreate({
      ...options,
      renderers: [...reactRenderers, ...(options.renderers ?? [])],
    });
  }) as typeof AstroContainer.create;
}

export {};
