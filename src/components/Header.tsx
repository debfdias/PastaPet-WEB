"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import { signOut, useSession } from "next-auth/react";
import { ThemeButtons } from "./ui/ThemeButtons";

export function Header() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/" });
  };

  if (!session) {
    return null;
  }

  return (
    <div className="pb-16">
      <header className="fixed top-0 z-50 w-full border-b bg-black">
        <div className="px-20 w-full flex h-14 items-center justify-between">
          <div className="flex items-center space-x-8">
            <Link
              href="/pets"
              className={`flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 hover:bg-accent/50 ${
                pathname === "/pets"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Pets</span>
            </Link>
            <Link
              href="/reports"
              className={`flex items-center space-x-2 px-2 py-1 rounded-md transition-all duration-200 hover:bg-accent/50 ${
                pathname === "/reports"
                  ? "text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span>Reports</span>
            </Link>
          </div>
          <div className="flex items-center space-x-2">
            <ThemeButtons />
            <Link href="/profile">
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-accent/50 transition-colors duration-200"
              >
                <User className="h-5 w-5" />
                <span className="sr-only">Profile</span>
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="rounded-full hover:bg-accent/50 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}
