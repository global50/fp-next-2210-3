import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Award, Plus, Edit, Trash2 } from "lucide-react"
import { useState } from "react"

interface Award {
  id: number
  title: string
  issuer: string
  date: string
  description: string
}

interface AwardsSectionProps {
  isEditing: boolean
}

export function AwardsSection({ isEditing }: AwardsSectionProps) {
  const [awards, setAwards] = useState<Award[]>([])
  const [showAddAwardForm, setShowAddAwardForm] = useState(false)
  const [newAward, setNewAward] = useState({
    title: '',
    issuer: '',
    date: '',
    description: ''
  })

  const addAward = () => {
    if (newAward.title && newAward.issuer) {
      setAwards(prev => [...prev, {
        id: Date.now(),
        ...newAward
      }])
      setNewAward({
        title: '',
        issuer: '',
        date: '',
        description: ''
      })
      setShowAddAwardForm(false)
    }
  }

  const removeAward = (id: number) => {
    setAwards(prev => prev.filter(award => award.id !== id))
  }

  return (
    <Card className="mb-8 hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5" />
            Awards and Achievements
          </div>
          {isEditing && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => setShowAddAwardForm(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Award
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {awards.length === 0 && !isEditing && (
            <p className="text-muted-foreground italic">
              No awards or achievements added yet.
            </p>
          )}
          
          {awards.map((award, index) => (
            <div key={index} className="border-l-2 border-primary/20 pl-4">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                <h3 className="font-semibold text-lg">{award.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{award.date}</span>
                  {isEditing && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost">
                        <Edit className="w-3 h-3" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Award</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this award? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => removeAward(award.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-primary font-medium mb-2">{award.issuer}</p>
              <p className="text-muted-foreground">{award.description}</p>
            </div>
          ))}
          
          {isEditing && showAddAwardForm && (
            <div className="border-l-2 border-dashed border-primary/20 pl-4 space-y-4">
              <h3 className="font-semibold text-lg">Add New Award</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="award-title">Award Title</Label>
                  <Input
                    id="award-title"
                    value={newAward.title}
                    onChange={(e) => setNewAward(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Best Developer Award"
                  />
                </div>
                <div>
                  <Label htmlFor="award-issuer">Issuer/Organization</Label>
                  <Input
                    id="award-issuer"
                    value={newAward.issuer}
                    onChange={(e) => setNewAward(prev => ({ ...prev, issuer: e.target.value }))}
                    placeholder="Tech Company Inc."
                  />
                </div>
                <div>
                  <Label htmlFor="award-date">Date</Label>
                  <Input
                    id="award-date"
                    value={newAward.date}
                    onChange={(e) => setNewAward(prev => ({ ...prev, date: e.target.value }))}
                    placeholder="2024"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="award-description">Description</Label>
                <Textarea
                  id="award-description"
                  value={newAward.description}
                  onChange={(e) => setNewAward(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the achievement..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={addAward}>Add Award</Button>
                <Button variant="outline" onClick={() => setShowAddAwardForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}