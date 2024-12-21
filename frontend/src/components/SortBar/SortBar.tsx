import { QueryConfig } from '~/pages/ProductList/ProductList'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import { queryParamsDefault, sortBy, orderConstant } from '~/constants/product'
import { productListConfig } from '~/types/products.type'
import path from '~/constants/path'
import classNames from 'classnames'
import omit from 'lodash/omit'
import { useTranslation } from 'react-i18next'
import { Button, Select } from 'antd'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  queryConfig: QueryConfig
  pageSize: number
}

export default function SortBar({ queryConfig, pageSize }: Props) {
  const { t } = useTranslation('home')
  const navigate = useNavigate()
  const { sort_by = queryParamsDefault.sort_by, order, page } = queryConfig
  const handleSort = (value: Exclude<productListConfig['sort_by'], undefined>) => {
    navigate({
      pathname: path.home,
      search: createSearchParams(
        omit(
          {
            ...queryConfig,
            sort_by: value.toString()
          },
          ['order']
        )
      ).toString()
    })
  }
  const isActive = (value: Exclude<productListConfig['sort_by'], undefined>) => {
    return sort_by === value
  }
  const handleOrder = (value: Exclude<productListConfig['order'], undefined>) => {
    navigate({
      pathname: path.home,
      search: createSearchParams({
        ...queryConfig,
        sort_by: value === 'asc' ? sortBy.price.toString() : `-${sortBy.price.toString()}`
      }).toString()
    })
  }
  return (
    <div className='flex flex-wrap items-center gap-2 rounded-sm bg-[#ededed] px-5 py-3 lg:justify-between'>
      <div className='flex flex-wrap items-center gap-2.5 text-sm'>
        <span className='text-gray-500'>{t('sort by')}</span>
        <Button
          onClick={() => handleSort(sortBy.view)}
          type={isActive(sortBy.view) ? 'primary' : 'default'}
          className={classNames('min-w-[90px]', {
            'bg-orange border-orange': isActive(sortBy.view)
          })}
        >
          {t('popular')}
        </Button>
        <Button
          onClick={() => handleSort(sortBy.createdAt)}
          type={isActive(sortBy.createdAt) ? 'primary' : 'default'}
          className={classNames('min-w-[90px]', {
            'bg-orange border-orange': isActive(sortBy.createdAt)
          })}
        >
          {t('lasted')}
        </Button>
        <Button
          onClick={() => handleSort(sortBy.sold)}
          type={isActive(sortBy.sold) ? 'primary' : 'default'}
          className={classNames('min-w-[90px]', {
            'bg-orange border-orange': isActive(sortBy.sold)
          })}
        >
          {t('top sales')}
        </Button>
        <Select value={order as 'asc' | 'desc' | undefined} onChange={handleOrder} className='min-w-[200px]' placeholder={t('price')}>
          <Select.Option value={orderConstant.asc}>{t('low to high')}</Select.Option>
          <Select.Option value={orderConstant.desc}>{t('high to low')}</Select.Option>
        </Select>
      </div>

      <div className='flex items-center gap-5'>
        <div className='flex items-center text-sm'>
          <span className='text-orange'>{page}</span>
          <span>/{pageSize}</span>
        </div>
        <div className='flex items-center gap-1'>
          {Number(page) > 1 ? (
            <Link
              title={t('previous')}
              to={{
                pathname: path.home,
                search: createSearchParams({
                  ...queryConfig,
                  page: (Number(page) - 1).toString()
                }).toString()
              }}
            >
              <Button icon={<ChevronLeft className='h-4 w-4' />} />
            </Link>
          ) : (
            <Button disabled icon={<ChevronLeft className='h-4 w-4' />} />
          )}

          {Number(page) < pageSize ? (
            <Link
              title={t('next')}
              to={{
                pathname: path.home,
                search: createSearchParams({
                  ...queryConfig,
                  page: (Number(page) + 1).toString()
                }).toString()
              }}
            >
              <Button icon={<ChevronRight className='h-4 w-4' />} />
            </Link>
          ) : (
            <Button disabled icon={<ChevronRight className='h-4 w-4' />} />
          )}
        </div>
      </div>
    </div>
  )
}
