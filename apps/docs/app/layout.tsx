import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import './globals.css';

export const metadata: Metadata = {
	title: 'Kalyx — Headless React DatePicker',
	description:
		'CSS 없이 설치 즉시 동작하고, 어떤 스타일링 방식으로도 자유롭게 커스터마이징 가능한 React DatePicker',
};

const NAV_ITEMS = [
	{ href: '/', label: 'Home' },
	{ href: '/playground', label: 'Playground' },
	{ href: '/datepicker', label: 'DatePicker' },
	{ href: '/rangepicker', label: 'RangePicker' },
	{ href: '/timepicker', label: 'TimePicker' },
	{ href: '/datetimepicker', label: 'DateTimePicker' },
	{ href: '/monthpicker', label: 'MonthPicker' },
	{ href: '/yearpicker', label: 'YearPicker' },
	{ href: '/weekpicker', label: 'WeekPicker' },
];

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="ko">
			<body>
				<div className="layout">
					<aside className="sidebar">
						<div className="brand">
							<h1>Kalyx</h1>
							<p>Headless React DatePicker</p>
						</div>
						<nav>
							<ul>
								{NAV_ITEMS.map((item) => (
									<li key={item.href}>
										<Link href={item.href}>{item.label}</Link>
									</li>
								))}
							</ul>
						</nav>
					</aside>
					<main className="content">{children}</main>
				</div>
			</body>
		</html>
	);
}
