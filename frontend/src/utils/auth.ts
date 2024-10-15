import AuthApi from '~/apis/authApi'
import { api_path } from '~/constants/path'
import { User } from '~/types/user.type'

export const setAccessTokenToLS = (access: string) => localStorage.setItem('access', access)
export const setRefreshTokenToLS = (refresh: string) => localStorage.setItem('refresh', refresh)

export const getAccessTokenToLS = () => localStorage.getItem('access') || ''
export const getRefreshTokenToLS = () => localStorage.getItem('refresh') || ''

export const clearLS = () => {
  localStorage.removeItem('access')
  localStorage.removeItem('refresh')
  localStorage.removeItem('profile')
}

export const setProfileToLS = (profile: User) => {
  localStorage.setItem('profile', JSON.stringify(profile))
}

export const getProfileToLS = () => {
  const result = localStorage.getItem('profile')
  return result ? JSON.parse(result) : null
}
