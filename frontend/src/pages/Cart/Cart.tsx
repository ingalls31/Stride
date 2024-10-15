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
import Button from '~/components/Button'
import QuantityController from '~/components/QuantityController'
import RatingStar from '~/components/RatingStar'
import path from '~/constants/path'
import { queryParamsDefault } from '~/constants/product'
import { purchasesStatus } from '~/constants/purchase'
import { ExtendedPurchase, purchase } from '~/types/purchase.type'
import { formatPriceNumber, formatSocialNumber, generateNameId } from '~/utils/utils'
import useScrollTop from '~/hooks/useScrollTop'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'

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

    }
  }

  return (
    <>
      <Helmet>
        <title>{`${t('cart')} | Stride`}</title>
        <meta name='description' content='Page cart Stride' />
      </Helmet>
      <div className='border-b-4 border-b-orange bg-[#f5f5f5] pb-[60px] pt-10'>
        <div className='container'>
          {extendedPurchases && extendedPurchases.length > 0 ? (
            <>
              <div className='grid grid-cols-12 rounded-[3px] bg-white px-10 py-4 shadow-sm'>
                <div className='col-span-6 flex items-center'>
                  <div className='flex items-center'>
                    <input
                      id='CheckedAllProduct'
                      type='checkbox'
                      className='h-[18px] w-[18px] accent-orange'
                      checked={isAllChecked}
                      onChange={handleCheckedAll}
                    />
                    <label htmlFor='CheckedAllProduct' className='cursor-pointer px-[20px] text-sm'>
                      {t('product')}
                    </label>
                  </div>
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
              {extendedPurchases &&
                extendedPurchases.map((purchase: any, index) => (
                  <div key={purchase._id} className='mt-[15px] rounded-[3px] bg-white px-5 py-4 shadow-sm'>
                    <div className='grid grid-cols-12 gap-4 border px-5 py-[16px]'>
                      <div className='col-span-12 flex items-center lg:col-span-6'>
                        <div className='flex items-center gap-5'>
                          <input
                            id='CheckedAllProduct'
                            type='checkbox'
                            className='h-[18px] w-[18px] flex-shrink-0 accent-orange'
                            checked={purchase.checked}
                            onChange={handleChecked(index)}
                          />
                          <Link
                            title={purchase.product.name}
                            to={`${path.home}${purchase.product.id}`}
                            className='flex items-start gap-[10px]'
                          >
                            <img
                              className='h-20 w-20 object-cover'
                              src={purchase.product.image}
                              alt={purchase.product.name}
                            />
                            <span className='line-clamp-2 pt-[5px] text-sm text-black'>
                              {purchase.product.name}, {purchase.product.size}
                            </span>
                          </Link>
                        </div>
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
                                  handleOnFocusOut(
                                    index,
                                    value,
                                    value !== purchasesInCart[index].quantity
                                  )
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
              <div className='sticky bottom-0 mt-[15px] rounded-[3px] border bg-white px-5 py-1 shadow-sm sm:py-4'>
                <div className='flex flex-col items-center justify-between gap-y-1 text-base md:flex-row'>
                  <div className='flex flex-1 items-center'>
                    <input
                      id='selectAllProduct'
                      type='checkbox'
                      className='h-[18px] w-[18px] accent-orange'
                      checked={isAllChecked}
                      onChange={handleCheckedAll}
                    />
                    <label htmlFor='selectAllProduct' className='cursor-pointer px-[20px]'>
                      {t('select all')} ({extendedPurchases?.length})
                    </label>
                    <button onClick={handleDeleteManyPurchase} className='px-1 outline-none'>
                      {t('delete')} ({checkedPurchaseCount})
                    </button>
                  </div>
                  <div className='flex w-full flex-1 flex-col items-center justify-end gap-[15px] gap-y-1 sm:w-auto sm:flex-row'>
                    <div>
                      <div className='flex items-center gap-[5px]'>
                        <span>
                          {t('total')} ({checkedPurchaseCount} {t('item')}):
                        </span>
                        <span className='text-2xl leading-4 text-orange'>
                          ₫{formatPriceNumber(totalPricePurchase)}
                        </span>
                      </div>
                      <div className='flex items-center justify-end gap-[24px] text-sm'>
                        <span>{t('saved')}</span>
                        <span className='text-orange'>₫{formatPriceNumber(totalSavingPricePurchase)}</span>
                      </div>
                    </div>
                    <Button
                      onClick={handleBuyPurchase}
                      disabled={buyPurchaseMutation.isLoading}
                      isLoading={buyPurchaseMutation.isLoading}
                      className='mr-[2px] w-full rounded-sm bg-orange px-[36px] py-[10px] text-sm capitalize text-white  sm:w-[210px]'
                    >
                      {t('check out')}
                    </Button>
                  </div>
                </div>
              </div>
              <div className='mt-9 flex items-center justify-between'>
                <div className='text-base uppercase text-gray-500'>{t('you may also like')}</div>
                <Link
                  title={t('see all')}
                  to={{
                    pathname: path.home,
                    search: createSearchParams().toString()
                  }}
                  className='flex items-center gap-1 p-1 text-sm text-orange'
                >
                  <span>{t('see all')}</span>
                  <svg
                    enableBackground='new 0 0 11 11'
                    viewBox='0 0 11 11'
                    x={0}
                    y={0}
                    className='h-[10px] w-[10px] fill-orange'
                  >
                    <path d='m2.5 11c .1 0 .2 0 .3-.1l6-5c .1-.1.2-.3.2-.4s-.1-.3-.2-.4l-6-5c-.2-.2-.5-.1-.7.1s-.1.5.1.7l5.5 4.6-5.5 4.6c-.2.2-.2.5-.1.7.1.1.3.2.4.2z' />
                  </svg>
                </Link>
              </div>
              <div className='mt-5 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'>
                {productCategory &&
                  productCategory.map((product: any) => (
                    <Link
                      title={product.name}
                      key={product.id}
                      to={`${path.home}${product.id}`}
                      className='col-span-1 h-full overflow-hidden rounded-sm bg-white shadow transition hover:translate-y-[-.0625rem] hover:shadow-[0_0.0625rem_20px_0_rgba(0,0,0,.05)]'
                    >
                      <div className='relative w-full pt-[100%]'>
                        <img
                          className='absolute left-0 top-0 h-full w-full object-cover'
                          src={product.image_url}
                          alt={product.name}
                        />
                      </div>
                      <div className='p-2'>
                        <div className='line-clamp-2 text-xs'>{product.name}</div>
                        <div className='mt-2 flex items-center gap-1'>
                          <div className='flex items-end text-sm text-gray-400 line-through'>
                            <span>₫</span>
                            <span>{formatPriceNumber(product.old_price)}</span>
                          </div>
                          <div className='flex items-center text-orange'>
                            <span className='text-xs'>₫</span>
                            <span className='text-base'>{formatPriceNumber(product.price)}</span>
                          </div>
                        </div>
                        <div className='mb-1 mt-3 flex items-center gap-1'>
                          <div className='flex items-center gap-[1px]'>
                            <RatingStar size={10} rating={product.average_rating} />
                          </div>
                          <span className='text-xs'>
                            {formatSocialNumber(product.buyed_total)} {t('sold')}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
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
