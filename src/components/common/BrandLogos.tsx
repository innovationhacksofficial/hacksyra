"use client";

import React from "react";

export function MicrosoftLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2 group cursor-default">
      <svg className={className} viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="11" height="11" fill="#F25022" />
        <rect x="12" width="11" height="11" fill="#7FBA00" />
        <rect y="12" width="11" height="11" fill="#00A4EF" />
        <rect x="12" y="12" width="11" height="11" fill="#FFB900" />
      </svg>
      <span className="font-semibold text-sm sm:text-base text-slate-700 tracking-tight">Microsoft</span>
    </div>
  );
}

export function GoogleLogo({ className = "h-5 sm:h-6 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 272 92" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M115.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18C71.25 34.32 81.24 25 93.5 25s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44S80.99 39.2 80.99 47.18c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#EA4335" />
      <path d="M163.75 47.18c0 12.77-9.99 22.18-22.25 22.18s-22.25-9.41-22.25-22.18c0-12.85 9.99-22.18 22.25-22.18s22.25 9.32 22.25 22.18zm-9.74 0c0-7.98-5.79-13.44-12.51-13.44s-12.51 5.46-12.51 13.44c0 7.9 5.79 13.44 12.51 13.44s12.51-5.55 12.51-13.44z" fill="#FBBC05" />
      <path d="M209.75 26.34v39.82c0 16.38-9.66 23.07-21.08 23.07-10.75 0-17.22-7.19-19.66-13.07l8.48-3.53c1.51 3.61 5.21 7.87 11.17 7.87 7.31 0 11.84-4.51 11.84-13v-3.19h-.34c-2.18 2.69-6.38 5.04-11.68 5.04-11.09 0-21.25-9.66-21.25-22.09 0-12.52 10.16-22.26 21.25-22.26 5.29 0 9.49 2.35 11.68 4.96h.34v-3.61h9.25zm-8.56 20.92c0-7.81-5.21-13.52-11.84-13.52-6.72 0-12.35 5.71-12.35 13.52 0 7.73 5.63 13.36 12.35 13.36 6.63 0 11.84-5.63 11.84-13.36z" fill="#4285F4" />
      <path d="M225 3v65h-9.5V3h9.5z" fill="#34A853" />
      <path d="M262.02 54.48l7.56 5.04c-2.44 3.61-8.32 9.83-18.48 9.83-12.6 0-22.01-9.74-22.01-22.18 0-13.19 9.49-22.18 20.92-22.18 11.51 0 17.14 9.16 18.98 14.11l1.01 2.52-29.65 12.28c2.27 4.45 5.8 6.72 10.75 6.72 4.96 0 8.4-2.44 10.92-6.14zm-23.27-7.98l19.82-8.23c-1.09-2.77-4.37-4.7-8.23-4.7-4.95 0-11.84 4.37-11.59 12.93z" fill="#EA4335" />
      <path d="M35.29 41.41V32H67c.31 1.64.47 3.58.47 5.68 0 7.06-1.93 15.79-8.15 22.01-6.05 6.3-13.78 9.66-24.02 9.66C16.05 69.35 0 53.81 0 34.68 0 15.54 16.05 0 35.29 0c10.42 0 17.9 4.09 23.51 9.47l-6.61 6.61c-4.03-3.78-9.49-6.7-16.9-6.7-13.78 0-24.53 11.17-24.53 25.3 0 14.11 10.75 25.29 24.53 25.29 8.91 0 13.95-3.56 17.19-6.8 1.77-1.77 2.95-4.29 3.42-7.76H35.29z" fill="#4285F4" />
    </svg>
  );
}

export function MetaBrandLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2 group cursor-default">
      <svg className={className} viewBox="0 0 39.5 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M19.74 7.42c-2.4-3.8-5.3-5.74-8.8-5.74-6.3 0-10.94 5.3-10.94 12.02 0 6.6 4.6 12 10.94 12 4.2 0 7.3-2.3 9.4-6.3 2.1 4 5.2 6.3 9.4 6.3 6.3 0 10.9-5.4 10.9-12 0-6.72-4.6-12.02-10.9-12.02-3.5 0-6.4 1.94-8.8 5.74zm7.4 13.78c-3.7 0-6.7-3.1-8.5-7.7 1.8-4.6 4.8-7.7 8.5-7.7 4.1 0 7.2 3.4 7.2 7.7 0 4.3-3.1 7.7-7.2 7.7zm-14.8 0c-4.1 0-7.2-3.4-7.2-7.7 0-4.3 3.1-7.7 7.2-7.7 3.7 0 6.7 3.1 8.5 7.7-1.8 4.6-4.8 7.7-8.5 7.7z" fill="#0081FB" />
      </svg>
      <span className="font-bold text-base text-slate-800 tracking-tight">Meta</span>
    </div>
  );
}

export function AwsBrandLogo({ className = "h-6 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 80 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19.2 25.6c-4.6 3.4-11.4 5.2-17.2 5.2-8.1 0-15.5-3-21.1-8-.4-.4-.1-1 .5-.6 6 3.4 13.3 5.5 20.9 5.5 5.2 0 10.9-1.2 16.1-3.7.7-.4 1.4.4.8 1l-.8.6zm2-2c-.6-.7-3.8-.3-5.2-.2-.5.1-.6-.3-.2-.6 2.6-1.9 6.9-1.3 7.4-.7.5.6-.2 5-2.6 7.1-.4.3-.7.2-.6-.2.6-1.4 1.8-4.5 1.2-5.4z" fill="#FF9900" transform="translate(42, 10)" />
      <text x="5" y="27" fill="#232F3E" fontFamily="system-ui, sans-serif" fontWeight="900" fontSize="24" letterSpacing="-0.04em">aws</text>
    </svg>
  );
}

