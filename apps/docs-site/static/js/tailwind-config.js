// Tailwind Play CDN configuration — scopes utility generation to .tw-enable
// wrappers so Tailwind classes only take effect inside the recipes that need
// them, keeping the rest of the Docusaurus layout untouched.
if (typeof window !== 'undefined' && window.tailwind) {
  window.tailwind.config = {
    darkMode: ['class', '[data-theme="dark"]'],
    important: '.tw-enable',
    corePlugins: {
      // Disable the global CSS reset so Tailwind doesn't fight Docusaurus.
      preflight: false,
    },
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: '#5b4fe1',
            light: '#7b71e8',
            dark: '#4a3ed3',
          },
        },
      },
    },
  };
}
