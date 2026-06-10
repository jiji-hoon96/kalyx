import "@testing-library/jest-dom";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

// Component tests import Roots / hooks directly from their source files,
// bypassing the @kalyx/react entry point that would normally install the
// default adapter. Importing the entry here triggers `setDefaultAdapter`
// once at suite startup so the existing test surface behaves identically.
// The headless entry test (__tests__/headless-entry) uses vi.resetModules()
// to opt out of this default for its own assertions.
import "../packages/react/src/index.js";

expect.extend(toHaveNoViolations);

afterEach(() => {
	cleanup();
});

// jsdom에 없는 API mock
global.ResizeObserver = class ResizeObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
};

global.IntersectionObserver = class IntersectionObserver {
	observe() {}
	unobserve() {}
	disconnect() {}
} as unknown as typeof IntersectionObserver;

Element.prototype.scrollIntoView = () => {};

// jsdom does not implement matchMedia; HeroDemo (and any prefers-reduced-motion
// consumer) reads it. Provide a no-op default that reports no match.
if (typeof window !== "undefined" && !window.matchMedia) {
	window.matchMedia = (query: string) =>
		({
			matches: false,
			media: query,
			onchange: null,
			addListener: () => {},
			removeListener: () => {},
			addEventListener: () => {},
			removeEventListener: () => {},
			dispatchEvent: () => false,
		}) as unknown as MediaQueryList;
}
