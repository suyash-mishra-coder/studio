import type { SVGProps } from "react";

export const Logo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M12 12l-8-8" />
    <path d="M20 4l-8 8" />
    <path d="M12 12v8" />
    <path d="M12 12H4" />
    <path d="M12 12h8" />
  </svg>
);
