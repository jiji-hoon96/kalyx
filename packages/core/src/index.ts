// @kalyx/core — 날짜 계산 로직 (플랫폼 독립)
// 구현은 Phase 1에서 진행

export type ISODateString = string;

export type DisabledRule =
	| { date: ISODateString }
	| { before: ISODateString }
	| { after: ISODateString }
	| { dayOfWeek: number[] };

export type {};
