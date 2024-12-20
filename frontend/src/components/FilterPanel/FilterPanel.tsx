import classNames from 'classnames'
import omit from 'lodash/omit'
import { useQuery } from 'react-query'
import { Link, createSearchParams, useNavigate } from 'react-router-dom'
import productsApi from '~/apis/productApi'
import path from '~/constants/path'
import { QueryConfig } from '~/pages/ProductList/ProductList'
import InputNumber from '../InputNumber'
import { useForm, Controller } from 'react-hook-form'
import { FormDataPrice, InputPriceSchema } from '~/utils/rulesForm'
import { NoUndefinedField } from '~/types/utils.type'
import { yupResolver } from '@hookform/resolvers/yup'
import { ObjectSchema } from 'yup'
import { useTranslation } from 'react-i18next'
import { Divider, Input, Button, Rate } from 'antd'
import { Filter, Package, Tag, Star, Banknote } from 'lucide-react'

interface Props {
  queryConfig: QueryConfig
}

export default function FilterPanel({ queryConfig }: Props) {
  const { t } = useTranslation('home')
  const navigate = useNavigate()
  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
    trigger
  } = useForm<NoUndefinedField<FormDataPrice>>({
    defaultValues: {
      min_price: '',
      max_price: ''
    },
    resolver: yupResolver<NoUndefinedField<FormDataPrice>>(
      InputPriceSchema as ObjectSchema<NoUndefinedField<FormDataPrice>>
    )
  })
  const { data } = useQuery({
    queryKey: ['categories'],
    queryFn: () => productsApi.getCategories()
  })
  const categoryList = data?.data.results

  const onSubmit = handleSubmit((data) => {
    navigate({
      pathname: path.home,
      search: createSearchParams({
        ...queryConfig,
        min_price: data.min_price,
        max_price: data.max_price
      }).toString()
    })
  })

  const handleResetFilter = () => {
    reset()
    navigate({
      pathname: path.home,
      search: createSearchParams(
        omit(
          {
            ...queryConfig,
            page: '1'
          },
          ['agency', 'average_rating', 'max_price', 'min_price', 'name']
        )
      ).toString()
    })
  }

  const handleAllCategories = () => {
    navigate({
      pathname: path.home,
      search: createSearchParams(
        omit(
          {
            ...queryConfig,
            page: '1'
          },
          ['agency']
        )
      ).toString()
    })
  }

  return (
    <div className='flex flex-col rounded-lg bg-white p-6 shadow-md'>
      <div>
        <div className='flex items-center gap-2 border-b border-gray-200 pb-4'>
          <h3 className='mb-1 text-lg font-bold text-gray-800 flex items-center gap-2'>
            <Package className='h-5 w-5 text-gray-800' />
            Thể loại
          </h3>
        </div>
        <button
          onClick={handleAllCategories}
          className={classNames(
            'flex w-full items-center gap-2 rounded-md py-3 px-3 transition-colors hover:bg-orange/5',
            {
              'bg-orange/10 font-medium text-orange': !queryConfig.agency,
              'text-gray-600': queryConfig.agency
            }
          )}
        >
          <Package
            className={classNames('h-5 w-5', {
              'text-orange': !queryConfig.agency,
              'text-gray-600': queryConfig.agency
            })}
          />
          <span>{t('all categories')}</span>
        </button>
        <div className='my-2 space-y-1'>
          {categoryList &&
            categoryList.map((category: any, index: number) => (
              <Link
                title={category.name}
                key={index}
                to={{
                  pathname: path.home,
                  search: createSearchParams({
                    ...queryConfig,
                    agency: category.name
                  }).toString()
                }}
                className={classNames(
                  'flex items-center gap-2 rounded-md py-2 px-4 text-[15px] transition-colors hover:bg-orange/5',
                  {
                    'bg-orange/10 font-medium text-orange': queryConfig.agency === category.name,
                    'text-gray-600': queryConfig.agency !== category.name
                  }
                )}
              >
                <Tag
                  className={classNames('h-4 w-4', {
                    'text-orange': queryConfig.agency === category.name,
                    'text-gray-600': queryConfig.agency !== category.name
                  })}
                />
                <span>{category.name}</span>
              </Link>
            ))}
        </div>
      </div>

      <div className='mt-8'>
        <div className='flex items-center gap-2 border-b border-gray-200 pb-4'>
          <h3 className='mb-1 text-lg font-bold text-gray-800 flex items-center gap-2'>
            <Banknote className='h-5 w-5 text-gray-800' />
            Giá
          </h3>
        </div>
        <div className='py-4'>
          <form noValidate onSubmit={onSubmit} className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Controller
                name='min_price'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      trigger('max_price')
                    }}
                    placeholder={`₫ ${t('min')}`}
                    className='flex-1'
                    size='large'
                  />
                )}
              />
              <div className='h-[1px] w-6 bg-gray-300'></div>
              <Controller
                name='max_price'
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    onChange={(e) => {
                      field.onChange(e)
                      trigger('min_price')
                    }}
                    placeholder={`₫ ${t('max')}`}
                    className='flex-1'
                    size='large'
                  />
                )}
              />
            </div>
            <div className='min-h-[1.5rem] text-center text-sm text-red-500'>{errors.min_price?.message}</div>
            <Button
              type='primary'
              htmlType='submit'
              size='large'
              className='w-full bg-orange hover:!bg-orange/90 hover:!border-orange/90'
            >
              {t('apply')}
            </Button>
          </form>
        </div>

        <Divider className='my-4' />

        <div className='py-4'>
          <div className='flex items-center gap-2 border-b border-gray-200 pb-4'>
            <h3 className='mb-1 text-lg font-bold text-gray-800 flex items-center gap-2'>
              <Star className='h-5 w-5 text-gray-800' />
              Đánh giá
            </h3>
          </div>
          <div className='space-y-3'>
            {Array(5)
              .fill(0)
              .map((_, index) => (
                <Link
                  title={t('rating')}
                  key={index}
                  to={{
                    pathname: path.home,
                    search: createSearchParams({
                      ...queryConfig,
                      average_rating: (5 - index).toString()
                    }).toString()
                  }}
                  className={classNames(
                    'flex items-center gap-3 rounded-md py-2.5 px-3 transition-colors hover:bg-orange/5',
                    {
                      'bg-orange/10': queryConfig.average_rating === (5 - index).toString(),
                      'text-gray-600': queryConfig.average_rating !== (5 - index).toString()
                    }
                  )}
                >
                  <Rate disabled defaultValue={5 - index} className='text-sm text-orange' />
                  {index !== 0 && <span>{t('up')}</span>}
                </Link>
              ))}
          </div>
        </div>

        <Divider className='my-4' />

        <Button
          onClick={handleResetFilter}
          danger
          size='large'
          className='mt-4 w-full font-medium hover:bg-red-50'
          disabled={
            !queryConfig.agency &&
            !queryConfig.average_rating &&
            !queryConfig.max_price &&
            !queryConfig.min_price
          }
        >
          {t('clear all')}
        </Button>
      </div>
    </div>
  )
}
