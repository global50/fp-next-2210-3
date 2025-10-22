'use client'

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Profile } from "@/types/profile"

interface HeroSectionProps {
  user: Profile | null
  isOwnProfile: boolean
  isEditing: boolean
  isSaving: boolean
  onEditToggle: () => void
  onSaveChanges: () => void
  onUpdateProfile: (updates: Partial<Profile>) => void
  cities: any[]
  countries: any[]
  locationString: string
  onAddLocation: (location: any) => void
  onRemoveLocation: (id: string) => void
  onClearAllLocations: () => void
}

export function HeroSection(props: HeroSectionProps) {
  const { user, isOwnProfile, isEditing, isSaving, onEditToggle, onSaveChanges } = props

  if (!user) return null

  return (
    <Card className="mb-6">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold">{user.name || user.username}</h1>
            {user.username && <p className="text-muted-foreground">@{user.username}</p>}
          </div>
          {isOwnProfile && (
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button onClick={onSaveChanges} disabled={isSaving}>
                    {isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button variant="outline" onClick={onEditToggle}>
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={onEditToggle}>
                  Edit Profile
                </Button>
              )}
            </div>
          )}
        </div>
        {user.about && (
          <p className="text-sm text-muted-foreground">{user.about}</p>
        )}
      </CardContent>
    </Card>
  )
}
