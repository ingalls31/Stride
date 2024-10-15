const path = {
  login: '/login',
  register: '/register',
  logout: '/logout',
  home: '/',
  products: '/products',
  categories: '/categories',
  productDetail: ':nameId',
  cart: '/cart',
  purchases: '/purchases',
  user: '/user/*',
  profile: '/user/profile',
  changePassword: '/user/password',
  historyPurchase: '/user/purchase',
  me: 'me',
  order: '/order/:orderId',
  star: '*'
} as const

export const api_path = {
  login: '/token/',
  register: '/customers/',
  logout: '/logout',
  home: '/',
  products: '/products',
  categories: '/agency',
  productDetail: ':nameId',
  cart: '/cart',
  purchases: '/cart/',
  order: '/order/',
  user: '/user/*',
  profile: '/customers',
  changePassword: '/user/password',
  historyPurchase: '/user/purchase',
  me: '/customers/',
  rating: '/rating/',
  star: '*'
} as const

export default path
