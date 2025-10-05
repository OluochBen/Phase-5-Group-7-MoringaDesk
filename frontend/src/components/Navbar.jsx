import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Bell, User, LogOut, Home, Shield, HelpCircle, ListChecks } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { AskQuestionDialog } from "./AskQuestionDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export function Navbar({ user, onNavigate, onLogout, currentScreen, unreadNotifications }) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <button
              onClick={() => onNavigate("/dashboard")}
              className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            >
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">M</span>
              </div>
              <span className="text-xl font-bold text-foreground">MoringaDesk</span>
            </button>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search questions, tags, or users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Ask Question -> popup dialog */}
            <div className="hidden sm:block">
              <AskQuestionDialog currentUser={user} />
            </div>

            {/* Navigation Buttons */}
            <Button
              variant={currentScreen === "dashboard" ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate("/dashboard")}
              className="hidden sm:flex items-center space-x-1"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </Button>

            <Button
              variant={currentScreen === "questions" ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate("/questions")}
              className="hidden sm:flex items-center space-x-1"
            >
              <ListChecks className="w-4 h-4" />
              <span>Questions</span>
            </Button>

            <Button
              variant={currentScreen === "faq" ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate("/faq")}
              className="hidden sm:flex items-center space-x-1"
            >
              <HelpCircle className="w-4 h-4" />
              <span>FAQ</span>
            </Button>

            {user.role === "admin" && (
              <Button
                variant={currentScreen === "admin" ? "default" : "ghost"}
                size="sm"
                onClick={() => onNavigate("/admin")}
              className="hidden sm:flex items-center space-x-1"
              >
                <Shield className="w-4 h-4" />
                <span>Admin</span>
              </Button>
            )}

            {/* Notifications */}
            <Button
              variant={currentScreen === "notifications" ? "default" : "ghost"}
              size="sm"
              onClick={() => onNavigate("/notifications")}
              className="relative"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifications > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-2 -right-2 w-5 h-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  {unreadNotifications > 9 ? "9+" : unreadNotifications}
                </Badge>
              )}
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name?.charAt(0)?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => onNavigate(`/profile/${user.id}`)}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
