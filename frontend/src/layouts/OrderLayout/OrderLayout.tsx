import React from 'react'
import { Outlet } from 'react-router-dom'
import OrderHeader from '~/components/OrderHeader'
import Footer from '~/components/Footer'

export default function OrderLayout() {
  return (
    <>
      <OrderHeader />
      <Outlet />
      <Footer />
    </>
  )
}
