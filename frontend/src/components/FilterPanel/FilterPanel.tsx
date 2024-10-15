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
  console.log('data', data);
  const categoryList = data?.data.results
  console.log('categoryList', categoryList);

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
            ...queryConfig
          },
          ['average_rating', 'max_price', 'min_price']
        )
      ).toString()
    })
  }

  return (
    <div className='flex flex-col'>
      <div>
        <Link
          title={t('all categories')}
          to={{
            pathname: path.home,
            search: createSearchParams(
              omit(
                {
                  ...queryConfig
                },
                ['category']
              )
            ).toString()
          }}
          className={classNames('flex items-center gap-2 border-b border-b-gray-200 py-4', {
            'fill-black font-bold': !queryConfig.agency,
            'fill-black/40 font-normal': queryConfig.agency
          })}
        >
          <svg viewBox='0 0 12 10' className='h-[16px] w-[12px]'>
            <g fillRule='evenodd' stroke='none' strokeWidth={1}>
              <g transform='translate(-373 -208)'>
                <g transform='translate(155 191)'>
                  <g transform='translate(218 17)'>
                    <path d='m0 2h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                    <path d='m0 6h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                    <path d='m0 10h2v-2h-2zm4 0h7.1519633v-2h-7.1519633z' />
                  </g>
                </g>
              </g>
            </g>
          </svg>
          <span>{t('all categories')}</span>
        </Link>
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
              className={classNames('flex items-center gap-2 py-2 pl-3 pr-[10px] text-[14px]', {
                'font-bold text-orange': queryConfig.agency === category._id
              })}
            >
              {queryConfig.agency === category._id && (
                <svg viewBox='0 0 4 7' className='h-[7px] w-[4px] fill-orange'>
                  <polygon points='4 3.5 0 0 0 7' />
                </svg>
              )}
              {category.name}
            </Link>
          ))}
      </div>
      <div>
        <div className='mt-[30px] border-b border-b-gray-300/60'>
          <div className='flex items-center gap-2 pb-[20px] font-bold'>
            <svg
              enableBackground='new 0 0 15 15'
              viewBox='0 0 15 15'
              x={0}
              y={0}
              className='h-3 w-3 stroke-black'
            >
              <g>
                <polyline
                  fill='none'
                  points='5.5 13.2 5.5 5.8 1.5 1.2 13.5 1.2 9.5 5.8 9.5 10.2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeMiterlimit={10}
                />
              </g>
            </svg>
            <span>{t('filter search')}</span>
          </div>
        </div>
        <div className='border-b border-b-gray-300/60 py-[20px]'>
          <div className='mb-4 text-[14px]'>{t('price range')}</div>
          <form noValidate onSubmit={onSubmit}>
            <div className='flex items-center justify-between'>
              <div className='grow'>
                <Controller
                  name='min_price'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        trigger('max_price')
                      }}
                      classNameError='hidden'
                      type='text'
                      placeholder={`₫ ${t('min')}`}
                      classNameInput='w-full border border-gray-400 py-1 pl-[5px] text-[14px] shadow-inner outline-none'
                    />
                  )}
                />
              </div>
              <div className='mx-2 h-[1px] w-2 bg-[#bdbdbd]'></div>
              <div className='grow'>
                <Controller
                  name='max_price'
                  control={control}
                  render={({ field }) => (
                    <InputNumber
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        trigger('min_price')
                      }}
                      type='text'
                      classNameError='hidden'
                      placeholder={`₫ ${t('max')}`}
                      classNameInput='w-full border border-gray-400 py-1 pl-[5px] text-[14px] shadow-inner outline-none'
                    />
                  )}
                />
              </div>
            </div>
            <div className='min-h-[1.5rem] pl-1 pt-1 text-center text-sm text-[#ff424f]'>
              {errors.min_price?.message}
            </div>
            <button
              type='submit'
              className='mt-2 w-full rounded-sm bg-orange px-8 py-1.5 text-sm uppercase text-white shadow-sm '
            >
              {t('apply')}
            </button>
          </form>
        </div>
      </div>
      <div>
        <div className='border-b border-b-gray-300/80 py-[20px]'>
          <div className='mb-2 text-[14px]'>{t('rating')}</div>
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
                className='flex items-center gap-2 pl-2 pr-[10px] pt-2 text-[14px] text-black'
              >
                <div className='flex items-center gap-[1px]'>
                  {Array(5)
                    .fill(0)
                    .map((_, indexStar) => {
                      if (index < 5 - indexStar) {
                        return (
                          <div key={indexStar}>
                            <svg
                              enableBackground='new 0 0 15 15'
                              viewBox='0 0 15 15'
                              x={0}
                              y={0}
                              width={14}
                              height={14}
                              fill='#ffce3d'
                              stroke='#ffce3d'
                            >
                              <polygon
                                points='7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4'
                                strokeLinecap='round'
                                strokeLinejoin='round'
                                strokeMiterlimit={10}
                              />
                            </svg>
                          </div>
                        )
                      }
                      return (
                        <div key={indexStar}>
                          <svg
                            enableBackground='new 0 0 15 15'
                            viewBox='0 0 15 15'
                            x={0}
                            y={0}
                            width={14}
                            height={14}
                            fill='none'
                            stroke='#ffce3d'
                          >
                            <polygon
                              points='7.5 .8 9.7 5.4 14.5 5.9 10.7 9.1 11.8 14.2 7.5 11.6 3.2 14.2 4.3 9.1 .5 5.9 5.3 5.4'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                              strokeMiterlimit={10}
                            />
                          </svg>
                        </div>
                      )
                    })}
                </div>
                {index !== 0 ? `& ${t('up')}` : ''}
              </Link>
            ))}
        </div>
        <button
          onClick={handleResetFilter}
          className='mt-4 w-full rounded-sm bg-orange px-8 py-1.5 text-sm uppercase text-white shadow-sm '
        >
          {t('clear all')}
        </button>
      </div>
    </div>
  )
}
