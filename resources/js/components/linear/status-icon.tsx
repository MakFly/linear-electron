import { IssueStatus, STATUS_META } from '@/lib/issues';

const RING = { cx: 7, cy: 7, r: 5.5, strokeWidth: 1.5, fill: 'none' } as const;

// Linear-style status glyphs: dashed ring (backlog), empty ring (todo),
// partially-filled pie (in progress), filled circle with check/cross (done/canceled).
export function StatusIcon({ status, className }: { status: IssueStatus; className?: string }) {
    const color = STATUS_META[status].color;
    const size = { width: 14, height: 14, viewBox: '0 0 14 14', className } as const;

    switch (status) {
        case 'backlog':
            return (
                <svg {...size} aria-hidden>
                    <circle {...RING} stroke={color} strokeDasharray="1.8 1.9" />
                </svg>
            );
        case 'todo':
            return (
                <svg {...size} aria-hidden>
                    <circle {...RING} stroke={color} />
                </svg>
            );
        case 'in_progress':
            return (
                <svg {...size} aria-hidden>
                    <circle {...RING} stroke={color} />
                    <circle
                        cx={7}
                        cy={7}
                        r={1.75}
                        fill="none"
                        stroke={color}
                        strokeWidth={3.5}
                        strokeDasharray={`${Math.PI * 1.75} ${Math.PI * 3.5}`}
                        transform="rotate(-90 7 7)"
                    />
                </svg>
            );
        case 'done':
            return (
                <svg {...size} aria-hidden>
                    <circle cx={7} cy={7} r={6} fill={color} />
                    <path d="M4.2 7.2l1.9 1.9 3.7-4" stroke="#fff" strokeWidth={1.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            );
        case 'canceled':
            return (
                <svg {...size} aria-hidden>
                    <circle cx={7} cy={7} r={6} fill={color} />
                    <path d="M4.8 4.8l4.4 4.4M9.2 4.8l-4.4 4.4" stroke="#0F1011" strokeWidth={1.4} strokeLinecap="round" />
                </svg>
            );
    }
}
