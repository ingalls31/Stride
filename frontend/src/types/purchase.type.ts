import { product } from './products.type'

export interface purchaseProduct {
  productItem: string
  id: string
  image: string 
  name: string 
  old_price: number 
  price: number 
  total: number
}

export interface purchase {
  id: string
  product: purchaseProduct
  quantity: number
}

export interface ExtendedPurchase extends purchase {
  disabled: boolean
  checked: boolean
}

export type purchasesStatus = -1 | 1 | 2 | 3 | 4 | 5
export type purchasesStatusList = 0 | purchasesStatus
