export type productList = {
  products: product[]
  pagination: {
    page: number
    limit: number
    page_size: number
  }
}

export type product = {
  id: string
  images: string[]
  price: number
  rating: number
  price_before_discount: number
  quantity: number
  sold: number
  view: number
  name: string
  category: {
    _id: string
    name: string
  }
  image: string
  createdAt: string
  updatedAt: string
  description: string
}

export type productListConfig = {
  page?: number | string
  limit?: number | string
  order?: 'desc' | 'asc'
  sort_by?: '-created_at' | 'view' | '-buyed_total' | 'price'
  agency?: string
  exclude?: string
  average_rating?: number | string
  max_price?: number | string
  min_price?: number | string
  name?: string
}
