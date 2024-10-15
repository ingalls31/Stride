import path, { api_path } from '~/constants/path'
import { authProfile, authResponse } from '~/types/auth.type'
import { LoginFormData } from '~/utils/rulesForm'
import axiosClients from './axiosClients'
import { clearLS } from '~/utils/auth'
import HttpStatusCode from '~/constants/HttpStatusCode'

const AuthApi = {
  login(data: LoginFormData) {
    const url = api_path.login
    return axiosClients.post<authResponse>(url, data)
  },
  register(data: LoginFormData) {
    const url = api_path.register
    return axiosClients.post<authProfile>(url, data)
  },
}

export default AuthApi
