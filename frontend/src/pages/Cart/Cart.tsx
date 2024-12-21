/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prettier/prettier */
import { produce } from 'immer'
import keyBy from 'lodash/keyBy'
import React, { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from 'react-query'
import { Link, createSearchParams, useLocation, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import productsApi from '~/apis/productApi'
import purchaseApi, { purchaseBody } from '~/apis/purchaseApi'
import { Checkbox, Button as AntButton, Empty, Tag } from 'antd'
import { Trash2, ChevronRight, Star, Package, ShoppingCart, ShoppingBag, Sparkles } from 'lucide-react'
import path from '~/constants/path'
import { queryParamsDefault } from '~/constants/product'
import { purchasesStatus } from '~/constants/purchase'
import { ExtendedPurchase, purchase } from '~/types/purchase.type'
import { formatPriceNumber, formatSocialNumber, generateNameId } from '~/utils/utils'
import useScrollTop from '~/hooks/useScrollTop'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import QuantityController from '~/components/QuantityController'
import RatingStar from '~/components/RatingStar'

export default function Cart() {
  const { t } = useTranslation('cart')
  useScrollTop()
  const [order, setOrder] = useState()
  const [extendedPurchases, setExtendedPurchases] = useState<ExtendedPurchase[]>([])
  const { data: purchasesInCartData, refetch } = useQuery({
    queryKey: ['purchase'],
    queryFn: () => purchaseApi.getPurchases()
  })
  const purchasesInCart = purchasesInCartData?.data.results
  const navigate = useNavigate()

  const updatePurchaseMutation = useMutation({
    mutationFn: (data: any) => purchaseApi.updatePurchase(data),
    onSuccess: () => {
      refetch()
    }
  })

  const deletePurchaseMutation = useMutation({
    mutationFn: (data: string[]) => purchaseApi.deletePurchase(data),
    onSuccess: () => {
      refetch()
    }
  })

  const buyPurchaseMutation = useMutation({
    mutationFn: (data: any) => purchaseApi.buyPurchase(data),
    onSuccess: (data: any) => {
      setOrder(data.data)
      navigate(`/order/${data.data.id}`)
      refetch()
      toast.success(data.data.message, {
        autoClose: 1000,
        position: 'top-center'
      })
    }
  })

  const isAllChecked = useMemo(
    () => extendedPurchases?.every((purchase) => purchase.checked),
    [extendedPurchases]
  )
  const checkedPurchase = useMemo(
    () => extendedPurchases.filter((purchase) => purchase.checked),
    [extendedPurchases]
  )
  const checkedPurchaseCount = checkedPurchase.length
  const totalPricePurchase = useMemo(
    () =>
      checkedPurchase.reduce((result, current) => {
        return result + current.product.price * current.quantity
      }, 0),
    [checkedPurchase]
  )
  const totalSavingPricePurchase = useMemo(
    () =>
      checkedPurchase.reduce((result, current) => {
        return result + (current.product.old_price - current.product.price) * current.quantity
      }, 0),
    [checkedPurchase]
  )

  const categoryName = purchasesInCart && purchasesInCart[0]?.product.agency
  const queryConfig = {
    page: queryParamsDefault.page,
    page_size: 12,
    agency: categoryName || ''
  }
  const { data: productCategoryData } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => productsApi.getProducts(queryConfig),
    staleTime: 3 * 60 * 1000,
    enabled: Boolean(categoryName)
  })
  const productCategory = productCategoryData?.data.results

  const location = useLocation()
  const chosenPurchaseIdFromLocation = (location.state as { purchaseId: string } | null)?.purchaseId

  useEffect(() => {
    setExtendedPurchases((prev) => {
      const extendedPurchasesObject = keyBy(prev, 'id')
      return (
        purchasesInCart?.map((purchase: any) => {
          const isChosenPurchaseFromLocation = chosenPurchaseIdFromLocation === purchase.id
          return {
            ...purchase,
            disabled: false,
            checked: isChosenPurchaseFromLocation || Boolean(extendedPurchasesObject[purchase.id]?.checked)
          }
        }) || []
      )
    })
  }, [purchasesInCart, chosenPurchaseIdFromLocation])

  useEffect(() => {
    return () => {
      history.replaceState(null, '')
    }
  }, [])

  const handleChecked = (purchaseIndex: number) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].checked = event.target.checked
      })
    )
  }

  const handleCheckedAll = () => {
    setExtendedPurchases((prev) =>
      prev.map((purchase) => ({
        ...purchase,
        checked: !isAllChecked
      }))
    )
  }

  const handleType = (purchaseIndex: number, value: number) => {
    setExtendedPurchases(
      produce((draft) => {
        draft[purchaseIndex].quantity = value
      })
    )
  }

  const handleOnFocusOut = (purchaseIndex: number, value: number, enable: boolean) => {
    if (enable) {
      const purchase = extendedPurchases[purchaseIndex]
      updatePurchaseMutation.mutate({ id: purchase.id, quantity: value })
    }
  }

  const handleQuantity = (purchaseIndex: number, value: number, enabled: boolean) => {
    if (enabled) {
      const purchase = extendedPurchases[purchaseIndex]
      setExtendedPurchases(
        produce((draft) => {
          draft[purchaseIndex].disabled = true
        })
      )
      updatePurchaseMutation.mutate({ id: purchase.id, quantity: value })
    }
  }

  const handleDeletePurchase = (purchaseIndex: number) => () => {
    const purchaseId = extendedPurchases[purchaseIndex].id
    deletePurchaseMutation.mutate([purchaseId])
  }

  const handleDeleteManyPurchase = () => {
    if (checkedPurchaseCount > 0) {
      const purchaseIds = checkedPurchase.map((purchase) => purchase.id)
      deletePurchaseMutation.mutate(purchaseIds)
    }
  }

  const handleBuyPurchase = () => {
    if (checkedPurchaseCount > 0) {
      const products = checkedPurchase.map((purchase) => ({
        productItem: purchase.product.productItem,
        quantity: purchase.quantity
      }))

      const total_price = totalPricePurchase

      const body = {
        products: products,
        total_price: total_price,
        status: 'creating'
      }

      buyPurchaseMutation.mutate(body)
      deletePurchaseMutation.mutate(checkedPurchase.map((purchase) => purchase.id))
    }
  }

  return (
    <>
      <Helmet>
        <title>{`${t('cart')} | Stride`}</title>
        <meta name='description' content='Page cart Stride' />
      </Helmet>
      <div className='min-h-screen border-b-4 border-b-orange bg-gray-50 pb-[60px] pt-10'>
        <div className='container'>
          {extendedPurchases && extendedPurchases.length > 0 ? (
            <>
              <div className='grid grid-cols-12 rounded-lg bg-white px-6 py-4 shadow-sm'>
                <div className='col-span-6 flex items-center'>
                  <Checkbox checked={isAllChecked} onChange={handleCheckedAll}>
                    <span className='ml-2 text-sm font-medium'>{t('product')}</span>
                  </Checkbox>
                </div>
                <div className='col-span-6 flex items-center'>
                  <div className='hidden flex-1 grid-cols-6 text-sm text-gray-500/90 lg:grid'>
                    <div className='col-span-2 text-center'>{t('unit price')}</div>
                    <div className='col-span-2 text-center'>{t('quantity')}</div>
                    <div className='col-span-1 text-center'>{t('total price')}</div>
                    <div className='col-span-1 text-center'>{t('actions')}</div>
                  </div>
                </div>
              </div>
              {extendedPurchases.map((purchase: any, index) => (
                <div key={purchase._id} className='mt-4 rounded-lg bg-white px-6 py-4 shadow-sm'>
                  <div className='grid grid-cols-12 gap-4 border px-5 py-4'>
                    <div className='col-span-12 flex items-center lg:col-span-6'>
                      <Checkbox
                        checked={purchase.checked}
                        onChange={handleChecked(index)}
                        className='mr-4'
                      />
                      <Link
                        to={`${path.home}${purchase.product.id}`}
                        className='flex items-start gap-4'
                      >
                        <img
                          className='h-20 w-20 rounded-md object-cover'
                          src={purchase.product.image}
                          alt={purchase.product.name}
                        />
                        <span className='line-clamp-2 pt-1 text-sm font-medium text-gray-800'>
                          {purchase.product.name}, {purchase.product.size}
                        </span>
                      </Link>
                    </div>
                    <div className='col-span-12 flex items-center lg:col-span-6'>
                      <div className='grid flex-1 grid-cols-2 gap-y-2 text-sm text-gray-500/90 sm:grid-cols-6'>
                        <div className='col-span-2'>
                          <div className='flex items-center justify-around gap-[10px] text-sm sm:justify-center'>
                            <span className='text-gray-400 line-through'>
                              ₫{formatPriceNumber(purchase.product.old_price)}
                            </span>
                            <span className='text-black'>₫{formatPriceNumber(purchase.product.price)}</span>
                          </div>
                        </div>
                        <div className='col-span-2 flex justify-center'>
                          <div className='flex items-center overflow-hidden rounded-sm shadow-sm'>
                            <QuantityController
                              value={purchase.quantity}
                              max={purchase.product.total}
                              onIncrease={(value) =>
                                handleQuantity(index, value, value <= purchase.product.total)
                              }
                              onDecrease={(value) => handleQuantity(index, value, value >= 1)}
                              onType={(value) => handleType(index, value)}
                              onFocusOut={(value) =>
                                handleOnFocusOut(index, value, value !== purchasesInCart[index].quantity)
                              }
                              disabled={purchase.disabled}
                            />
                          </div>
                        </div>
                        <div className='col-span-1 text-center text-sm text-orange'>
                          ₫{formatPriceNumber(purchase.product.price * purchase.quantity)}
                        </div>
                        <div className='col-span-1 text-center'>
                          <button
                            className='text-black outline-none hover:text-orange'
                            onClick={handleDeletePurchase(index)}
                          >
                            {t('delete')}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className='sticky bottom-0 mt-4 rounded-lg border bg-white px-6 py-4 shadow-sm'>
                <div className='flex flex-col items-center justify-between gap-y-2 md:flex-row'>
                  <div className='flex items-center'>
                    <Checkbox checked={isAllChecked} onChange={handleCheckedAll}>
                      <span className='ml-2'>
                        {t('select all')} ({extendedPurchases?.length})
                      </span>
                    </Checkbox>
                    <AntButton
                      type='text'
                      danger
                      icon={<Trash2 size={16} />}
                      onClick={handleDeleteManyPurchase}
                      className='ml-4'
                    >
                      {t('delete')} ({checkedPurchaseCount})
                    </AntButton>
                  </div>
                  <div className='flex w-full flex-1 flex-col items-center justify-end gap-[15px] gap-y-1 sm:w-auto sm:flex-row'>
                    <div className='flex flex-col space-y-2'>
                      <div className='flex items-center space-x-2'>
                        <ShoppingCart size={18} className='text-gray-500' />
                        <span className='text-gray-600'>
                          {t('total')} ({checkedPurchaseCount} {t('item')}):
                        </span>
                        <span className='text-2xl font-semibold text-orange'>
                          ₫{formatPriceNumber(totalPricePurchase)}
                        </span>
                      </div>
                      <div className='flex items-center justify-end space-x-3 text-sm'>
                        <Tag icon={<Sparkles size={14} />} color='success'>
                          {t('saved')}: ₫{formatPriceNumber(totalSavingPricePurchase)}
                        </Tag>
                      </div>
                    </div>
                    <AntButton
                      onClick={handleBuyPurchase}
                      disabled={buyPurchaseMutation.isLoading}
                      loading={buyPurchaseMutation.isLoading}
                      icon={<ShoppingBag size={16} />}
                      className='mr-[2px] h-12 w-full rounded-lg bg-orange px-8 text-base font-medium capitalize text-white transition-all hover:bg-orange hover:shadow-lg disabled:bg-gray-300 sm:w-[220px]'
                    >
                      {t('check out')}
                    </AntButton>
                  </div>
                </div>
              </div>
              <div className='mt-12'>
                <div className='mb-6 flex items-center justify-between'>
                  <h2 className='text-lg font-medium text-gray-700'>{t('you may also like')}</h2>
                  <Link
                    to={{
                      pathname: path.home,
                      search: createSearchParams().toString()
                    }}
                    className='flex items-center gap-1 text-orange hover:opacity-80'
                  >
                    <span>{t('see all')}</span>
                    <ChevronRight size={16} />
                  </Link>
                </div>
                <div className='mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
                  {productCategory &&
                    productCategory.map((product: any) => (
                      <Link
                  title={product.name}
                  key={product._id}
                  to={`${path.home}${product.id}`}
                  className='group col-span-1 h-full overflow-hidden rounded-lg bg-white shadow-md ring-1 ring-gray-200 transition-all duration-300 hover:translate-y-[-3px] hover:shadow-xl'
                >
                  <div className='relative w-full pt-[100%]'>
                    <img
                      className='absolute left-0 top-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                      src={product.image_url}
                      alt={product.name}
                    />
                  </div>
                  <div className='p-4'>
                    <div className='line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800'>
                      {product.name}
                    </div>
                    <div className='mt-2 flex flex-col items-start gap-1 sm:flex-row sm:items-center'>
                      <div className='flex items-end text-sm text-gray-400 line-through'>
                        <span>₫</span>
                        <span>{formatPriceNumber(product.old_price)}</span>
                      </div>
                      <div className='flex items-center text-orange'>
                        <span className='text-xs'>₫</span>
                        <span className='text-base font-bold'>{formatPriceNumber(product.price)}</span>
                      </div>
                    </div>
                    <div className='mt-3 flex items-center justify-between'>
                      <RatingStar rating={product.average_rating} />
                      <div className='flex items-center text-xs text-gray-500'>
                        <Package className='mr-1 h-3 w-3' />
                        {formatSocialNumber(product.buyed_total)} {t('sold')}
                      </div>
                    </div>
                  </div>
                </Link>
                    ))}
                </div>
              </div>
            </>
          ) : (
            <div className='flex h-[60vh] items-center justify-center'>
              <Empty
                description={
                  <div className='text-center'>
                    <p className='text-gray-500'>{t('desc_err')}</p>
                    <p className='mt-2 text-gray-500'>{t('or')}</p>
                    <Link to={path.home}>
                      <AntButton type='primary' className='mt-4 bg-orange hover:bg-orange/90'>
                        {t('add some')}
                      </AntButton>
                    </Link>
                  </div>
                }
              />
            </div>
          )}
        </div>
      </div>
    </>
  )
}
