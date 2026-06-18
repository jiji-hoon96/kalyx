import { describe, it, expect } from 'vitest';
import { runAdapterConformanceTests } from '@kalyx/core/test-helpers';
import { DateFnsAdapter } from '../index.js';

// The reference adapter must satisfy the published DateAdapter contract. This is
// also the first real consumer of @kalyx/core/test-helpers — it proves the
// conformance suite is usable as an external import, not just an internal file.
runAdapterConformanceTests(DateFnsAdapter, { describe, it, expect });
