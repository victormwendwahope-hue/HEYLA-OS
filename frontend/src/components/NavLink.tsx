import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

interface NavLinkCompatProps {
  className?: string;
  activeClassName?: string;
  to: string;
  children?: React.ReactNode;
}

export function NavLink({ className, activeClassName, to, children, ...props }: NavLinkCompatProps) {
  return (
    <Link
      to={to}
      className={className}
      activeProps={{ className: activeClassName }}
      {...props}
    >
      {children}
    </Link>
  );
}
