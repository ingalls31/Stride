type Role = 'Admin' | 'User'

export type User = {
  id: string
  email: string
  name?: string
  is_superuser?: boolean
  first_name?: string
  last_name?: string
  address?: string
  phone_number?: string
  date_of_birth?: string
  avatar?: string,
  avatar_url?: string
}

export type PaginatedResponse = {
  count: number
  page_size: number
  total_page: number
  current_page: number
  results: User[]
}
 