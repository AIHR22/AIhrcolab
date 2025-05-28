"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Bell, Menu, Search, Settings, User, Link as LinkIcon, FileText, Briefcase, DollarSign, MessageSquare, Settings2 } from "lucide-react"
import { TenantSelector } from "@/components/tenant-selector"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { ModeToggle } from "@/components/mode-toggle"
import Link from "next/link"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

// Helper function for debouncing
function debounce<F extends (...args: any[]) => any>(func: F, waitFor: number) {
  let timeout: ReturnType<typeof setTimeout> | null = null

  const debounced = (...args: Parameters<F>) => {
    if (timeout !== null) {
      clearTimeout(timeout)
      timeout = null
    }
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced as (...args: Parameters<F>) => void
}

// Highlight match helper function
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${query})`, 'gi'));
  return (
    <>
      {parts.map((part, index) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <strong key={index}>{part}</strong>
        ) : (
          part
        )
      )}
    </>
  );
};

interface NavItem {
  label: string;
  path: string;
  icon?: React.ReactNode; // Optional icon for suggestions
}

const iconMap: { [key: string]: React.ReactNode } = {
  Dashboard: <Briefcase className="mr-2 h-4 w-4" />,
  Employees: <User className="mr-2 h-4 w-4" />,
  Organization: <Briefcase className="mr-2 h-4 w-4" />,
  "Workforce Planning": <Briefcase className="mr-2 h-4 w-4" />,
  "Revenue Forecasting": <DollarSign className="mr-2 h-4 w-4" />,
  "HR Assistant": <MessageSquare className="mr-2 h-4 w-4" />,
  Settings: <Settings2 className="mr-2 h-4 w-4" />,
};

interface TopBarProps {
  onToggleSidebar: () => void
}

export function TopBar({ onToggleSidebar }: TopBarProps) {
  const router = useRouter()
  const [notifications, setNotifications] = useState([
    { id: 1, title: "New employee onboarding", read: false },
    { id: 2, title: "Payroll processing complete", read: false },
    { id: 3, title: "Performance review due", read: false },
  ])
  const [searchFocused, setSearchFocused] = useState(false)
  const [inputValue, setInputValue] = useState("")
  const [suggestions, setSuggestions] = useState<NavItem[]>([])
  const searchContainerRef = useRef<HTMLDivElement>(null)

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  // CMD+K shortcut to focus search input
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        const searchInputEl = searchContainerRef.current?.querySelector('input[type="search"]') as HTMLInputElement | null;
        if (searchInputEl) {
          searchInputEl.focus();
        } else {
          // Fallback or ensure the input is rendered when trying to focus
          setSearchFocused(true); // This might help if input is conditionally rendered by focus
        }
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, []) // Removed searchFocused from dependencies as it might cause loop if input not found

  const fetchSuggestions = useCallback(
    debounce(async (query: string) => {
      // Query must exist to fetch, otherwise API returns all items which we don't want unless explicitly asked.
      if (!query) { 
        setSuggestions([]);
        return;
      }
      const endpoint = `/api/search-suggestions?query=${encodeURIComponent(query)}`;
      try {
        const response = await fetch(endpoint);
        if (!response.ok) throw new Error('Network response was not ok');
        let data = await response.json();
        data = data.map((item: NavItem) => ({ ...item, icon: iconMap[item.label] || <LinkIcon className="mr-2 h-4 w-4" /> }));
        setSuggestions(data);
      } catch (error) {
        console.error("Failed to fetch suggestions:", error);
        setSuggestions([]); 
      }
    }, 300), 
    [] // No dependencies needed for debounce wrapper itself, fetch logic depends on query arg.
  );

  useEffect(() => {
    if (searchFocused && inputValue) {
      fetchSuggestions(inputValue);
    } else if (searchFocused && !inputValue) {
      // If focused but input is empty, clear suggestions (no initial full list)
      setSuggestions([]); 
    } else if (!searchFocused) {
      // If not focused, always clear suggestions
      setSuggestions([]);
    }
  }, [inputValue, searchFocused, fetchSuggestions]);

  // Click outside handler
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);

  const handleSelectSuggestion = (path: string) => {
    router.push(path);
    setInputValue("");
    setSuggestions([]);
    setSearchFocused(false);
    const activeEl = document.activeElement as HTMLElement;
    if (activeEl?.blur) {
        activeEl.blur(); // Blur the input
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Button variant="ghost" size="icon" onClick={onToggleSidebar} className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        <div ref={searchContainerRef} className="flex-1 md:flex-initial relative">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              type="search" 
              placeholder="Search... (⌘K)"
              className="w-full md:w-[300px] pl-8 bg-background"
              value={inputValue}
              onFocus={() => {
                setSearchFocused(true);
                // No longer fetching all suggestions on focus if input is empty
              }}
              onChange={(e) => setInputValue(e.target.value)}
            />
          </div>
          {/* Show dropdown if focused AND there is input OR if focused and waiting for initial non-empty results (covered by suggestions.length check) */}
          {searchFocused && inputValue && (
            <Command 
              className="absolute top-full mt-1 w-full md:w-[300px] rounded-md border bg-card text-card-foreground shadow-lg z-50"
            >
              <CommandList>
                <CommandEmpty className="py-2 text-center text-sm">
                  {inputValue ? "No results found." : ""} 
                </CommandEmpty>
                {suggestions.length > 0 && (
                  <CommandGroup>
                    {suggestions.map((item) => (
                      <CommandItem 
                        key={item.path} 
                        onSelect={() => handleSelectSuggestion(item.path)}
                        value={item.label} 
                        className="cursor-pointer"
                      >
                        {item.icon || <LinkIcon className="mr-2 h-4 w-4" />} 
                        <HighlightMatch text={item.label} query={inputValue} />
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </CommandList>
            </Command>
          )}
        </div>

        <div className="flex flex-1 items-center justify-end gap-4">
          <TenantSelector />
          <ModeToggle />

          <Link
            href="/dashboard/organization"
            className="flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 mr-2"
          >
            Organization
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center">
                    {unreadCount}
                  </Badge>
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                    Mark all as read
                  </Button>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No notifications</div>
              ) : (
                notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start p-4 ${notification.read ? "opacity-60" : "font-medium"}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex w-full justify-between">
                      <span>{notification.title}</span>
                      {!notification.read && (
                        <Badge variant="outline" className="ml-2 h-2 w-2 rounded-full bg-primary p-0" />
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">Just now</span>
                  </DropdownMenuItem>
                ))
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/profile')}>
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Log out</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  )
}

