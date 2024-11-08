import axios from 'axios'
import { toast } from 'react-toastify'
import HttpStatusCode from '~/constants/HttpStatusCode'
import config from '~/constants/config'
import path, { api_path } from '~/constants/path'
import { authResponse } from '~/types/auth.type'
import { clearLS, getAccessTokenToLS, setAccessTokenToLS, setRefreshTokenToLS } from '~/utils/auth'

const axiosClients = axios.create({
  baseURL: config.baseUrl,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
})

axiosClients.interceptors.request.use(
  function (config) {
    const accessToken = getAccessTokenToLS()
    if (config.headers && accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
      return config
    }
    return config
  },
  function (error) {
    return Promise.reject(error)
  }
)

axiosClients.interceptors.response.use(
  function (response) {
    const { url } = response.config
    if (url === api_path.login) {
      const data = response.data as authResponse
      const accessToken = data.access
      const refeshToken = data.refresh
      setAccessTokenToLS(accessToken)
      setRefreshTokenToLS(refeshToken)
    }
    if (url === path.logout) {
      clearLS()
    }
    return response
  },
  function (error) {
    const { status, data, config } = error.response
    if (
      status !== HttpStatusCode.UnprocessableEntity ||
      (status === HttpStatusCode.UnprocessableEntity && config.url === path.products)
    ) {
      const message = data?.message || error.message
      toast.error(message, {
        autoClose: 3000
      })
    }
    if (status === HttpStatusCode.Unauthorized) {
      clearLS()
      window.location.reload()
    }
    return Promise.reject(error)
  }
)

export default axiosClients
