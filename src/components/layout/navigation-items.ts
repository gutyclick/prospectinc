import {
  FileText,
  Inbox,
  LayoutDashboard,
  Search,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export const navigationItems: NavigationItem[] = [
  { href: "/", label: "Inicio", icon: LayoutDashboard },
  { href: "/busquedas", label: "Búsquedas", icon: Search },
  { href: "/prospectos", label: "Prospectos", icon: Users },
  { href: "/propuestas", label: "Propuestas", icon: FileText },
  { href: "/bandeja", label: "Bandeja", icon: Inbox },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];
