import { api_path } from '~/constants/path'
import axiosClients from './axiosClients'

export interface purchaseBody {
  product_id: string
  buy_count: number
}

const URL = api_path.order
const orderApi = {
  getOrders(params: any) {
    console.log('params', params)
    return axiosClients.get(URL, { params })
  },
  getOrderDetail(id: string) {
    return axiosClients.get(`${URL}${id}/`)
  },
  async updateOrder(body: any) {
    const id = body.id
    delete body.id
    return axiosClients.patch(`${URL}${id}/`, body)
  },
  async deleteOrder(id: string[]) {
    for (const index of id) {
      await axiosClients.delete(`${URL}${index}/`)
    }
  },
  async createCheckout(id: string) {
    return axiosClients.get(`${URL}${id}/create-checkout-session/`)
  }
}

export default orderApi
