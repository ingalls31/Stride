import { Link } from 'react-router-dom'
import path from '~/constants/path'
import Popover from '../Popover'
import { useMutation, useQueryClient } from 'react-query'
import AuthApi from '~/apis/authApi'
import { useContext, useState } from 'react'
import { AppContext } from '../../Contexts/app.context'
import { toast } from 'react-toastify'
import { purchasesStatus } from '~/constants/purchase'
import { getAvatarUrl } from '~/utils/utils'
import { useTranslation } from 'react-i18next'
import { locales } from '~/i18n/i18n'
import i18next from 'i18next'
import { clearLS } from '~/utils/auth'
import { Bell } from 'lucide-react'
import { Badge, Popover as AntPopover, List, Button, Typography } from 'antd'

export default function NavHeader() {
  const { t } = useTranslation('header')
  const currentLang = locales[i18next.language as keyof typeof locales]
  const queryClient = useQueryClient()
  const { isAuthenticated, setIsAuthenticated, profile, setProfile } = useContext(AppContext)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Đơn hàng đã được xác nhận',
      description: 'Đơn hàng #123 của bạn đã được xác nhận',
      read: false,
      time: '2 giờ trước'
    },
    {
      id: 2,
      title: 'Giảm giá đặc biệt',
      description: 'Giảm 50% cho đơn hàng đầu tiên',
      read: false,
      time: '1 ngày trước'
    },
    {
      id: 3,
      title: 'Đơn hàng đã được xác nhận',
      description: 'Đơn hàng #123 của bạn đã được xác nhận',
      read: false,
      time: '2 giờ trước'
    },
    {
      id: 4,
      title: 'Giảm giá đặc biệt',
      description: 'Giảm 50% cho đơn hàng đầu tiên',
      read: false,
      time: '1 ngày trước'
    }
  ])

  const handleLogout = () => {
    clearLS()
    window.location.href = path.home
  }

  const handleLanguage = (lang: 'vi' | 'en') => {
    // eslint-disable-next-line import/no-named-as-default-member
    i18next.changeLanguage(lang)
  }

  const handleMarkAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const notificationContent = (
    <div className='w-[380px] max-h-[500px] rounded-lg shadow-lg'>
      <div className='flex items-center justify-between p-4 border-b bg-gray-50/80 rounded-t-lg'>
        <div className='flex items-center gap-2'>
          <Bell size={16} className='text-gray-600' />
          <Typography.Title level={5} className='m-0 text-gray-700'>
            Thông báo
          </Typography.Title>
        </div>
        <Button
          type='link'
          onClick={handleMarkAllAsRead}
          className='text-orange hover:text-orange-600 text-sm font-medium'
        >
          Đánh dấu tất cả đã đọc
        </Button>
      </div>

      <List
        className='max-h-[400px] overflow-y-auto divide-y divide-gray-100'
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item
            className={`cursor-pointer transition-all duration-200
              ${!item.read ? 'bg-orange-50 hover:bg-orange-100/80' : 'hover:bg-gray-50'}`}
          >
            <div className='p-4 w-full'>
              <div className='flex justify-between items-start mb-1'>
                <div className='flex items-center gap-2'>
                  {!item.read && <span className='w-2 h-2 rounded-full bg-orange animate-pulse'></span>}
                  <Typography.Text strong className='text-gray-900'>
                    {item.title}
                  </Typography.Text>
                </div>
                <Typography.Text type='secondary' className='text-xs whitespace-nowrap ml-2'>
                  {item.time}
                </Typography.Text>
              </div>
              <Typography.Text className='text-gray-600 text-sm'>{item.description}</Typography.Text>
            </div>
          </List.Item>
        )}
      />

      <div className='p-3 border-t bg-gray-50/80 rounded-b-lg'>
        <Button type='link' className='w-full text-center text-gray-600 hover:text-orange'>
          Xem tất cả thông báo
        </Button>
      </div>
    </div>
  )

  return (
    <div className='flex h-10 items-center bg-orange'>
      <nav className='container w-full'>
        <ul className='flex items-center justify-end gap-6 text-sm text-white'>
          <li className='items-center'>
            <AntPopover
              content={notificationContent}
              trigger='click'
              placement='bottomRight'
              overlayClassName='notification-popover'
            >
              <div className='cursor-pointer p-2 hover:text-white/90 transition-all duration-200'>
                <Badge
                  count={notifications.filter((n) => !n.read).length}
                  offset={[-2, 2]}
                  className='animate-pulse'
                  size="small"
                >
                  <Bell size={18} className='text-white hover:scale-105 transition-transform' />
                </Badge>
              </div>
            </AntPopover>
          </li>

          <li>
            <Popover
              renderPopover={
                <div className='flex min-w-[200px] flex-col rounded-lg border border-gray-100 bg-white text-left text-sm shadow-lg'>
                  <button
                    onClick={() => handleLanguage('en')}
                    className='py-2.5 px-4 text-left text-gray-600 hover:bg-gray-50 hover:text-orange transition-colors'
                  >
                    {t('english')}
                  </button>
                  <button
                    onClick={() => handleLanguage('vi')}
                    className='py-2.5 px-4 text-left text-gray-600 hover:bg-gray-50 hover:text-orange transition-colors'
                  >
                    {t('vietnamese')}
                  </button>
                </div>
              }
              as={'li'}
              className='flex items-center gap-1.5 py-4 hover:cursor-pointer hover:text-white/90 transition-colors'
            >
              <svg width={16} height={16} viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path
                  d='M8.00065 14.6667C11.6825 14.6667 14.6673 11.6819 14.6673 8.00004C14.6673 4.31814 11.6825 1.33337 8.00065 1.33337C4.31875 1.33337 1.33398 4.31814 1.33398 8.00004C1.33398 11.6819 4.31875 14.6667 8.00065 14.6667Z'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M5.33464 8.00004C5.33464 11.6819 6.52854 14.6667 8.0013 14.6667C9.47406 14.6667 10.668 11.6819 10.668 8.00004C10.668 4.31814 9.47406 1.33337 8.0013 1.33337C6.52854 1.33337 5.33464 4.31814 5.33464 8.00004Z'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M1.33398 8H14.6673'
                  stroke='currentColor'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
              <span className='text-sm text-white'>{currentLang}</span>
              <svg viewBox='0 0 12 12' fill='none' width={12} height={12} color='currentColor'>
                <path
                  fillRule='evenodd'
                  clipRule='evenodd'
                  d='M6 8.146L11.146 3l.707.707-5.146 5.147a1 1 0 01-1.414 0L.146 3.707.854 3 6 8.146z'
                  fill='currentColor'
                />
              </svg>
            </Popover>
          </li>

          {!isAuthenticated && (
            <li className='flex items-center text-sm'>
              <Link
                title={t('sign up')}
                className='border-r border-r-white/40 px-3 hover:text-white/90 transition-colors'
                to={path.register}
              >
                {t('sign up')}
              </Link>
              <Link 
                title={t('sign in')} 
                className='px-3 hover:text-white/90 transition-colors' 
                to={path.login}
              >
                {t('sign in')}
              </Link>
            </li>
          )}

          {isAuthenticated && (
            <Popover
              as={'li'}
              className='flex cursor-pointer items-center gap-2 py-4 hover:text-white/90 transition-colors'
              renderPopover={
                <div className='flex min-w-[200px] flex-col rounded-lg border border-gray-100 bg-white text-left text-sm shadow-lg'>
                  <Link
                    title={t('my profile')}
                    to={path.profile}
                    className='py-2.5 px-4 text-gray-600 hover:bg-gray-50 hover:text-orange transition-colors'
                  >
                    {t('my profile')}
                  </Link>
                  <Link
                    title={t('my cart')}
                    to={path.cart}
                    className='py-2.5 px-4 text-gray-600 hover:bg-gray-50 hover:text-orange transition-colors'
                  >
                    {t('my cart')}
                  </Link>
                  <button
                    title={t('logout')}
                    onClick={handleLogout}
                    className='py-2.5 px-4 text-left text-gray-600 hover:bg-gray-50 hover:text-orange transition-colors'
                  >
                    {t('logout')}
                  </button>
                </div>
              }
            >
              <img
                className='h-6 w-6 rounded-full object-cover ring-2 ring-white/50'
                src={profile?.avatar_url}
                alt='avatar'
              />
              <span className='text-sm'>{`${profile?.first_name} ${profile?.last_name}`}</span>
            </Popover>
          )}
        </ul>
      </nav>
    </div>
  )
}
