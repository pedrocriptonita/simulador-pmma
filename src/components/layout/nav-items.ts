import { BookOpen, Crown, LayoutDashboard, ListChecks, type LucideIcon } from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Itens de navegação da área logada (desktop e bottom nav mobile). */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/simulados", label: "Simulados", icon: ListChecks },
  { href: "/materiais", label: "Materiais", icon: BookOpen },
  { href: "/planos", label: "Planos", icon: Crown },
];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(`${href}/`);
}
