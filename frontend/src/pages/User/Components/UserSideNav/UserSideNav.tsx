import classNames from 'classnames'
import { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Link, NavLink } from 'react-router-dom'
import { AppContext } from '~/Contexts/app.context'
import path from '~/constants/path'
import { getAvatarUrl } from '~/utils/utils'

export default function UserSideNav() {
  const { t } = useTranslation('profile')
  const { profile } = useContext(AppContext)

  return (
    <div className='flex w-full flex-shrink-0 items-center justify-between gap-3 md:block md:w-[180px]'>
      <div className='flex flex-shrink-0 items-center gap-1 border-gray-200 py-[15px] sm:gap-[15px] md:border-b'>
        <Link
          title='your profile'
          to={path.profile}
          className='h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-gray-400'
        >
          <img className='h-full w-full object-cover' src={profile?.avatar_url} alt='avatar' />
        </Link>
        <div className='text-sm'>
          <div className='font-bold'>{profile?.email}</div>
          <Link title='Edit Profile' to={path.profile} className='flex items-center text-gray-400'>
            <svg
              width={12}
              height={12}
              viewBox='0 0 12 12'
              xmlns='http://www.w3.org/2000/svg'
              style={{ marginRight: 4 }}
            >
              <path
                d='M8.54 0L6.987 1.56l3.46 3.48L12 3.48M0 8.52l.073 3.428L3.46 12l6.21-6.18-3.46-3.48'
                fill='#9B9B9B'
                fillRule='evenodd'
              />
            </svg>
            {t('edit profile')}
          </Link>
        </div>
      </div>
      <div className='mt-[27px] flex flex-row flex-wrap gap-3 md:flex-col'>
        <NavLink
          title='My Account'
          to={path.profile}
          className={({ isActive }) =>
            classNames('mb-4 flex items-center gap-[10px] text-sm hover:text-orange', {
              'text-orange': isActive,
              'text-black': !isActive
            })
          }
        >
          <img
            className='h-5 w-5'
            src='https://down-vn.img.susercontent.com/file/ba61750a46794d8847c3f463c5e71cc4'
            alt='icon'
          />
          {t('my account')}
        </NavLink>
        <NavLink
          title='Change Password'
          to={path.changePassword}
          className={({ isActive }) =>
            classNames('mb-4 flex items-center gap-[10px] text-sm hover:text-orange', {
              'text-orange': isActive,
              'text-black': !isActive
            })
          }
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            fill='none'
            viewBox='0 0 24 24'
            strokeWidth={2}
            stroke='#255fba'
            className='h-5 w-5'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              d='M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z'
            />
          </svg>
          {t('change password')}
        </NavLink>
        <NavLink
          title='My Purchase'
          to={path.historyPurchase}
          className={({ isActive }) =>
            classNames('mb-4 flex items-center gap-[10px] text-sm hover:text-orange', {
              'text-orange': isActive,
              'text-black': !isActive
            })
          }
        >
          <img
            className='h-5 w-5'
            src='https://down-vn.img.susercontent.com/file/f0049e9df4e536bc3e7f140d071e9078'
            alt='icon'
          />
          {t('my purchase')}
        </NavLink>
      </div>
    </div>
  )
}
