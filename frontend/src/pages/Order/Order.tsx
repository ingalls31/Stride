/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable prettier/prettier */
import { produce } from 'immer'
import keyBy from 'lodash/keyBy'
import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { Link, createSearchParams, useLocation, useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import productsApi from '~/apis/productApi'
import purchaseApi, { purchaseBody } from '~/apis/purchaseApi'
import Button from '~/components/Button'
import QuantityController from '~/components/QuantityController'
import RatingStar from '~/components/RatingStar'
import path from '~/constants/path'
import { orderConstant, queryParamsDefault } from '~/constants/product'
import { purchasesStatus } from '~/constants/purchase'
import { ExtendedPurchase, purchase } from '~/types/purchase.type'
import { formatPriceNumber, formatSocialNumber, generateNameId } from '~/utils/utils'
import useScrollTop from '~/hooks/useScrollTop'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import orderApi from '~/apis/orderApi'
import RatingItem from '~/components/RatingItem/RatingItem'
import ratingApi from '~/apis/ratingApi'
import {loadStripe} from '@stripe/stripe-js';
import { Card, Input, Button as AntButton, Divider, Tag, Typography } from 'antd'
import { Package, Truck, CreditCard, Wallet, Star, ShoppingBag, X, ShoppingCart, Sparkles, User, Phone, MapPin } from 'lucide-react'

export default function Order() {
  const { t } = useTranslation('cart')
  const { orderId } = useParams()
  const navigate = useNavigate()
  useScrollTop()

  const [payment, setPayment] = useState(false)
  const [orders, setOrders] = useState({
    receiver: '',
    address: '',
    phone: '',
    status: '',
    payment_done: false,
    products: [
      {
        id: '',
        order_product_id: 0,
        product_id: '',
        price: 0,
        old_price: 0,
        total: 0,
        image: '',
        agency: '',
        size: '',
        quantity: 0,
        rate_point: 0,
        comment: '',
        rated: false
      }
    ]
  })

  useEffect(() => {
    if (orders)
      setPayment(orders.payment_done)
  }, [orders])

  const {data: orderData, refetch: refetchOrderData } = useQuery({
    queryKey: ['order'],
    queryFn: () => orderApi.getOrderDetail(orderId as string)
  })


  useEffect(() => {
    console.log('orderData', orderData);
    setOrders(orderData?.data);
  }, [orderData])

  useEffect(() => {
    console.log('orders', orders)
  }, [orders])

  const updateOrderMutation = useMutation({
    mutationFn: (data: any) => orderApi.updateOrder(data),
    onSuccess: () => {
      refetchOrderData()
    }
  })

  const ratingMutation = useMutation({
    mutationFn: (data: any) => ratingApi.create(data),
    onSuccess: () => {
      refetchOrderData()
    }
  })


  const updateProductRating = (productId: number, newRating: number) => {
    setOrders(prevOrders => {
      const newProducts = prevOrders.products.map(product => {
        if (product.order_product_id === productId && !product.rated) {
          return { ...product, rate_point: newRating }; // Cập nhật rating mới
        }
        return product;
      });

      return { ...prevOrders, products: newProducts };
    });
  };

  const updateProductComment = (productId: number, newComment: string) => {
    setOrders(prevOrders => {
      const newProducts = prevOrders.products.map(product => {
        if (product.order_product_id === productId) {
          return { ...product, comment: newComment }; // Cập nhật rating mới
        }
        return product;
      });

      return { ...prevOrders, products: newProducts };
    });
  };

  const totalPrice = useMemo(
    () =>
      {
        if (orders && orders.products.length > 0) {
          let total = 0;

          for (const product of orders.products) {
            total += product.price * product.quantity
          }

          return total
        }

        return 0
      },
    [orders]
  )
  const totalSavingPrice = useMemo(
    () =>
      {
        if (orders && orders.products.length > 0) {
          let total = 0;

          for (const product of orders.products) {
            total += (product.old_price - product.price) * product.quantity
          }

          return total
        }

        return 0
      },
    [orders]
  )



  useEffect(() => {
    return () => {
      history.replaceState(null, '')
    }
  }, [])



  const handleQuantity = (productIndex: number, value: number, enabled: boolean) => {
    if (enabled && orders.status === 'creating') {
      setOrders(prevOrders => {
        const updateProducts = [...prevOrders.products]

        updateProducts[productIndex].quantity = value

        return {
          ...prevOrders,
          products: updateProducts
        };
      })
    }
  }

  const handleOrder = () => {
    updateOrderMutation.mutate({ ...orders, status: 'pending' })
  }

  const cancelOrder = () => {
    updateOrderMutation.mutate({ ...orders, status: 'cancel' })
    // navigate(path.home)
  }

  const returnOrder = () => {
    updateOrderMutation.mutate({ ...orders, status: 'return' })
    // navigate(path.home)
  }
  const completeOrder = () => {
    updateOrderMutation.mutate({ ...orders, status: 'complete' })
    // navigate(path.home)
  }

  const pushRating = (order_product: number, rate_point: number, comment: string) => {
    ratingMutation.mutate({
      order_product: order_product,
      rate_point: rate_point,
      comment: comment
    })
  }

  const makePayment = async () => {
    const stripe = await loadStripe("pk_test_51PRgAhP7RR63vqAvPdxKNQl1xFwqwhXdvIwnmtrYvwNaJtvpO2b96oiiUzZlqFteVcU70CQ44dfDq7h5J35bn1Th00X2mLVxaS")

    const headers = {
      "Content-Type": "application/json",
    }

    const response = await orderApi.createCheckout(orderId as string)
    console.log('response', response);

    const session = response.data

    const result = stripe?.redirectToCheckout({
      sessionId: session.session_id
    })
  }

  return (
    <>
      <Helmet>
        <title>{`Đặt hàng | Stride`}</title>
        <meta name='description' content='Page cart Stride' />
      </Helmet>
      <div className='border-b-12 border-b-orange bg-[#f5f5f5] pb-[60px] pt-10'>
        <div className='container'>
          <div className='grid rounded-[12x] bg-white px-10 shadow-sm'>
            <br />
            <Card className='shadow-sm hover:border-orange/60'>
              <Typography.Title level={5} className='text-orange'>
                <Package className='inline mr-2' size={20} />
                Thông tin Nhận Hàng
              </Typography.Title>
              {orders && (
                <div className='flex gap-4'>
                  <div className='flex-1'>
                    <Typography.Text strong>
                      <User className='inline mr-1' size={16} />
                      Họ tên:
                    </Typography.Text>
                    <Input
                      className='ml-2 hover:border-orange focus:border-orange'
                      value={orders.receiver}
                      onChange={(e) => setOrders({ ...orders, receiver: e.target.value })}
                      disabled={orders.status !== 'creating'}
                      prefix={<User size={16} className='text-gray-400' />}
                    />
                  </div>
                  <div className='flex-1'>
                    <Typography.Text strong>
                      <Phone className='inline mr-1' size={16} />
                      SĐT:
                    </Typography.Text>
                    <Input
                      className='ml-2 hover:border-orange focus:border-orange'
                      value={orders.phone}
                      onChange={(e) => setOrders({ ...orders, phone: e.target.value })}
                      disabled={orders.status !== 'creating'}
                      prefix={<Phone size={16} className='text-gray-400' />}
                    />
                  </div>
                  <div className='flex-[2]'>
                    <Typography.Text strong>
                      <MapPin className='inline mr-1' size={16} />
                      Địa chỉ:
                    </Typography.Text>
                    <Input
                      className='ml-2 hover:border-orange focus:border-orange'
                      value={orders.address}
                      onChange={(e) => setOrders({ ...orders, address: e.target.value })}
                      disabled={orders.status !== 'creating'}
                      prefix={<MapPin size={16} className='text-gray-400' />}
                    />
                  </div>
                </div>
              )}
            </Card>
            <br />
          </div>
        </div>
        <br />
        <div className='container'>
          {orders && orders.products.length > 0 ? (
            <>
              <Card>
                <div className='grid grid-cols-12 items-center'>
                  <div className='col-span-6'>
                    <Typography.Text strong>
                      <ShoppingBag className='inline mr-2' size={16} />
                      {t('product')}
                    </Typography.Text>
                  </div>
                  <div className='col-span-6'>
                    <div className='hidden lg:grid grid-cols-6 text-gray-500'>
                      <div className='col-span-2 text-center'>{t('unit price')}</div>
                      <div className='col-span-2 text-center'>{t('quantity')}</div>
                      <div className='col-span-2 text-center'>{t('total price')}</div>
                    </div>
                  </div>
                </div>
              </Card>
              {
                orders.products.map((order: any, index: number) => (
                  <div key={order.id} className='mt-[15px] rounded-[3px] bg-white px-5 py-4 shadow-sm'>
                    <div className='grid grid-cols-12 gap-4 border px-5 py-[16px]'>
                      <div className='col-span-12 flex items-center lg:col-span-6'>
                        <div className='flex items-center gap-5'>
                          {/* <input
                            id='CheckedAllProduct'
                            type='checkbox'
                            className='h-[18px] w-[18px] flex-shrink-0 accent-orange'
                            checked={purchase.checked}
                            onChange={handleChecked(index)}
                          /> */}
                          <Link
                            title={order.name}
                            to={`${path.home}${order.product_id}`}
                            className='flex items-start gap-[10px]'
                          >
                            <img
                              className='h-20 w-20 object-cover'
                              src={order.image}
                              alt={order.name}
                            />
                            <span className='line-clamp-2 pt-[5px] text-sm text-black'>
                              {order.name}, {order.size}
                            </span>

                          </Link>
                        </div>
                        
                      </div>
                      <div className='col-span-12 flex items-center lg:col-span-6'>
                        <div className='grid flex-1 grid-cols-2 gap-y-2 text-sm text-gray-500/90 sm:grid-cols-6'>
                          <div className='col-span-2'>
                            <div className='flex items-center justify-around gap-[10px] text-sm sm:justify-center'>
                              <span className='text-gray-400 line-through'>
                                ₫{formatPriceNumber(order.old_price)}
                              </span>
                              <span className='text-black'>₫{formatPriceNumber(order.price)}</span>
                            </div>
                          </div>
                          <div className='col-span-2 flex justify-center'>
                            <div className='flex items-center overflow-hidden rounded-sm shadow-sm'>
                              <QuantityController
                                value={order.quantity}
                                max={order.total}
                                onIncrease={(value) =>
                                  handleQuantity(index, value, value <= order.total)
                                }
                                onDecrease={(value) => handleQuantity(index, value, value >= 1)}
                              />
                            </div>
                          </div>
                          <div className='col-span-2 text-center text-sm text-orange'>
                            ₫{formatPriceNumber(order.price * order.quantity)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {
                      orders.status === 'complete' && (
                        <div className='grid grid-cols-12 gap-4 border px-5 py-[16px]' style={{ marginTop: '10px'}}>
                          <div className='col-span-12 lg:col-span-12'>
                            <div className='gap-12'>
                              <textarea 
                                className={`border flex items-center border-orange bg-[#d1d9da] py-[30px] w-full`}
                                style={{ paddingLeft: '31px',paddingRight: '31px' }}
                                onChange={(e) => updateProductComment(order.order_product_id, e.target.value)}
                                disabled={order.rated}
                                value={order.comment}
                              ></textarea>
                            </div>
                          </div>
                          <div className='col-span-12 flex items-center lg:col-span-6'>
                            <div className='flex items-center gap-5'>
                              <RatingItem rating={order.rate_point} updateProductRating={updateProductRating}  size={35}  productId={order.order_product_id} />
                            </div>
                          </div>
                          <div className='col-span-12 flex items-center lg:col-span-6'>
                            <div className='grid flex-1 grid-cols-2 gap-y-2 text-sm text-gray-500/90 sm:grid-cols-6'>
                              <div className='col-span-4 flex justify-center'>
                                <div className='flex items-center overflow-hidden rounded-sm shadow-sm'>
                                </div>
                              </div>
                              <div className='col-span-2 text-center text-sm text-orange'>
                                <Button
                                  onClick={() => pushRating(order.order_product_id, order.rate_point, order.comment)}
                                  disabled={order.rated}
                                  isLoading={updateOrderMutation.isLoading}
                                  className='mr-[2px] w-full rounded-sm bg-orange px-[36px] py-[10px] text-sm capitalize text-white  sm:w-[180px]'
                                  style = {{marginTop: '10px'}}
                                >
                                  {
                                    order.rated ? 'Đã đánh giá' : 'Đánh giá'
                                  }
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    }
                  </div>
                ))}
              <div className='sticky bottom-0 mt-[15px] rounded-[3px] border bg-white px-5 py-1 shadow-sm sm:py-4'>
                <div className='mt-[15px] rounded-[3px] bg-white px-5 py-4 shadow-sm'>
                  <div className='grid grid-cols-12 gap-4 border px-5 py-[16px]'>
                    <div className='col-span-12 flex items-center'>
                      <div className='grid flex-1 grid-cols-2 gap-y-2 text-sm text-gray-500/90 sm:grid-cols-6'>
                        <div className='col-span-12'>
                          <div className='items-center justify-around gap-[10px] text-sm sm:justify-center'>
                            <span className='text-orange' style={{ marginRight: '60px' }}>
                                <strong>Phương thức thanh toán:</strong> 
                            </span>
                            <Card className='mt-4'>
                              <div className='flex items-center gap-4'>
                                <Typography.Text strong className='text-orange'>
                                  <CreditCard className='inline mr-2' size={16} />
                                  Phương thức thanh toán:
                                </Typography.Text>
                                <AntButton
                                  type={!payment ? 'primary' : 'default'}
                                  icon={<Wallet size={16} />}
                                  onClick={() => {
                                    if (orders.status === 'creating' || orders.status === 'cancel' || orders.status === 'return') {
                                      setPayment(false)
                                    }
                                  }}
                                  disabled={!(orders.status === 'creating' || orders.status === 'cancel' || orders.status === 'return')}
                                  className="h-10"
                                  style={{ backgroundColor: payment ? '#fff' : '#4A9B9B', color: payment ? '#000' : '#fff' }}
                                >
                                  Thanh toán khi nhận hàng
                                </AntButton>
                                <AntButton
                                  type={payment ? 'primary' : 'default'}
                                  icon={<CreditCard size={16} />}
                                  onClick={() => {
                                    if (orders.status === 'creating' || orders.status === 'cancel' || orders.status === 'return') {
                                      setPayment(true)
                                    }
                                    else if (payment === false && orders.status !== 'complete') {
                                      makePayment()
                                    }
                                  }}
                                  className="h-10"
                                  style={{ backgroundColor: payment ? '#4A9B9B' : '#fff', color: payment ? '#fff' : '#000' }}
                                >
                                  Tài khoản ngân hàng {orders && orders.payment_done ? 
                                    <Tag color="success">Đã thanh toán</Tag> : 
                                    <Tag color="warning">Chưa thanh toán</Tag>
                                  }
                                </AntButton>
                              </div>
                            </Card>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className='flex flex-col items-center justify-between gap-y-1 text-base md:flex-row'>
                  <div className='flex w-full flex-1 flex-col items-center justify-end gap-[15px] gap-y-1 sm:w-auto sm:flex-row'>
                    <div className='flex flex-col space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <ShoppingCart size={18} className='text-gray-500' />
                        <span className='text-gray-600'>
                          {t('total')} ({orders.products.length} {t('item')}):
                        </span>
                        <span className='text-2xl font-semibold text-orange'>
                          ₫{formatPriceNumber(totalPrice)}
                        </span>
                      </div>
                      <div className='flex items-center justify-end space-x-3 text-sm'>
                        <Tag icon={<Sparkles size={14} />} color='success'>
                          {t('saved')}: ₫{formatPriceNumber(totalSavingPrice)}
                        </Tag>
                      </div>
                    </div>
                    <div className='flex gap-3 mt-4'>
                      {orders.status !== 'ship' && (
                        <AntButton
                          type='primary'
                          size='large'
                          loading={updateOrderMutation.isLoading}
                          disabled={(orders.status !== 'creating' && orders.status !== 'cancel' && orders.status !== 'return') || updateOrderMutation.isLoading}
                          onClick={async () => {
                            handleOrder()
                            if (payment) {
                              makePayment()
                            }
                          }}
                          className="h-12 min-w-[200px]"
                          style={{ 
                            backgroundColor: (orders.status !== 'creating' && orders.status !== 'cancel' && orders.status !== 'return') ? '#d9d9d9' : '#4A9B9B',
                            color: (orders.status !== 'creating' && orders.status !== 'cancel' && orders.status !== 'return') ? 'rgba(0, 0, 0, 0.25)' : '#fff',
                            cursor: (orders.status !== 'creating' && orders.status !== 'cancel' && orders.status !== 'return') ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {(orders.status === 'creating' || orders.status === 'cancel') && 'Đặt hàng'}
                          {orders.status === 'pending' && 'Chờ duyệt'}
                          {orders.status === 'ship' && 'Đang vận chuyển'}
                          {orders.status === 'complete' && 'Đã chuyển hàng thành công'}
                          {orders.status === 'return' && 'Đặt lại'}
                        </AntButton>
                      )}
                      {(orders.status === 'ship') && 
                        <AntButton
                          type='primary'
                          size='large'
                          loading={updateOrderMutation.isLoading}
                          onClick={completeOrder}
                          disabled={updateOrderMutation.isLoading}
                          className="h-12 min-w-[200px]"
                          style={{ 
                            backgroundColor: updateOrderMutation.isLoading ? '#d9d9d9' : '#4A9B9B',
                            color: updateOrderMutation.isLoading ? 'rgba(0, 0, 0, 0.25)' : '#fff'
                          }}
                        >
                          {orders.status === 'ship' && 'Xác nhận đã nhận được hàng'}
                        </AntButton>
                      }
                      {(orders.status === 'ship') && 
                        <AntButton
                          type='primary'
                          size='large'
                          loading={updateOrderMutation.isLoading}
                          onClick={returnOrder}
                          disabled={updateOrderMutation.isLoading}
                          className="h-12 min-w-[200px]"
                          style={{ 
                            backgroundColor: updateOrderMutation.isLoading ? '#d9d9d9' : '#4A9B9B',
                            color: updateOrderMutation.isLoading ? 'rgba(0, 0, 0, 0.25)' : '#fff'
                          }}
                        >
                          {orders.status === 'ship' && 'Xác nhận không nhận đơn hàng'}
                        </AntButton>
                      }
                      {(orders.status === 'pending' || orders.status === 'cancel' || orders.status === 'ship') && 
                        <AntButton
                          type='primary'
                          size='large'
                          loading={updateOrderMutation.isLoading}
                          onClick={cancelOrder}
                          disabled={(orders.status === 'cancel' || orders.status === 'ship') || updateOrderMutation.isLoading}
                          className="h-12 min-w-[200px]"
                          style={{ 
                            backgroundColor: (orders.status === 'cancel' || orders.status === 'ship' || updateOrderMutation.isLoading) ? '#d9d9d9' : '#4A9B9B',
                            color: (orders.status === 'cancel' || orders.status === 'ship' || updateOrderMutation.isLoading) ? 'rgba(0, 0, 0, 0.25)' : '#fff',
                            cursor: (orders.status === 'cancel' || orders.status === 'ship') ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {orders.status === 'cancel' && 'Đã Hủy Đơn'}
                          {orders.status === 'pending' && 'Hủy Đơn'}
                          {orders.status === 'ship' && 'Đơn hàng đang trên đường giao tới bạn'}
                        </AntButton>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className='my-20 flex flex-1 flex-col items-center text-lg text-[#0000008a]'>
              <img
                src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/a60759ad1dabe909c46a817ecbf71878.png'
                className='h-[134px] w-[134px]'
                alt='No purchase'
              />
              <span>{t('desc_err')}</span>
              <span className='mt-4'>{t('or')}</span>
              <Link
                title={t('add some')}
                to={path.home}
                className='mt-4 rounded-sm bg-orange px-8 py-[10px] text-lg capitalize text-white shadow-sm hover:bg-orange/90'
              >
                {t('add some')}
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
