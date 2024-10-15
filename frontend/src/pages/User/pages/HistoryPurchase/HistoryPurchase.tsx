import classNames from 'classnames'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { Link, createSearchParams } from 'react-router-dom'
import orderApi from '~/apis/orderApi'
import purchaseApi from '~/apis/purchaseApi'
import { orderStatus } from '~/constants/order'
import path from '~/constants/path'
import { purchasesStatus } from '~/constants/purchase'
import useQueryParams from '~/hooks/useQueryParams'
import useScrollTop from '~/hooks/useScrollTop'
import { purchasesStatusList } from '~/types/purchase.type'
import { formatPriceNumber, generateNameId } from '~/utils/utils'

export default function HistoryPurchase() {
  const { t } = useTranslation('profile')
  const queryParams: { status?: string } = useQueryParams() 
  const status: string = queryParams.status ? String(queryParams.status) : orderStatus.creating.toString()
  useScrollTop([status])


  const { data: ordersData } = useQuery({
    queryKey: ['orders', { status }],
    queryFn: () => orderApi.getOrders({ status: status })
  })
  const orders = ordersData?.data.results
  console.log('orders', orders);

  return (
    <>
      <Helmet>
        <title>{`${t('my purchase')} | Stride`}</title>
        <meta name='description' content='Page history purchase Stride' />
      </Helmet>
      <div style={{ height: '100vh'}}>
        <div className='grid grid-cols-2 rounded-sm shadow-sm md:grid-cols-6'>
          <Link
            title={'Đang tạo'}
            to={{
              pathname: path.historyPurchase,
              search: createSearchParams({
                status: orderStatus.creating.toString()
              }).toString()
            }}
            className={classNames(
              'flex flex-1 items-center justify-center border-b-2  bg-white py-3 text-center hover:text-orange',
              {
                'border-b-orange text-orange': orderStatus.creating === status,
                'border-b-black/10 text-black': orderStatus.creating !== status
              }
            )}
          >
            {'Đang tạo'}
          </Link>
          <Link
            title={'Chờ duyệt'}
            to={{
              pathname: path.historyPurchase,
              search: createSearchParams({
                status: orderStatus.pending.toString()
              }).toString()
            }}
            className={classNames(
              'flex flex-1 items-center justify-center border-b-2  bg-white py-3 text-center hover:text-orange',
              {
                'border-b-orange text-orange': orderStatus.pending === status,
                'border-b-black/10 text-black': orderStatus.pending !== status
              }
            )}
          >
            {'Chờ duyệt'}
          </Link>
          <Link
            title={t('to ship')}
            to={{
              pathname: path.historyPurchase,
              search: createSearchParams({
                status: orderStatus.ship.toString()
              }).toString()
            }}
            className={classNames(
              'flex flex-1 items-center justify-center border-b-2  bg-white py-3 text-center hover:text-orange',
              {
                'border-b-orange text-orange': orderStatus.ship === status,
                'border-b-black/10 text-black': orderStatus.ship !== status
              }
            )}
          >
            {t('to ship')}
          </Link>
          <Link
            title={'Trả hàng'}
            to={{
              pathname: path.historyPurchase,
              search: createSearchParams({
                status: orderStatus.return.toString()
              }).toString()
            }}
            className={classNames(
              'flex flex-1 items-center justify-center border-b-2  bg-white py-3 text-center hover:text-orange',
              {
                'border-b-orange text-orange': orderStatus.return === status,
                'border-b-black/10 text-black': orderStatus.return !== status
              }
            )}
          >
            {'Trả hàng'}
          </Link>
          <Link
            title={t('to receive')}
            to={{
              pathname: path.historyPurchase,
              search: createSearchParams({
                status: orderStatus.complete.toString()
              }).toString()
            }}
            className={classNames(
              'flex flex-1 items-center justify-center border-b-2  bg-white py-3 text-center hover:text-orange',
              {
                'border-b-orange text-orange': orderStatus.complete === status,
                'border-b-black/10 text-black': orderStatus.complete !== status
              }
            )}
          >
            {t('to receive')}
          </Link>
          <Link
            title={t('cancelled')}
            to={{
              pathname: path.historyPurchase,
              search: createSearchParams({
                status: orderStatus.cancel.toString()
              }).toString()
            }}
            className={classNames(
              'flex flex-1 items-center justify-center border-b-2  bg-white py-3 text-center hover:text-orange',
              {
                'border-b-orange text-orange': orderStatus.cancel === status,
                'border-b-black/10 text-black': orderStatus.cancel !== status
              }
            )}
          >
            {t('cancelled')}
          </Link>
        </div>
        {orders &&
          orders.map((order: any) => (
            <div
              key={order.id}
              className='mt-4 rounded-sm border-black/10 bg-white p-4 text-gray-800 shadow-sm'
            >
              <Link
                to={`/order/${order.id}`}
                className='mb-1 flex flex-col gap-3 sm:mb-0 sm:gap-0 lg:flex-row'
                title={order.products[0].name}
              >
                <div className='flex-shrink-0'>
                  <img
                    className='h-20 w-20 object-cover'
                    src={order.products[0].image}
                    alt={order.products[0].name}
                  />
                </div>
                <div className='ml-0 flex-grow overflow-hidden sm:ml-3'>
                  <div className='line-clamp-2'>{order.products[0].name}</div>
                  <div className='mt-3'>x{order.products[0].quantity}</div>
                </div>
                <div className='ml-0 flex-shrink-0 sm:ml-3'>
                  <span className='truncate text-gray-500 line-through'>
                    ₫{formatPriceNumber(order.products[0].old_price)}
                  </span>
                  <span className='ml-2 truncate text-orange'>
                    ₫{formatPriceNumber(order.products[0].price)}
                  </span>
                </div>
              </Link>
              <div className='flex items-center justify-end text-sm sm:items-start'>
                <span>{t('order total')}:</span>
                <span className='ml-3 text-xl text-orange'>
                  ₫{formatPriceNumber(order.total_price)}
                </span>
              </div>
            </div>
          ))}
        {orders && orders.length <= 0 && (
          <div className='mt-4 flex h-[600px] flex-1 flex-col items-center justify-center bg-white text-lg text-[#0000008a] shadow'>
            <img
              src='https://deo.shopeemobile.com/shopee/shopee-pcmall-live-sg/5fafbb923393b712b96488590b8f781f.png'
              className='h-[100px] w-[100px]'
              alt='No orders yet'
            />
            <span className='mt-4'>{t('no orders yet')}</span>
          </div>
        )}
      </div>

    </>
  )
}
