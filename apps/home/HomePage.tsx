'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Globe, Users, MessageSquare, TrendingUp } from "lucide-react"

export function HomePage() {
  const quickActions = [
    {
      icon: Plus,
      title: "Create Post",
      description: "Share your thoughts with the community",
      color: "bg-blue-500 hover:bg-blue-600"
    },
    {
      icon: Users,
      title: "Find Friends",
      description: "Connect with people you know",
      color: "bg-green-500 hover:bg-green-600"
    },
    {
      icon: MessageSquare,
      title: "Start Chat",
      description: "Begin a conversation",
      color: "bg-purple-500 hover:bg-purple-600"
    },
    {
      icon: Globe,
      title: "Explore",
      description: "Discover trending content",
      color: "bg-orange-500 hover:bg-orange-600"
    }
  ]

  const stats = [
    { label: "Active Users", value: "2.6K", trend: "+12%" },
    { label: "Posts Today", value: "170", trend: "+8%" },
    { label: "Communities", value: "48", trend: "+3%" },
    { label: "Messages", value: "892", trend: "+15%" }
  ]

  return (
    <div className="h-full w-full overflow-y-auto">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-6">
        {/* Welcome Section */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Build Your Network
            </CardTitle>
            <p className="text-muted-foreground mt-2">
              Grow your professional connections and share your journey
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickActions.map((action, index) => (
                <Card key={index} className="shadow-sm hover:shadow-md transition-all duration-200 hover:scale-105 cursor-pointer">
                  <CardContent className="p-4 text-center">
                    <div className={`w-12 h-12 rounded-full ${action.color} flex items-center justify-center mx-auto mb-3 transition-colors`}>
                      <action.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{action.title}</h3>
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Platform Stats */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-500" />
              Platform Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center p-4 rounded-lg bg-accent/30 hover:bg-accent/50 transition-colors">
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                  <div className="text-xs text-green-600 font-medium mt-1">{stat.trend}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Getting Started */}
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">1</span>
              </div>
              <div>
                <h4 className="font-medium">Complete Your Profile</h4>
                <p className="text-sm text-muted-foreground">Add a photo and tell us about yourself</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">2</span>
              </div>
              <div>
                <h4 className="font-medium">Find Your Community</h4>
                <p className="text-sm text-muted-foreground">Join groups that match your interests</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 p-3 rounded-lg hover:bg-accent/30 transition-colors">
              <div className="w-6 h-6 rounded-full bg-purple-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-bold">3</span>
              </div>
              <div>
                <h4 className="font-medium">Start Connecting</h4>
                <p className="text-sm text-muted-foreground">Follow friends and share your first post</p>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      </div>
  )
}