import {
  Baby,
  Banknote,
  Building2,
  Car,
  Film,
  HeartPulse,
  Home,
  Landmark,
  LucideIcon,
  PlusCircle,
  ShoppingBag,
  ShoppingCart,
  Tag,
  Plane,
  UtensilsCrossed,
} from "lucide-react";

/** Falls back to a generic tag icon for any category without a mapping (all custom categories). */
const ICONS: Record<string, LucideIcon> = {
  groceries: ShoppingCart,
  house: Home,
  mortgage: Landmark,
  car: Car,
  restaurant: UtensilsCrossed,
  shopping: ShoppingBag,
  child: Baby,
  travel: Plane,
  health: HeartPulse,
  entertainment: Film,
  other: Tag,
  salary: Banknote,
  "rental-income": Building2,
  "other-income": PlusCircle,
};

export function iconForCategory(categoryId: string): LucideIcon {
  return ICONS[categoryId] ?? Tag;
}