export function OktaBrandLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-1.5 group cursor-default">
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="#00297A" strokeWidth="4" />
      </svg>
      <span className="font-bold text-base text-[#00297A] tracking-tight">okta</span>
    </div>
  );
}

export function SquareBrandLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2 group cursor-default">
      <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="20" height="20" rx="4" fill="#000000" />
        <rect x="7" y="7" width="10" height="10" rx="2" fill="#FFFFFF" />
        <rect x="10" y="10" width="4" height="4" rx="1" fill="#000000" />
      </svg>
      <span className="font-bold text-base text-slate-900 tracking-tight">Square</span>
    </div>
  );
}

export function AtlassianBrandLogo({ className = "h-5 w-auto" }: { className?: string }) {
  return (
    <div className="flex items-center gap-2 group cursor-default">
      <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M15.4 3.2C15.1 4 14.1 6.5 12.8 9.5C9.9 16.3 5.8 22.8 1.4 27.8C1.1 28.2 1.3 28.8 1.8 28.8H12.2C12.7 28.8 13.1 28.5 13.3 28.1C14.7 23.3 16.5 16.8 16.5 12.5C16.5 7.9 15.7 4.1 15.4 3.2Z" fill="#0052CC" />
        <path d="M16.6 15.5C16.6 19.3 17.9 24.3 19.1 28.1C19.3 28.5 19.7 28.8 20.2 28.8H30.6C31.1 28.8 31.3 28.2 31 27.8C27.5 23.8 23.9 18.2 21.6 12.5C19.6 7.6 17.5 3.8 17.5 3.8C17.2 3.2 16.6 3.5 16.6 4.2V15.5Z" fill="#2684FF" />
      </svg>
      <span className="font-extrabold text-sm text-[#0052CC] tracking-wider uppercase">ATLASSIAN</span>
    </div>
  );
}

export function IbmLogo({ className = "h-5 sm:h-6 w-auto" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 1075 401" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g fill="#1f70c1">
        <rect y="373.17" width="194.43" height="27.932" />
        <rect y="319.83" width="194.43" height="27.932" />
        <rect x="55.468" y="266.54" width="83.399" height="27.932" />
        <rect x="55.468" y="213.25" width="83.399" height="27.932" />
        <rect x="55.468" y="159.96" width="83.399" height="27.932" />
        <rect x="55.468" y="106.58" width="83.399" height="27.932" />
        <rect y="53.288" width="194.43" height="27.932" />
        <rect width="194.43" height="27.932" />
        <path d="m222.17 400.85 207.11 0.297c27.734 0 52.793-10.697 71.513-27.932h-278.62z" />
        <path d="m222.17 347.76h299.03c5.051-8.617 8.815-18.027 11.094-27.932h-310.12z" />
        <rect x="277.73" y="266.54" width="83.3" height="27.932" />
        <path d="m444.43 266.54v27.932h90.927c0-9.608-1.288-19.017-3.764-27.932z" />
        <path d="m497.92 213.25h-220.19v27.932h243.46c-6.34-10.698-14.165-20.107-23.277-27.932z" />
        <path d="m277.73 159.96v27.932h220.19c9.311-7.825 17.135-17.235 23.277-27.932z" />
        <rect x="277.73" y="106.58" width="83.3" height="27.932" />
        <path d="m444.43 134.51h87.163c2.476-8.914 3.764-18.324 3.764-27.932h-90.927z" />
        <path d="m521.2 53.288h-299.03v27.932h310.12c-2.575-9.905-6.339-19.314-11.093-27.932z" />
        <path d="m429.28 0h-207.11v27.932h278.53c-18.621-17.235-43.878-27.932-71.414-27.932z" />
        <polygon points="555.57 81.22 742.67 81.22 733.06 53.288 555.57 53.288" />
        <polygon points="555.57 27.932 724.25 27.932 714.64 0 555.57 0" />
        <polygon points="861.03 401.17 861.03 373.24 1e3 373.24 1e3 401.17" />
        <polygon points="861.03 347.76 861.03 319.83 1e3 319.83 1e3 347.76" />
        <polygon points="777.73 182.54 769.91 159.96 694.43 159.96 611.03 159.96 611.03 187.89 694.43 187.89 694.43 162.24 703.25 187.89 852.22 187.89 861.03 162.24 861.03 187.89 944.43 187.89 944.43 159.96 861.03 159.96 785.56 159.96" />
        <polygon points="944.43 106.58 803.98 106.58 794.37 134.51 944.43 134.51" />
        <polygon points="1e3 27.932 1e3 0 840.93 0 831.32 27.932" />
        <polygon points="768.13 373.22 777.73 400.85 787.34 373.22" />
        <polygon points="749.5 319.83 759.31 347.76 796.16 347.76 806.06 319.83" />
        <polygon points="730.78 266.54 740.59 294.47 814.88 294.47 824.68 266.54" />
        <polygon points="721.97 241.18 833.6 241.18 843.11 213.25 712.36 213.25" />
        <polygon points="611.03 134.51 761.09 134.51 751.49 106.58 611.03 106.58" />
        <polygon points="1e3 53.288 822.4 53.288 812.9 81.22 1e3 81.22" />
        <rect x="555.57" y="373.22" width="138.97" height="27.932" />
        <rect x="555.57" y="319.83" width="138.97" height="27.932" />
        <rect x="611.03" y="266.54" width="83.399" height="27.932" />
        <rect x="611.03" y="213.25" width="83.399" height="27.932" />
        <rect x="861.03" y="213.25" width="83.399" height="27.932" />
        <rect x="861.03" y="266.54" width="83.399" height="27.932" />
      </g>
    </svg>
  );
}
