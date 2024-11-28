export const orderConstant = {
  desc: 'desc',
  asc: 'asc'
} as const

export const sortBy = {
  createdAt: '-created_at',
  view: 'view',
  sold: '-buyed_total',
  price: 'price'
} as const

export const queryParamsDefault = {
  page: '1',
  limit: '32',
  sort_by: 'view',
  order: 'asc'
}
