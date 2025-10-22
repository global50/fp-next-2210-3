export interface LocationItem {
  type: 'city' | 'country'
  id: number
  name: string
  metadata?: {
    country?: string
    code?: string
    population?: number
  }
}

export interface LocationData {
  cities: LocationItem[]
  countries: LocationItem[]
}

export interface LocationRelation {
  id: number
  type: string
  metadata: any
  src_table: string
  src_id: string
  dst_table: string
  dst_id: string
  created_at: string
}

export interface ReferenceListItem {
  id: number
  name: string
  country?: string
  code?: string
  population?: number
}

export interface LocationUpdatePayload {
  locations: Array<{
    type: 'city' | 'country'
    id: number
    name: string
  }>
}
