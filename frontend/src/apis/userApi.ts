import path, {api_path} from '~/constants/path'
import axiosClients from './axiosClients'
import { successResponse } from '~/types/utils.type'
import { User } from '~/types/user.type'

interface bodyUpdateProfile extends Omit<User, '_id' | 'roles' | 'email' | 'createdAt' | 'updatedAt'> {
  password?: string | unknown
  new_password?: string | unknown
}

const userApi = {
  getProfile() {
    const url = api_path.me
    return axiosClients.get(url)
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  updateProfile(body: any) {
    const url = `/customers/${body.id}/`
    delete body.id
    return axiosClients.patch(url, body)
  },
  updateAvatarProfile(body: FormData) {
    const url = '/images/'
    return axiosClients.post(url, body, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }
}

export default userApi
