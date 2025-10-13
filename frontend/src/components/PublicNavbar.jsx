import React, { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";

const NAV_LINKS = [
  { label: "Features", href: "/#features" },
  { label: "Topics", href: "/#topics" },
  { label: "Community", href: "/#community" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

export function PublicNavbar({ onLogin, onSignUp }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2 hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-600 text-lg font-bold text-white">
            M
          </div>
          <span className="text-xl font-bold text-foreground">MoringaDesk</span>
        </Link>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map(({ label, href }) =>
            href.startsWith("/#") ? (
              <a
                key={label}
                href={href}
                className="text-sm font-medium text-gray-600 transition-colors hover:text-green-600"
              >
                {label}
              </a>
            ) : (
              <NavLink
                key={label}
                to={href}
                className={({ isActive }) =>
                  [
                    "text-sm font-medium transition-colors",
                    isActive ? "text-green-600" : "text-gray-600 hover:text-green-600",
                  ].join(" ")
                }
              >
                {label}
              </NavLink>
            )
          )}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            onClick={() => {
              onLogin?.();
              navigate("/login");
            }}
            className="text-sm font-semibold text-gray-600 hover:text-green-600"
          >
            Sign In
          </Button>
          <Button
            onClick={() => {
              onSignUp?.();
              navigate("/register");
            }}
            className="rounded-full bg-green-600 px-5 text-sm font-semibold text-white hover:bg-green-700"
          >
            Get Started
          </Button>
        </div>

        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="inline-flex items-center justify-center rounded-md border border-slate-200 p-2 text-slate-600 hover:border-green-200 hover:text-green-600 md:hidden"
          aria-expanded={menuOpen}
          aria-label="Toggle navigation"
        >
          {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <div className="md:hidden">
        <div
          className={`absolute left-0 right-0 top-16 z-40 mx-4 transition-all duration-200 ${
            menuOpen ? "pointer-events-auto translate-y-0 opacity-100" : "pointer-events-none -translate-y-4 opacity-0"
          }`}
        >
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
            <div className="flex flex-col space-y-3">
              {NAV_LINKS.map(({ label, href }) =>
                href.startsWith("/#") ? (
                  <a
                    key={label}
                    href={href}
                    className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  >
                    {label}
                  </a>
                ) : (
                  <NavLink
                    key={label}
                    to={href}
                    className={({ isActive }) =>
                      [
                        "rounded-lg px-3 py-2 text-sm font-medium",
                        isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-700 hover:bg-slate-100",
                      ].join(" ")
                    }
                  >
                    {label}
                  </NavLink>
                )
              )}
            </div>

            <div className="mt-4 flex flex-col gap-3">
              <Button
                variant="outline"
                onClick={() => {
                  setMenuOpen(false);
                  onLogin?.();
                  navigate("/login");
                }}
                className="w-full border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-100"
              >
                Sign In
              </Button>
              <Button
                onClick={() => {
                  setMenuOpen(false);
                  onSignUp?.();
                  navigate("/register");
                }}
                className="w-full rounded-full bg-green-600 text-sm font-semibold text-white hover:bg-green-700"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default PublicNavbar;
