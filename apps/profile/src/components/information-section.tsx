'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Profile } from "@/types/profile"

interface InformationSectionProps {
  user: Profile | null
  isOwnProfile: boolean
  isEditing: boolean
  onUpdateProfile: (updates: Partial<Profile>) => void
}

export function InformationSection({ user, isOwnProfile, isEditing, onUpdateProfile }: InformationSectionProps) {
  if (!user) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {user.profile_type && (
            <div>
              <p className="text-sm font-medium">Type</p>
              <p className="text-sm text-muted-foreground">{user.profile_type}</p>
            </div>
          )}
          {user.about && (
            <div>
              <p className="text-sm font-medium">About</p>
              <p className="text-sm text-muted-foreground">{user.about}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
