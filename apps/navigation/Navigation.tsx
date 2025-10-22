"use client";

import { Home, User, Settings, MessageCircle, Bell, Search, Bookmark, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthContext } from "@/components/auth-provider"

export function Navigation() {
  const pathname = usePathname()
  const { user, profile, isAuthenticated, loading } = useAuthContext()

  // Determine profile path based on authentication status
  const getProfilePath = () => {
    if (isAuthenticated && profile?.username) {
      return `/${profile.username}`
    }
    return '/auth'
  }

  // Generate navigation items dynamically to ensure fresh profile path
  const navigationItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Search, label: "Explore", path: "/explore" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: MessageCircle, label: "Messages", path: "/messages" },
    { icon: Bookmark, label: "Bookmarks", path: "/bookmarks" },
    { icon: Users, label: "Communities", path: "/communities" },
    { icon: User, label: "Profile", path: getProfilePath() },
    { icon: Settings, label: "Settings", path: "/settings" },
  ]

  return (
    <aside className="hidden lg:flex lg:w-64 xl:w-72 flex-col h-full bg-background/30 overflow-hidden">
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {/* Brand Card */}
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <div className="h-4 w-4 rounded bg-white"></div>
              </div>
              <span className="text-xl font-bold text-foreground">SocialNet</span>
            </div>
          </CardContent>
        </Card>

        {/* Navigation Card */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Navigation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {navigationItems.map((item) => (
              <Button
                key={item.label}
                variant={pathname === item.path ? "default" : "ghost"}
                className={`w-full justify-start h-12 px-4 ${
                  pathname === item.path
                    ? "bg-blue-500 hover:bg-blue-600 text-white" 
                    : "hover:bg-accent/50 transition-colors"
                }`}
                asChild
              >
                <Link href={item.path}>
                  <item.icon className="h-5 w-5 mr-3" />
                  <span className="text-base">{item.label}</span>
                </Link>
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* User Profile Card */}
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            {loading ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
                <div className="flex-1 min-w-0">
                  <div className="h-4 bg-muted rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-2/3"></div>
                </div>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {profile?.username ? `@${profile.username}` : ''}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-full bg-muted"></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-muted-foreground">
                    Not signed in
                  </p>
                  <p className="text-xs text-muted-foreground">
                    <Link href="/auth" className="text-blue-500 hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Version Display */}
        <div className="px-4 pb-4">
          <p className="text-xs text-muted-foreground text-center">
            v1.0.0
          </p>
        </div>
      </div>
    </aside>
  )
}