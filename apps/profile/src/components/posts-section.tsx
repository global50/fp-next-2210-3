import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Share, MoreHorizontal, Bookmark } from "lucide-react"

interface UserProfile {
  id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  about: string | null
  telegram_username: string | null
  profile_type: string | null
  badge: string[] | null
  contact_info: any[] | null
}

interface PostsSectionProps {
  user: UserProfile
  isOwnProfile: boolean
}

const posts = [
  {
    id: 1,
    title: "New E-Commerce Platform Launch",
    content: "Just finished building a new e-commerce platform with React and Node.js! The performance improvements are incredible - 40% faster load times and seamless user experience. Excited to share more details soon! 🚀",
    images: ["https://images.pexels.com/photos/3184295/pexels-photo-3184295.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop"],
  },
  {
    id: 2,
    title: "React Conference 2024 Experience",
    content: "Attending the React Conference 2024 was an amazing experience! Met so many talented developers and learned about the latest trends in web development. The future of React looks incredibly promising with the new concurrent features.",
    images: ["https://images.pexels.com/photos/1181676/pexels-photo-1181676.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop"],
  },
  {
    id: 3,
    title: "Open Source TypeScript Project",
    content: "Working on a new open-source project that helps developers optimize their TypeScript configurations. It's been a challenging but rewarding journey. Looking for contributors who are passionate about developer tooling!",
    images: [],
  },
  {
    id: 4,
    title: "AWS and Docker Deployment Success",
    content: "Just deployed my latest project using AWS and Docker. The scalability and performance are exactly what I was hoping for. Here's a quick overview of the architecture and deployment process.",
    images: ["https://images.pexels.com/photos/577585/pexels-photo-577585.jpeg?auto=compress&cs=tinysrgb&w=600&h=300&fit=crop"],
  }
]

export function PostsSection({ user, isOwnProfile }: PostsSectionProps) {
  const displayName = user.name || user.username || 'User'
  const displayUsername = user.username || user.telegram_username || 'user'
  const avatarFallback = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <div className="space-y-6">
      {isOwnProfile && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">You haven't posted anything yet.</p>
          <Button variant="outline">Create your first post</Button>
        </div>
      )}
      
      {!isOwnProfile && posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No posts to show.</p>
        </div>
      )}
      
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex gap-3">
              {/* Avatar on the left */}
              <div className="flex-shrink-0">
                <Avatar className="w-12 h-12">
                  <AvatarImage src={user.avatar_url || undefined} alt={displayName} />
                  <AvatarFallback>{avatarFallback}</AvatarFallback>
                </Avatar>
              </div>
              
              {/* Content on the right */}
              <div className="flex-1 min-w-0">
                {/* Header with name and action buttons */}
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-1">
                    <h3 className="font-semibold text-sm">{displayName}</h3>
                    {user.badge?.includes('verified') && (
                      <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    )}
                    <span className="text-sm text-muted-foreground">@{displayUsername}</span>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1 bg-transparent hover:bg-transparent">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                {/* Post title */}
                <h4 className="font-semibold text-base mb-3">{post.title}</h4>
                
                {/* Post content */}
                <p className="text-sm leading-relaxed mb-4">{post.content}</p>
            
              {post.images.length > 0 && (
                <div className="mb-4">
                  <img 
                    src={post.images[0]} 
                    alt="Post content"
                    className="w-full rounded-lg object-cover max-h-64"
                  />
                </div>
              )}
                
                {/* Action buttons at bottom right */}
                <div className="flex justify-end gap-1 mt-2">
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1 bg-transparent hover:bg-transparent">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground p-1 bg-transparent hover:bg-transparent">
                    <Share className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}