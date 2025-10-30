import type { SVGProps } from 'react';

type SvgProps = SVGProps<SVGSVGElement>;

const baseProps: SvgProps = {
  viewBox: '0 0 24 24',
  fill: 'none',
};

export const ProblemIconER = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="7" width="18" height="12" rx="4" fill="#ffffff" />
    <path d="M12 10v6M9 13h6" stroke="#7165d8" strokeWidth={2.5} strokeLinecap="round" />
  </svg>
);

export const ProblemIconBus = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="6" width="18" height="10" rx="2" fill="#ffffff" />
    <circle cx="8" cy="18" r="2" fill="#5a87c6" />
    <circle cx="16" cy="18" r="2" fill="#5a87c6" />
    <path d="M6 9h12" stroke="#5a87c6" strokeWidth={2} strokeLinecap="round" />
    <path d="M9 6v3M15 6v3" stroke="#5a87c6" strokeWidth={1.5} strokeLinecap="round" />
  </svg>
);

export const InsightIconPerspectives = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="3" fill="#d4a853" />
    <path d="M12 5v2M12 17v2M5 12h2M17 12h2" stroke="#d4a853" strokeWidth={2} strokeLinecap="round" />
    <path
      d="M7.05 7.05l1.41 1.41M15.54 15.54l1.41 1.41M7.05 16.95l1.41-1.41M15.54 8.46l1.41-1.41"
      stroke="#d4a853"
      strokeWidth={1.5}
      strokeLinecap="round"
    />
  </svg>
);

export const InsightIconTensions = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 3v18" stroke="#d47a97" strokeWidth={2} strokeLinecap="round" />
    <path d="M5 12h14" stroke="#d47a97" strokeWidth={2} strokeLinecap="round" />
    <circle cx="8" cy="8" r="2" fill="#d47a97" opacity={0.8} />
    <circle cx="16" cy="16" r="2" fill="#d47a97" opacity={0.8} />
  </svg>
);

export const InsightIconOpportunities = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <path d="M12 2l3 7h7l-5.5 4 2 7-6.5-4.5L5.5 20l2-7L2 9h7z" fill="#6ab59d" opacity={0.3} />
    <circle cx="12" cy="12" r="3" fill="#6ab59d" />
  </svg>
);

export const InsightIconBlindspots = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" stroke="#9d8ed4" strokeWidth={2} />
    <path d="M12 16v-4" stroke="#9d8ed4" strokeWidth={2} strokeLinecap="round" />
    <circle cx="12" cy="8" r="1.5" fill="#9d8ed4" />
  </svg>
);

export const TeamIconGold = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="10" r="3" fill="#d4a853" />
    <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#d4a853" opacity={0.6} />
  </svg>
);

export const TeamIconPink = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="10" r="3" fill="#d47a97" />
    <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#d47a97" opacity={0.6} />
  </svg>
);

export const TeamIconGreen = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="10" r="3" fill="#6ab59d" />
    <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#6ab59d" opacity={0.6} />
  </svg>
);

export const TeamIconPurple = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="10" r="3" fill="#9d8ed4" />
    <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#9d8ed4" opacity={0.6} />
  </svg>
);

export const TeamIconBlue = (props: SvgProps) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="10" r="3" fill="#6a9dd4" />
    <path d="M6 20c0-4 2.5-6 6-6s6 2 6 6" fill="#6a9dd4" opacity={0.6} />
  </svg>
);
