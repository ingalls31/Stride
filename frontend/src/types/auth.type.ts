import { User } from './user.type'
import { successResponse } from './utils.type'

export type authResponse = {
  access: string
  refresh: string
}

export type authProfile = successResponse<{
  id: string
  email: string
  first_name: string
  last_name: string
  address: string
  phone_number: string
  avatar: string
}>
