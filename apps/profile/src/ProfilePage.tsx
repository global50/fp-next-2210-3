"use client";

import { HeroSection } from "./components/hero-section"
import { PostsSection } from "./components/posts-section"
import { InformationSection } from "./components/information-section"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useProfileData } from "./hooks/use-profile-data"
import { useLocationData } from "./hooks/useLocationData"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { useAuthContext } from "@/components/auth-provider"

interface ProfilePageProps {
  username?: string // Optional prop to override URL-based username detection
}

export function ProfilePage({ username }: ProfilePageProps) {
  const { user, isLoading, error, isOwnProfile, requestedUsername, redirectPath, refetchProfile } = useProfileData()
  const { session } = useAuthContext()
  const router = useRouter()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [profileData, setProfileData] = useState(user)

  const {
    cities,
    countries,
    isLoading: isLoadingLocation,
    error: locationError,
    addLocation,
    removeLocation,
    clearAllLocations,
    hasUnsavedChanges: hasLocationChanges,
    getAllLocations,
    getFormattedLocationString,
    refetchLocations
  } = useLocationData({
    profileId: user?.id || null,
    isOwnProfile
  })

  // Update local profile data when user data changes
  useEffect(() => {
    if (user) {
      setProfileData(user)
    }
  }, [user])

  // Handle redirection when user visits /profile
  useEffect(() => {
    if (redirectPath) {
      router.replace(redirectPath)
    }
  }, [redirectPath, router])

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (isEditing) {
      setProfileData(user)
      refetchLocations()
    }
  }

  const handleSaveChanges = async () => {
    console.log('=========================================')
    console.log('🚀 [Profile Save] Starting profile save operation at:', new Date().toISOString())
    console.log('=========================================')

    setIsSaving(true)

    try {
      console.log('📋 [Profile Save] Step 1: Preparing profile data to save')
      console.log('📋 [Profile Save] Profile data (sanitized):', {
        hasContactInfo: !!profileData?.contact_info,
        contactInfoCount: profileData?.contact_info?.length || 0,
        hasAbout: !!profileData?.about,
        aboutLength: profileData?.about?.length || 0,
        hasName: !!profileData?.name,
        nameLength: profileData?.name?.length || 0,
        hasAvatarUrl: !!profileData?.avatar_url,
        hasProfileType: !!profileData?.profile_type,
        //hasBadge: !!profileData?.badge,
      })

      console.log('🔐 [Profile Save] Step 2: Checking authentication')

      if (!session) {
        console.error('❌ [Profile Save] No active session found')
        toast({
          title: "Error",
          description: "You must be logged in to update your profile.",
          variant: "destructive",
        })
        return
      }

      console.log('✅ [Profile Save] Authentication check passed')
      console.log('🔑 [Profile Save] Has access token:', !!session.access_token)
      console.log('👤 [Profile Save] User ID:', session.user?.id)

      const apiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-profile`
      console.log('🌐 [Profile Save] Step 3: API endpoint:', apiUrl)

      const payload = {
        contact_info: profileData?.contact_info,
        about: profileData?.about,
        name: profileData?.name,
        avatar_url: profileData?.avatar_url,
        profile_type: profileData?.profile_type,
        //badge: profileData?.badge,
      }

      console.log('📤 [Profile Save] Step 4: Making POST request to update-profile')
      console.log('📤 [Profile Save] Payload keys:', Object.keys(payload))

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      })

      console.log('📥 [Profile Save] Step 5: Response received')
      console.log('📥 [Profile Save] Response status:', response.status)
      console.log('📥 [Profile Save] Response ok:', response.ok)

      if (!response.ok) {
        const error = await response.json()
        console.error('❌ [Profile Save] API returned error:', error)
        throw new Error(error.error || 'Failed to update profile')
      }

      const result = await response.json()
      console.log('✅ [Profile Save] Step 6: Save successful')
      console.log('✅ [Profile Save] Response data:', {
        success: result.success,
        hasProfile: !!result.profile,
        profileId: result.profile?.id
      })

      console.log('🔄 [Profile Save] Step 7: Updating local profile data')
      setProfileData(result.profile)

      if (hasLocationChanges) {
        console.log('📍 [Profile Save] Step 8: Saving location data')
        const locationApiUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-profile-locations`
        const locationPayload = {
          profile_id: result.profile.id,
          locations: getAllLocations()
        }

        const locationResponse = await fetch(locationApiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(locationPayload)
        })

        if (!locationResponse.ok) {
          const locationError = await locationResponse.json()
          console.error('❌ [Profile Save] Location save failed:', locationError)
          throw new Error(locationError.error || 'Failed to update locations')
        }

        console.log('✅ [Profile Save] Location data saved successfully')
      }

      console.log('🔄 [Profile Save] Step 9: Refetching profile from database')
      await refetchProfile()
      console.log('✅ [Profile Save] Profile refetch completed')

      console.log('🔄 [Profile Save] Step 10: Refetching location data')
      await refetchLocations()
      console.log('✅ [Profile Save] Location refetch completed')

      console.log('🚪 [Profile Save] Step 11: Exiting edit mode')
      setIsEditing(false)

      console.log('✅ [Profile Save] Step 12: Showing success notification')
      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })

      console.log('=========================================')
      console.log('✅ [Profile Save] Profile save operation completed successfully')
      console.log('=========================================')
    } catch (error) {
      console.log('=========================================')
      console.error('❌ [Profile Save] Save operation failed')
      console.error('❌ [Profile Save] Error type:', error instanceof Error ? error.constructor.name : typeof error)
      console.error('❌ [Profile Save] Error message:', error instanceof Error ? error.message : String(error))
      console.error('❌ [Profile Save] Full error:', error)
      console.log('=========================================')

      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      console.log('🏁 [Profile Save] Cleaning up: Setting isSaving to false')
      setIsSaving(false)
    }
  }

  const updateProfileData = (updates: Partial<typeof profileData>) => {
    setProfileData(prev => prev ? { ...prev, ...updates } : null)
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-background flex items-center justify-center overflow-y-auto">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-destructive mb-2">
              {error === 'Profile not found' ? 'Profile not found' : 'Error loading profile'}
            </p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show no profile found state
  if (!profileData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">
              {requestedUsername 
                ? `Profile @${requestedUsername} not found.`
                : 'Profile not available.'
              }
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="bg-background">
      <div className="container mx-auto px-6 py-6 max-w-4xl">
        <HeroSection
          user={profileData}
          isOwnProfile={isOwnProfile}
          isEditing={isEditing}
          isSaving={isSaving}
          onEditToggle={handleEditToggle}
          onSaveChanges={handleSaveChanges}
          onUpdateProfile={updateProfileData}
          cities={cities}
          countries={countries}
          locationString={getFormattedLocationString()}
          onAddLocation={addLocation}
          onRemoveLocation={removeLocation}
          onClearAllLocations={clearAllLocations}
        />
        
        <Tabs defaultValue="posts" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="posts" className="text-sm font-medium">
              Posts
            </TabsTrigger>
            <TabsTrigger value="information" className="text-sm font-medium">
              Information
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="posts" className="mt-0">
            <PostsSection user={profileData} isOwnProfile={isOwnProfile} />
          </TabsContent>
          
          <TabsContent value="information" className="mt-0">
            <InformationSection
              user={profileData}
              isOwnProfile={isOwnProfile}
              isEditing={isEditing}
              onUpdateProfile={updateProfileData}
            />
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  )
}