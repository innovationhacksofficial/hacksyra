import type { ElementType } from "react";
import {
  LayoutDashboard,
  Trophy,
  Users,
  Code2,
  Send,
  CreditCard,
  Ticket,
  Bookmark,
  Award,
  Bell,
  Settings,
  MessageSquare,
  Plus,
  BarChart3,
  Gavel,
  Megaphone,
  Tag,
  ShieldCheck,
  ClipboardCheck,
  Building2,
  Flag,
  SlidersHorizontal,
  ScrollText,
  Home,
  Compass,
  User,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  shortLabel?: string;
  icon: ElementType;
  exact?: boolean;
  primaryMobile?: boolean;
  badge?: string;
};

export type AppArea = "participant" | "organizer" | "admin" | "judge";

export const PUBLIC_NAV: { label: string; href: string }[] = [
  { label: "Hackathons", href: "/hackathons" },
  { label: "Projects", href: "/projects" },
  { label: "Builders", href: "/builders" },
  { label: "Leaderboard", href: "/leaderboard" },
  { label: "Host", href: "/host" },
];

export const PUBLIC_MOBILE_TABS = [
  { href: "/", label: "Home", icon: Home, exact: true },
  { href: "/hackathons", label: "Explore", icon: Compass },
  { href: "/organizer/create", label: "Host", icon: Plus, isCenter: true },
  { href: "/dashboard/saved", label: "Saved", icon: Bookmark },
  { href: "/dashboard", label: "Me", icon: User },
];

export const AREA_META: Record<AppArea, { title: string; subtitle: string; home: string }> = {
  participant: { title: "Builder Hub", subtitle: "Participant Workspace", home: "/dashboard" },
  organizer: { title: "Organizer Console", subtitle: "Host & Manage Events", home: "/organizer" },
  admin: { title: "Platform Admin", subtitle: "Review & Governance", home: "/admin" },
  judge: { title: "Judge Portal", subtitle: "Evaluate Submissions", home: "/judge" },
};

export const AREA_NAV: Record<AppArea, NavItem[]> = {
  participant: [
    { href: "/dashboard", label: "Overview", shortLabel: "Home", icon: LayoutDashboard, exact: true, primaryMobile: true },
    { href: "/dashboard/hackathons", label: "My Hackathons", shortLabel: "Events", icon: Trophy, primaryMobile: true },
    { href: "/dashboard/teams", label: "Teams", icon: Users, primaryMobile: true },
    { href: "/dashboard/projects", label: "Projects", icon: Code2, primaryMobile: true },
    { href: "/dashboard/submissions", label: "Submissions", icon: Send },
    { href: "/dashboard/tickets", label: "Tickets", icon: Ticket },
    { href: "/dashboard/payments", label: "Payments", icon: CreditCard },
    { href: "/dashboard/certificates", label: "Certificates", icon: Award },
    { href: "/dashboard/messages", label: "Messages", icon: MessageSquare },
    { href: "/dashboard/notifications", label: "Notifications", icon: Bell },
    { href: "/dashboard/saved", label: "Saved Events", icon: Bookmark },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
  ],
  organizer: [
    { href: "/organizer", label: "Overview", shortLabel: "Home", icon: LayoutDashboard, exact: true, primaryMobile: true },
    { href: "/organizer/events", label: "My Events", shortLabel: "Events", icon: Trophy, primaryMobile: true },
    { href: "/organizer/create", label: "Create Hackathon", shortLabel: "Create", icon: Plus, primaryMobile: true },
    { href: "/organizer/participants", label: "Participants", shortLabel: "People", icon: Users, primaryMobile: true },
    { href: "/organizer/teams", label: "Teams", icon: Users },
    { href: "/organizer/submissions", label: "Submissions", icon: Send },
    { href: "/organizer/judging", label: "Judging", icon: Gavel },
    { href: "/organizer/announcements", label: "Announcements", icon: Megaphone },
    { href: "/organizer/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/organizer/certificates", label: "Certificates", icon: Award },
    { href: "/organizer/coupons", label: "Coupons & Tiers", icon: Tag },
    { href: "/organizer/payments", label: "Payments", icon: CreditCard },
    { href: "/organizer/settings", label: "Settings", icon: Settings },
  ],
  admin: [
    { href: "/admin", label: "Dashboard", shortLabel: "Home", icon: ShieldCheck, exact: true, primaryMobile: true },
    { href: "/admin/reviews", label: "Review Queue", shortLabel: "Reviews", icon: ClipboardCheck, primaryMobile: true },
    { href: "/admin/hackathons", label: "All Hackathons", shortLabel: "Events", icon: Trophy, primaryMobile: true },
    { href: "/admin/users", label: "Users", icon: Users, primaryMobile: true },
    { href: "/admin/organizations", label: "Organizations", icon: Building2 },
    { href: "/admin/reports", label: "Reports", icon: Flag },
    { href: "/admin/payments", label: "Payments", icon: CreditCard },
    { href: "/admin/settings", label: "Platform Settings", icon: SlidersHorizontal },
    { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
  ],
  judge: [
    { href: "/judge", label: "Assignments", shortLabel: "Judge", icon: Gavel, exact: true, primaryMobile: true },
    { href: "/hackathons", label: "Hackathons", icon: Trophy, primaryMobile: true },
    { href: "/dashboard", label: "Participant Hub", icon: LayoutDashboard, primaryMobile: true },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, primaryMobile: true },
  ],
};

