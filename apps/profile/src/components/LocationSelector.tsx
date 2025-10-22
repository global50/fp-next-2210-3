import { useState, useCallback, useEffect } from 'react'
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MapPin, Building2, Globe, X, Plus, Loader2 } from 'lucide-react'
import { LocationItem, ReferenceListItem } from '../types/location'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface LocationSelectorProps {
  cities: LocationItem[]
  countries: LocationItem[]
  onAddLocation: (location: LocationItem) => boolean
  onRemoveLocation: (location: LocationItem) => void
  onClearAll: () => void
  maxLocations?: number
}

export function LocationSelector({
  cities,
  countries,
  onAddLocation,
  onRemoveLocation,
  onClearAll,
  maxLocations = 3
}: LocationSelectorProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [cityResults, setCityResults] = useState<ReferenceListItem[]>([])
  const [countryResults, setCountryResults] = useState<ReferenceListItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [activeTab, setActiveTab] = useState<'city' | 'country'>('city')

  const allLocations = [...cities, ...countries]
  const isMaxReached = allLocations.length >= maxLocations

  const fetchReferenceLists = useCallback(async (listType: 'city' | 'country', query: string) => {
    if (query.length < 2) {
      if (listType === 'city') {
        setCityResults([])
      } else {
        setCountryResults([])
      }
      return
    }

    setIsSearching(true)

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      if (!supabaseUrl || !supabaseAnonKey) {
        throw new Error('Supabase configuration missing')
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/fetch-reference-lists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          list_type: listType,
          search_query: query
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch reference data')
      }

      const data = await response.json()

      if (data.success && data.items) {
        if (listType === 'city') {
          setCityResults(data.items)
        } else {
          setCountryResults(data.items)
        }
      }
    } catch (error) {
      console.error('Error fetching reference lists:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery) {
        fetchReferenceLists(activeTab, searchQuery)
      } else {
        setCityResults([])
        setCountryResults([])
      }
    }, 300)

    return () => clearTimeout(timeoutId)
  }, [searchQuery, activeTab, fetchReferenceLists])

  const handleAddLocation = (type: 'city' | 'country', item: ReferenceListItem) => {
    const location: LocationItem = {
      type,
      id: item.id,
      name: item.name,
      metadata: {
        country: item.country,
        code: item.code,
        population: item.population
      }
    }

    const success = onAddLocation(location)
    if (success) {
      setSearchQuery('')
      setCityResults([])
      setCountryResults([])
      setOpen(false)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value as 'city' | 'country')
    setSearchQuery('')
    setCityResults([])
    setCountryResults([])
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MapPin className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm font-medium">Location</span>
        {allLocations.length > 0 && (
          <span className="text-xs text-muted-foreground">
            ({allLocations.length}/{maxLocations})
          </span>
        )}
      </div>

      {allLocations.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {cities.map((city) => (
            <Badge
              key={`city-${city.id}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <Building2 className="w-3 h-3" />
              {city.name}
              <button
                onClick={() => onRemoveLocation(city)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
          {countries.map((country) => (
            <Badge
              key={`country-${country.id}`}
              variant="secondary"
              className="gap-1 pr-1"
            >
              <Globe className="w-3 h-3" />
              {country.name}
              <button
                onClick={() => onRemoveLocation(country)}
                className="ml-1 rounded-full hover:bg-muted p-0.5"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={isMaxReached}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              {allLocations.length === 0 ? 'Add location' : 'Add another'}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="city" className="text-xs">
                  <Building2 className="w-3 h-3 mr-1" />
                  Cities
                </TabsTrigger>
                <TabsTrigger value="country" className="text-xs">
                  <Globe className="w-3 h-3 mr-1" />
                  Countries
                </TabsTrigger>
              </TabsList>

              <TabsContent value="city" className="mt-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search cities..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {isSearching && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                    {!isSearching && searchQuery.length < 2 && (
                      <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
                    )}
                    {!isSearching && searchQuery.length >= 2 && cityResults.length === 0 && (
                      <CommandEmpty>No cities found</CommandEmpty>
                    )}
                    {!isSearching && cityResults.length > 0 && (
                      <CommandGroup>
                        {cityResults.map((city) => (
                          <CommandItem
                            key={city.id}
                            value={city.name}
                            onSelect={() => handleAddLocation('city', city)}
                          >
                            <Building2 className="w-4 h-4 mr-2" />
                            <span>{city.name}</span>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </TabsContent>

              <TabsContent value="country" className="mt-0">
                <Command shouldFilter={false}>
                  <CommandInput
                    placeholder="Search countries..."
                    value={searchQuery}
                    onValueChange={setSearchQuery}
                  />
                  <CommandList>
                    {isSearching && (
                      <div className="flex items-center justify-center py-6">
                        <Loader2 className="w-4 h-4 animate-spin" />
                      </div>
                    )}
                    {!isSearching && searchQuery.length < 2 && (
                      <CommandEmpty>Type at least 2 characters to search</CommandEmpty>
                    )}
                    {!isSearching && searchQuery.length >= 2 && countryResults.length === 0 && (
                      <CommandEmpty>No countries found</CommandEmpty>
                    )}
                    {!isSearching && countryResults.length > 0 && (
                      <CommandGroup>
                        {countryResults.map((country) => (
                          <CommandItem
                            key={country.id}
                            value={country.name}
                            onSelect={() => handleAddLocation('country', country)}
                          >
                            <Globe className="w-4 h-4 mr-2" />
                            <span>{country.name}</span>
                            {country.code && (
                              <span className="ml-auto text-xs text-muted-foreground">
                                {country.code}
                              </span>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    )}
                  </CommandList>
                </Command>
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>

        {allLocations.length > 0 && (
          <Button variant="ghost" size="sm" onClick={onClearAll}>
            Clear all
          </Button>
        )}
      </div>

      {allLocations.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Add up to {maxLocations} cities or countries
        </p>
      )}
      {isMaxReached && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxLocations} locations reached
        </p>
      )}
    </div>
  )
}
