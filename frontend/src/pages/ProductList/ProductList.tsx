import classNames from 'classnames'
import { useContext, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { useTranslation } from 'react-i18next'
import { useQuery } from 'react-query'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import { AppContext } from '~/Contexts/app.context'
import productsApi from '~/apis/productApi'
import userApi from '~/apis/userApi'
import FilterPanel from '~/components/FilterPanel'
import Paginate from '~/components/Paginate'
import RatingStar from '~/components/RatingStar'
import SortBar from '~/components/SortBar'
import path from '~/constants/path'
import { queryParamsDefault } from '~/constants/product'
import useQueryConfig from '~/hooks/useQueryConfig'
import useScrollTop from '~/hooks/useScrollTop'
import { productListConfig } from '~/types/products.type'
import { setProfileToLS } from '~/utils/auth'
import { formatPriceNumber, formatSocialNumber, generateNameId } from '~/utils/utils'
import { Empty, Button } from 'antd'
import { Search, Package } from 'lucide-react'

export type QueryConfig = {
  [key in keyof productListConfig]: string
}

export default function ProductList() {
  const { t } = useTranslation('home')
  useScrollTop()
  const navigate = useNavigate()
  const queryConfig = useQueryConfig()

  console.log('\u001B[36m 🚀 INFO: 🔥 ProductList 🔥 queryConfig 👇\n \u001B[0m', queryConfig)

  const resultSearch = queryConfig.name
  const { isAuthenticated } = useContext(AppContext)

  const { data } = useQuery({
    queryKey: ['products', queryConfig],
    queryFn: () => productsApi.getProducts(queryConfig as productListConfig),
    keepPreviousData: true,
    staleTime: 3 * 60 * 1000
  })

  if (isAuthenticated) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: profileData, refetch } = useQuery({
      queryKey: ['profile'],
      queryFn: userApi.getProfile
    })
    setProfileToLS(profileData?.data.results[0])
  }

  // useEffect(() => {
  //   setProfileToLS(profileData?.data.results[0])
  // }, [profileData])

  const handleResetFilter = () => {
    navigate({
      pathname: path.home,
      search: createSearchParams({
        page: queryParamsDefault.page.toString(),
        limit: queryParamsDefault.limit.toString()
      }).toString()
    })
  }

  return (
    <>
      <Helmet>
        <title>{`${t('home')} | Stride`}</title>
        <meta name='description' content='Page home Stride' />
      </Helmet>
      <div
        className={classNames('border-b-4 border-b-orange bg-gradient-to-b from-gray-50 to-white pb-[60px]', {
          'pt-10': !resultSearch,
          'pt-5': resultSearch
        })}
      >
        <div className='container max-w-[1700px]'>
          <div className='flex flex-col gap-5 md:flex-row'>
            <div className='md:w-[300px]'>
              <FilterPanel queryConfig={queryConfig} />
            </div>
            {data && data.data.results.length <= 0 ? (
              <div className='mt-10 flex flex-1 flex-col items-center'>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description={t('desc_err')}
                >
                  <Button
                    type='primary'
                    onClick={handleResetFilter}
                    className='mt-4 bg-orange hover:bg-orange/90'
                  >
                    {t('reset filter')}
                  </Button>
                </Empty>
              </div>
            ) : (
              <div className='flex-1'>
                {resultSearch && (
                  <div className='mb-6 flex items-center text-gray-600'>
                    <Search className='mr-3 h-5 w-5' />
                    {t('search result for')}
                    <span className='ml-1 font-medium text-orange'>&apos;{resultSearch}&apos;</span>
                  </div>
                )}
                <SortBar queryConfig={queryConfig} pageSize={data?.data.totalPage as number} />
                <div className='mb-12 mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6'>
                  {data?.data.results?.map((product: any) => (
                    <Link
                      title={product.name}
                      key={product.id}
                      to={`${path.home}${product.id}`}
                      className='group col-span-1 h-full overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md'
                    >
                      <div className='relative w-full pt-[100%]'>
                        <img
                          className='absolute left-0 top-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105'
                          src={product.image_url}
                          alt={product.name}
                        />
                      </div>
                      <div className='p-4'>
                        <div className='line-clamp-2 min-h-[2.5rem] text-sm font-medium text-gray-800'>{product.name}</div>
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
                <Paginate queryConfig={queryConfig} pageSize={data?.data.total_page as number} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
