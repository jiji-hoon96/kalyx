import "@testing-library/jest-dom";
import { expect } from "vitest";
import { toHaveNoViolations } from "jest-axe";
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

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
