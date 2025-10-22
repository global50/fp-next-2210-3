import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ChevronUp, ChevronDown, ExternalLink, Copy, Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { ContactInfoEntry } from "@/types/profile"
import { CONTACT_TYPES, getContactIcon, generateContactLink, getContactDisplayValue, validateContactEntry, getContactTypeConfig } from "@/lib/contact-utils"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"

interface UserProfile {
  id: string
  name: string | null
  username: string | null
  avatar_url: string | null
  about: string | null
  telegram_username: string | null
  profile_type: string | null
  badge: string[] | null
  contact_info: ContactInfoEntry[] | null
}

interface ContactsSectionProps {
  user: UserProfile
  isOwnProfile: boolean
  isEditing: boolean
  onUpdateProfile: (updates: Partial<UserProfile>) => void
}

export function ContactsSection({ user, isOwnProfile, isEditing, onUpdateProfile }: ContactsSectionProps) {
  const [contactEntries, setContactEntries] = useState<ContactInfoEntry[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newEntry, setNewEntry] = useState<Partial<ContactInfoEntry>>({
    type: 'email',
    value: '',
    label: '',
    is_whatsapp: false
  })
  const { toast } = useToast()

  useEffect(() => {
    const entries = (user.contact_info || []).sort((a, b) => a.order - b.order)
    setContactEntries(entries)
  }, [user.contact_info])

  const updateContactEntries = (updatedEntries: ContactInfoEntry[]) => {
    setContactEntries(updatedEntries)
    onUpdateProfile({ contact_info: updatedEntries })
  }

  const moveUp = (index: number) => {
    if (index === 0) return

    const newEntries = [...contactEntries]
    const temp = newEntries[index - 1]
    newEntries[index - 1] = newEntries[index]
    newEntries[index] = temp

    const reorderedEntries = newEntries.map((entry, idx) => ({
      ...entry,
      order: idx
    }))

    updateContactEntries(reorderedEntries)
  }

  const moveDown = (index: number) => {
    if (index === contactEntries.length - 1) return

    const newEntries = [...contactEntries]
    const temp = newEntries[index + 1]
    newEntries[index + 1] = newEntries[index]
    newEntries[index] = temp

    const reorderedEntries = newEntries.map((entry, idx) => ({
      ...entry,
      order: idx
    }))

    updateContactEntries(reorderedEntries)
  }

  const handleEntryChange = (index: number, field: keyof ContactInfoEntry, value: any) => {
    const updatedEntries = [...contactEntries]
    updatedEntries[index] = { ...updatedEntries[index], [field]: value }
    setContactEntries(updatedEntries)
  }

  const handleBlurEntry = (index: number) => {
    const entry = contactEntries[index]
    const config = getContactTypeConfig(entry.type)
    if (config) {
      const updatedEntries = [...contactEntries]
      updatedEntries[index] = {
        ...updatedEntries[index],
        value: config.formatValue(entry.value)
      }
      updateContactEntries(updatedEntries)
    }
  }

  const removeEntry = (index: number) => {
    const updatedEntries = contactEntries.filter((_, i) => i !== index)
    const reorderedEntries = updatedEntries.map((entry, idx) => ({
      ...entry,
      order: idx
    }))

    updateContactEntries(reorderedEntries)
  }

  const handleNewEntryChange = (field: keyof ContactInfoEntry, value: any) => {
    setNewEntry(prev => ({ ...prev, [field]: value }))
  }

  const addEntry = () => {
    const error = validateContactEntry(newEntry)

    if (error) {
      toast({
        title: "Validation error",
        description: error,
        variant: "destructive",
      })
      return
    }

    const config = getContactTypeConfig(newEntry.type!)
    const formattedValue = config ? config.formatValue(newEntry.value!) : newEntry.value!

    const entry: ContactInfoEntry = {
      id: Date.now().toString(),
      type: newEntry.type as ContactInfoEntry['type'],
      value: formattedValue,
      label: newEntry.label?.trim() || undefined,
      order: contactEntries.length,
      is_whatsapp: newEntry.is_whatsapp || undefined
    }

    const updatedEntries = [...contactEntries, entry]
    updateContactEntries(updatedEntries)

    setNewEntry({
      type: 'email',
      value: '',
      label: '',
      is_whatsapp: false
    })
    setShowAddForm(false)
  }

  const handleCopyToClipboard = async (value: string, entry: ContactInfoEntry) => {
    try {
      const config = getContactTypeConfig(entry.type)
      const textToCopy = config?.urlPrefix ? `${config.urlPrefix}${value}` : value
      await navigator.clipboard.writeText(textToCopy)
      toast({
        title: "Copied to clipboard",
        description: "Contact information has been copied.",
      })
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  const renderViewMode = () => {
    if (contactEntries.length === 0) {
      return (
        <p className="text-muted-foreground italic text-sm">
          No contact information available
        </p>
      )
    }

    return (
      <div className="space-y-2">
        {contactEntries.map((entry) => {
          const IconComponent = getContactIcon(entry.type)
          const config = getContactTypeConfig(entry.type)
          const link = generateContactLink(entry)
          const displayValue = config?.urlPrefix ? `${config.urlPrefix}${entry.value}` : entry.value
          const labelText = entry.label || config?.label || entry.type

          return (
            <div key={entry.id} className="flex items-center gap-2 border rounded-lg p-3 hover:bg-muted/50 transition-colors">
              <IconComponent className="w-4 h-4 text-primary flex-shrink-0" />
              <a
                href={link}
                target={entry.type !== 'phone' && entry.type !== 'email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex-1 flex items-center gap-2 min-w-0"
              >
                <span className="text-blue-500 hover:underline truncate">{displayValue}</span>
                <span className="text-muted-foreground text-sm flex-shrink-0">{labelText}</span>
              </a>
              <Button
                size="sm"
                variant="ghost"
                className="h-8 w-8 p-0 flex-shrink-0"
                onClick={(e) => {
                  e.preventDefault()
                  handleCopyToClipboard(entry.value, entry)
                }}
              >
                <Copy className="w-4 h-4 text-muted-foreground" />
              </Button>
              <a
                href={link}
                target={entry.type !== 'phone' && entry.type !== 'email' ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="flex-shrink-0"
              >
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                  asChild
                >
                  <span>
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </span>
                </Button>
              </a>
            </div>
          )
        })}
      </div>
    )
  }

  const renderEditMode = () => {
    return (
      <div className="space-y-4">
        {contactEntries.map((entry, index) => {
          const config = getContactTypeConfig(entry.type)

          return (
            <div key={entry.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveUp(index)}
                      disabled={index === 0}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => moveDown(index)}
                      disabled={index === contactEntries.length - 1}
                      className="h-7 w-7 p-0"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="text-destructive hover:text-destructive h-7 w-7 p-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete this contact entry? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => removeEntry(index)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor={`type-${entry.id}`}>Type</Label>
                  <Select
                    value={entry.type}
                    onValueChange={(value) => handleEntryChange(index, 'type', value)}
                  >
                    <SelectTrigger id={`type-${entry.id}`}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTACT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor={`value-${entry.id}`}>
                    {config?.urlPrefix && (
                      <span className="text-xs text-muted-foreground">{config.urlPrefix}</span>
                    )}
                    {!config?.urlPrefix && 'Value'}
                  </Label>
                  <Input
                    id={`value-${entry.id}`}
                    value={entry.value}
                    onChange={(e) => handleEntryChange(index, 'value', e.target.value)}
                    onBlur={() => handleBlurEntry(index)}
                    placeholder={config?.placeholder || 'Enter value'}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor={`label-${entry.id}`}>Label (Optional)</Label>
                <Input
                  id={`label-${entry.id}`}
                  value={entry.label || ''}
                  onChange={(e) => handleEntryChange(index, 'label', e.target.value)}
                  onBlur={() => handleBlurEntry(index)}
                  placeholder="Custom label"
                />
              </div>

              {entry.type === 'phone' && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`whatsapp-${entry.id}`}
                    checked={entry.is_whatsapp || false}
                    onCheckedChange={(checked) => {
                      handleEntryChange(index, 'is_whatsapp', checked)
                      setTimeout(() => handleBlurEntry(index), 100)
                    }}
                  />
                  <Label htmlFor={`whatsapp-${entry.id}`} className="text-sm font-normal cursor-pointer">
                    Open in WhatsApp
                  </Label>
                </div>
              )}
            </div>
          )
        })}

        {showAddForm && (
          <div className="border-2 border-dashed border-primary/20 rounded-lg p-4 space-y-4">
            <h4 className="font-medium">Add New Contact</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-type">Type</Label>
                <Select
                  value={newEntry.type}
                  onValueChange={(value) => handleNewEntryChange('type', value)}
                >
                  <SelectTrigger id="new-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CONTACT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="new-value">
                  {getContactTypeConfig(newEntry.type!)?.urlPrefix && (
                    <span className="text-xs text-muted-foreground">
                      {getContactTypeConfig(newEntry.type!)?.urlPrefix}
                    </span>
                  )}
                  {!getContactTypeConfig(newEntry.type!)?.urlPrefix && 'Value'}
                </Label>
                <Input
                  id="new-value"
                  value={newEntry.value || ''}
                  onChange={(e) => handleNewEntryChange('value', e.target.value)}
                  placeholder={getContactTypeConfig(newEntry.type!)?.placeholder || 'Enter value'}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="new-label">Label (Optional)</Label>
              <Input
                id="new-label"
                value={newEntry.label || ''}
                onChange={(e) => handleNewEntryChange('label', e.target.value)}
                placeholder="Custom label"
              />
            </div>

            {newEntry.type === 'phone' && (
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="new-whatsapp"
                  checked={newEntry.is_whatsapp || false}
                  onCheckedChange={(checked) => handleNewEntryChange('is_whatsapp', checked)}
                />
                <Label htmlFor="new-whatsapp" className="text-sm font-normal cursor-pointer">
                  Open in WhatsApp
                </Label>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={addEntry} disabled={!newEntry.value?.trim()}>
                Add Contact
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            Contacts
          </div>
          {isEditing && !showAddForm && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Contact
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isEditing ? renderEditMode() : renderViewMode()}
      </CardContent>
    </Card>
  )
}
