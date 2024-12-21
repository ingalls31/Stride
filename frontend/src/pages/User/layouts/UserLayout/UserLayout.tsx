import { Outlet } from 'react-router-dom'
import UserSideNav from '../../Components/UserSideNav'

export default function UserLayout() {
  return (
    <div className='min-h-screen bg-[#4A9B9B]/5'>
      <div className='container py-8 md:py-10'>
        <div className='grid grid-cols-1 gap-8 md:grid-cols-12'>
          {/* Sidebar */}
          <div className='md:col-span-3 lg:col-span-2'>
            <div className='sticky top-20'>
              <UserSideNav />
            </div>
          </div>

          {/* Main Content */}
          <div className='md:col-span-9 lg:col-span-10'>
            <div className='rounded-lg bg-white shadow-sm'>
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
