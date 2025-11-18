import { Home, ShoppingBag, User, Package, Briefcase, Truck } from "lucide-react";
import { NavLink } from "./NavLink";
import { useAuth } from "@/contexts/AuthContext";

export const BottomNav = () => {
  const { userRole } = useAuth();

  const getNavItems = () => {
    const baseItems = [
      { to: "/dashboard", icon: Home, label: "Home" },
    ];

    if (userRole === "farmer") {
      return [
        ...baseItems,
        { to: "/marketplace", icon: ShoppingBag, label: "Shop" },
        { to: "/equipment", icon: Package, label: "Rent" },
        { to: "/tracking", icon: Truck, label: "Track" },
        { to: "/profile", icon: User, label: "Profile" },
      ];
    }

    if (userRole === "seller") {
      return [
        ...baseItems,
        { to: "/my-equipment", icon: Package, label: "Equipment" },
        { to: "/bookings", icon: ShoppingBag, label: "Bookings" },
        { to: "/profile", icon: User, label: "Profile" },
      ];
    }

    if (userRole === "laborer") {
      return [
        ...baseItems,
        { to: "/jobs", icon: Briefcase, label: "Jobs" },
        { to: "/profile", icon: User, label: "Profile" },
      ];
    }

    return baseItems;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card shadow-lg md:hidden">
      <div className="flex items-center justify-around">
        {getNavItems().map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center gap-1 px-3 py-3 text-muted-foreground transition-colors"
            activeClassName="text-primary"
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
};
