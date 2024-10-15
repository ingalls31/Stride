import { api_path } from '~/constants/path'
import axiosClients from './axiosClients'



const URL = api_path.rating
const ratingApi = {
  create(body: any) {
    return axiosClients.post(URL, body)
  },
  get(params: any) {
    return axiosClients.get(URL, { params })
  },
  update(body: any) {
    const id = body.id
    delete body.id
    return axiosClients.patch(`${URL}${id}/`, body)
  }
}

export default ratingApi
