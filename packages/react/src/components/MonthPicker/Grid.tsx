import { useCallback, useMemo } from "react";
import type { HTMLAttributes } from "react";
import { getMonthName } from "@kalyx/core";
import { useDatePickerContext } from "../../context/DatePickerContext.js";

export interface MonthPickerGridClassNames {
	root?: string;
	header?: string;
	title?: string;
	navButton?: string;
	grid?: string;
	gridRow?: string;
	month?: string;
	monthSelected?: string;
	monthCurrent?: string;
	monthDisabled?: string;
}

export interface MonthPickerGridProps
	extends Omit<HTMLAttributes<HTMLDivElement>, "role"> {
	classNames?: MonthPickerGridClassNames;
}

/**
 * MonthPicker.Grid — 12-month commit grid. Clicking a month selects it and closes the popover.
 *
 * Unlike `DatePicker.MonthGrid` (drilldown), this component commits the month selection
 * via `ctx.selectDate`, emitting the month-start ISO string.
 *
 * @example
 * ```tsx
 * <MonthPicker value={month} onChange={setMonth} displayFormat="yyyy-MM">
 *   <MonthPicker.Input />
 *   <MonthPicker.Popover>
 *     <MonthPicker.Grid />
 *   </MonthPicker.Popover>
 * </MonthPicker>
 * ```
 */
export function MonthPickerGrid({
	classNames,
	...props
}: MonthPickerGridProps) {
	const ctx = useDatePickerContext("MonthPicker.Grid");
	const { adapter, viewMonth, locale, value, displayTimezone, labels } = ctx;

	const currentYear = adapter.getYear(viewMonth);

	// Extract the value's year and month in the display timezone so highlighting
	// remains correct when storage is civil-midnight-in-tz (UTC-ISO form).
	const [valueYear, valueMonthZeroBased] = useMemo(() => {
		if (!value) return [null, null] as const;
		try {
			const [y, m] = adapter
				.format(value, "yyyy-MM", displayTimezone)
				.split("-")
				.map(Number);
			return [y!, m! - 1] as const;
		} catch {
			return [null, null] as const;
		}
	}, [value, adapter, displayTimezone]);

	const today = adapter.today(displayTimezone);
	const todayYear = adapter.getYear(today);
	const todayMonth = adapter.getMonth(today);

	const navigateYear = useCallback(
		(direction: number) => {
			ctx.setViewMonth(adapter.addYears(viewMonth, direction));
		},
		[adapter, viewMonth, ctx],
	);

	const handleMonthSelect = useCallback(
		(monthIndex: number) => {
			const target = new Date(
				Date.UTC(currentYear, monthIndex, 1),
			).toISOString();
			ctx.selectDate(target);
		},
		[currentYear, ctx],
	);

	const months = Array.from({ length: 12 }, (_, i) => ({
		index: i,
		name: getMonthName(i, locale),
		isSelected: valueYear === currentYear && valueMonthZeroBased === i,
		isCurrent: todayYear === currentYear && todayMonth === i,
	}));

	return (
		<div className={classNames?.root} {...props}>
			<div className={classNames?.header}>
				<button
					type="button"
					className={classNames?.navButton}
					onClick={() => navigateYear(-1)}
					aria-label={labels.prevYear}
				>
					&lt;
				</button>
				<span className={classNames?.title}>{currentYear}</span>
				<button
					type="button"
					className={classNames?.navButton}
					onClick={() => navigateYear(1)}
					aria-label={labels.nextYear}
				>
					&gt;
				</button>
			</div>

			<div
				role="grid"
				aria-label={`${currentYear} months`}
				className={classNames?.grid}
			>
				{Array.from({ length: 4 }, (_, rowIndex) => (
					<div
						key={rowIndex}
						role="row"
						className={classNames?.gridRow}
						style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)" }}
					>
						{months.slice(rowIndex * 3, rowIndex * 3 + 3).map((m) => {
							const monthClass =
								[
									classNames?.month,
									m.isSelected && classNames?.monthSelected,
									m.isCurrent && classNames?.monthCurrent,
								]
									.filter(Boolean)
									.join(" ") || undefined;

							return (
								<button
									key={m.index}
									type="button"
									role="gridcell"
									aria-selected={m.isSelected || undefined}
									aria-current={m.isCurrent ? "date" : undefined}
									data-selected={m.isSelected || undefined}
									data-current={m.isCurrent || undefined}
									className={monthClass}
									onClick={() => handleMonthSelect(m.index)}
								>
									{m.name}
								</button>
							);
						})}
					</div>
				))}
			</div>
		</div>
	);
}
