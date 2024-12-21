import classNames from 'classnames'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import orderApi from '~/apis/orderApi'
import purchaseApi from '~/apis/purchaseApi'
import { orderStatus } from '~/constants/order'
import path from '~/constants/path'
import { purchasesStatus } from '~/constants/purchase'
import useQueryParams from '~/hooks/useQueryParams'
import useScrollTop from '~/hooks/useScrollTop'
import { purchasesStatusList } from '~/types/purchase.type'
import { formatPriceNumber, generateNameId } from '~/utils/utils'
import { Card, Typography, Tag, Empty, Tabs } from 'antd'
import { Package, ShoppingBag, Truck, RotateCcw, CheckCircle, XCircle, DollarSign } from 'lucide-react'

export default function HistoryPurchase() {
  const { t } = useTranslation('profile')
  const navigate = useNavigate()
  const queryParams: { status?: string } = useQueryParams() 
  const status: string = queryParams.status ? String(queryParams.status) : orderStatus.creating.toString()
  useScrollTop([status])


  const { data: ordersData } = useQuery({
    queryKey: ['orders', { status }],
    queryFn: () => orderApi.getOrders({ status: status })
  })
  const orders = ordersData?.data.results
  console.log('orders', orders);

  const tabItems = [
    {
      key: orderStatus.creating.toString(),
      label: (
        <span className='flex items-center gap-2 text-[#4A9B9B] font-medium px-2'>
          <Package size={18} className="stroke-[1.5]" />
          Đang tạo
        </span>
      )
    },
    {
      key: orderStatus.pending.toString(),
      label: (
        <span className='flex items-center gap-2 text-[#4A9B9B] font-medium px-2'>
          <ShoppingBag size={18} className="stroke-[1.5]" />
          Chờ duyệt
        </span>
      )
    },
    {
      key: orderStatus.ship.toString(),
      label: (
        <span className='flex items-center gap-2 text-[#4A9B9B] font-medium px-2'>
          <Truck size={18} className="stroke-[1.5]" />
          {t('to ship')}
        </span>
      )
    },
    {
      key: orderStatus.return.toString(),
      label: (
        <span className='flex items-center gap-2 text-[#4A9B9B] font-medium px-2'>
          <RotateCcw size={18} className="stroke-[1.5]" />
          Trả hàng
        </span>
      )
    },
    {
      key: orderStatus.complete.toString(),
      label: (
        <span className='flex items-center gap-2 text-[#4A9B9B] font-medium px-2'>
          <CheckCircle size={18} className="stroke-[1.5]" />
          {t('to receive')}
        </span>
      )
    },
    {
      key: orderStatus.cancel.toString(),
      label: (
        <span className='flex items-center gap-2 text-[#4A9B9B] font-medium px-2'>
          <XCircle size={18} className="stroke-[1.5]" />
          {t('cancelled')}
        </span>
      )
    }
  ]

  return (
    <>
      <Helmet>
        <title>{`${t('my purchase')} | Stride`}</title>
        <meta name='description' content='Page history purchase Stride' />
      </Helmet>
      <div className='min-h-screen bg-[#4A9B9B]/5 p-4 md:p-6'>
        <Card className='mb-6 shadow-sm'>
          <Tabs
            activeKey={status}
            items={tabItems}
            onChange={(key) => {
              navigate({
                pathname: path.historyPurchase,
                search: createSearchParams({
                  status: key
                }).toString()
              })
            }}
            className='[&_.ant-tabs-ink-bar]:bg-[#4A9B9B] [&_.ant-tabs-tab-active]:text-[#4A9B9B] [&_.ant-tabs-tab:hover]:text-[#4A9B9B] [&_.ant-tabs-nav]:before:border-b-[#4A9B9B]/20'
          />
        </Card>

        {orders && orders.length > 0 ? (
          orders.map((order: any) => (
            <Card 
              key={order.id} 
              className='mb-4 hover:shadow-md transition-all duration-300 hover:border-[#4A9B9B]/60 group'
              bordered={false}
            >
              <Link
                to={`/order/${order.id}`}
                className='flex flex-col gap-6 lg:flex-row lg:items-center'
              >
                <div className='flex-shrink-0 group-hover:opacity-90 transition-opacity'>
                  <img
                    className='h-24 w-24 rounded-lg object-cover shadow-sm'
                    src={order.products[0].image}
                    alt={order.products[0].name}
                  />
                </div>
                <div className='flex-grow'>
                  <Typography.Text strong className='line-clamp-2 text-base group-hover:text-[#4A9B9B] transition-colors'>
                    {order.products[0].name}
                  </Typography.Text>
                  <Typography.Text type='secondary' className='mt-2 block text-sm'>
                    Số lượng: {order.products[0].quantity}
                  </Typography.Text>
                </div>
                <div className='flex flex-col items-end gap-3'>
                  <div>
                    <Typography.Text delete type='secondary' className='mr-3 text-sm'>
                      ₫{formatPriceNumber(order.products[0].old_price)}
                    </Typography.Text>
                    <Typography.Text type='danger' className='text-base'>
                      ₫{formatPriceNumber(order.products[0].price)}
                    </Typography.Text>
                  </div>
                  <div className='flex items-center gap-2'>
                    <DollarSign size={18} className='text-[#4A9B9B]' />
                    <Typography.Title level={4} className='!mb-0 text-[#4A9B9B]'>
                      ₫{formatPriceNumber(order.total_price)}
                    </Typography.Title>
                  </div>
                </div>
              </Link>
            </Card>
          ))
        ) : (
          <Card className='flex items-center justify-center py-20 shadow-sm'>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <Typography.Text type='secondary' className='text-base'>
                  {t('no orders yet')}
                </Typography.Text>
              }
            />
          </Card>
        )}
      </div>
    </>
  )
}
