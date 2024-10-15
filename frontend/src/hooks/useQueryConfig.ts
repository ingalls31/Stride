import { QueryConfig } from '~/pages/ProductList/ProductList'
import useQueryParams from './useQueryParams'
import omitBy from 'lodash/omitBy'
import isUndefined from 'lodash/isUndefined'
import { queryParamsDefault } from '~/constants/product'

export default function useQueryConfig() {
  const queryParams: QueryConfig = useQueryParams()
  const queryConfig: QueryConfig = omitBy(
    {
      page: queryParams.page || queryParamsDefault.page,
      page_size: queryParams.limit || queryParamsDefault.limit,
      agency: queryParams.agency,
      exclude: queryParams.exclude,
      name: queryParams.name,
      ordering: queryParams.sort_by,
      order: queryParams.order,
      max_price: queryParams.max_price,
      min_price: queryParams.min_price,
      average_rating: queryParams.average_rating
    },
    isUndefined
  )
  return queryConfig
}
