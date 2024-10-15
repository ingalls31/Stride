import path, { api_path } from '~/constants/path'
import { purchase, purchasesStatusList } from '~/types/purchase.type'
import { successResponse } from '~/types/utils.type'
import axiosClients from './axiosClients'

export interface purchaseBody {
  product_id: string
  buy_count: number
}

const URL = api_path.purchases
const purchaseApi = {
  getPurchases() {
    return axiosClients.get(URL)
  },
  addToCart(body: any) {
    return axiosClients.post(URL, body)
  },
  updatePurchase(body: any) {
    const id = body.id
    delete body.id
    return axiosClients.patch(`${URL}${id}/`, body)
  },
  buyPurchase(body: any[]) {
    const url = api_path.order
    return axiosClients.post(`${url}`, body)
  },
  async deletePurchase(id: string[]) {
    console.log('id', id);
    for (const index of id) {
      await axiosClients.delete(`${URL}${index}/`)
    }
  }
}

export default purchaseApi
