/**
 * Vitest stub for @stackblitz/sdk.
 * Returns a no-op `openProject` so Playground tests can assert the call
 * without actually opening a sandbox.
 */
const openProject = (
  ..._args: unknown[]
): void => {
  // intentionally empty
};

const sdk = { openProject };

export default sdk;
export { openProject };
