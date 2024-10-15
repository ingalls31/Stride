import path, { api_path } from '~/constants/path'
import axiosClients from './axiosClients'
import { successResponse } from '~/types/utils.type'
import { product, productList, productListConfig } from '~/types/products.type'

const url = api_path.products
const productsApi = {
  getProducts(params: productListConfig) {
    console.log('params', params);
    return axiosClients.get(url, { params })
  },
  getProductDetail(id: string) {
    return axiosClients.get(`${url}/${id}`)
  },
  getCategories() {
    const url = api_path.categories
    return axiosClients.get(url)
  }
}

export default productsApi
