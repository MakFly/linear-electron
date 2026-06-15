const GRAY = '#8A8F98';
const ORANGE = '#FB7A47';

// Linear-style priority glyphs: dots (none), bar chart (low/medium/high), orange box (urgent).
export function PriorityIcon({ priority, className }: { priority: number; className?: string }) {
    const size = { width: 16, height: 16, viewBox: '0 0 16 16', className } as const;

    if (priority === 1) {
        return (
            <svg {...size} aria-hidden>
                <rect x={1} y={1} width={14} height={14} rx={4} fill={ORANGE} />
                <path d="M8 4.5v4" stroke="#fff" strokeWidth={1.6} strokeLinecap="round" />
                <circle cx={8} cy={11.2} r={1} fill="#fff" />
            </svg>
        );
    }

    if (priority === 0) {
        return (
            <svg {...size} aria-hidden>
                <rect x={2} y={7.25} width={2.5} height={1.5} rx={0.75} fill={GRAY} />
                <rect x={6.75} y={7.25} width={2.5} height={1.5} rx={0.75} fill={GRAY} />
                <rect x={11.5} y={7.25} width={2.5} height={1.5} rx={0.75} fill={GRAY} />
            </svg>
        );
    }

    // 2 = high (3 bars), 3 = medium (2 bars), 4 = low (1 bar)
    const filled = priority === 2 ? 3 : priority === 3 ? 2 : 1;
    const bars = [
        { x: 1.5, y: 8, h: 6 },
        { x: 6.5, y: 5, h: 9 },
        { x: 11.5, y: 2, h: 12 },
    ];

    return (
        <svg {...size} aria-hidden>
            {bars.map((b, i) => (
                <rect key={i} x={b.x} y={b.y} width={3} height={b.h} rx={1} fill={GRAY} opacity={i < filled ? 1 : 0.35} />
            ))}
        </svg>
    );
}
