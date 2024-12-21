import classNames from 'classnames'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { AppContext } from '~/Contexts/app.context'
import path from '~/constants/path'
import { getAvatarUrl } from '~/utils/utils'
import { UserCircle, Lock, ShoppingBag, Edit2 } from 'lucide-react'
import { Avatar, Tooltip } from 'antd'

export default function UserSideNav() {
  const { t } = useTranslation('profile')
  const { profile } = useContext(AppContext)

  return (
    <div className='flex w-full flex-shrink-0 items-center justify-between gap-3 md:block md:w-[180px]'>
      <div className='flex flex-shrink-0 items-center gap-1 border-gray-200 py-[15px] sm:gap-[15px] md:border-b'>
        <Tooltip title='Your Profile'>
          <Link to={path.profile} className='flex-shrink-0'>
            <Avatar
              size={48}
              src={profile?.avatar_url}
              className='border border-gray-200 shadow-sm transition-all hover:border-blue-400'
            />
          </Link>
        </Tooltip>
        <div className='text-sm'>
          <div className='font-semibold text-gray-800'>{profile?.email}</div>
          <Link 
            to={path.profile} 
            className='flex items-center gap-1.5 text-gray-500 transition-colors hover:text-blue-500'
          >
            <Edit2 size={14} />
            {t('edit profile')}
          </Link>
        </div>
      </div>

      <div className='mt-[27px] flex flex-row flex-wrap gap-3 md:flex-col'>
        <NavLink
          to={path.profile}
          className={({ isActive }) =>
            classNames(
              'mb-4 flex items-center gap-[10px] rounded-md p-2 text-sm transition-all hover:bg-gray-50 hover:text-blue-500',
              {
                'bg-blue-50 text-blue-500 font-medium': isActive,
                'text-gray-600': !isActive
              }
            )
          }
        >
          <UserCircle size={20} />
          {t('my account')}
        </NavLink>

        <NavLink
          to={path.changePassword}
          className={({ isActive }) =>
            classNames(
              'mb-4 flex items-center gap-[10px] rounded-md p-2 text-sm transition-all hover:bg-gray-50 hover:text-blue-500',
              {
                'bg-blue-50 text-blue-500 font-medium': isActive,
                'text-gray-600': !isActive
              }
            )
          }
        >
          <Lock size={20} />
          {t('change password')}
        </NavLink>

        <NavLink
          to={path.historyPurchase}
          className={({ isActive }) =>
            classNames(
              'mb-4 flex items-center gap-[10px] rounded-md p-2 text-sm transition-all hover:bg-gray-50 hover:text-blue-500',
              {
                'bg-blue-50 text-blue-500 font-medium': isActive,
                'text-gray-600': !isActive
              }
            )
          }
        >
          <ShoppingBag size={20} />
          {t('my purchase')}
        </NavLink>
      </div>
    </div>
  )
}
