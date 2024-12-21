import React from 'react'
import { Outlet } from 'react-router-dom'
import OrderHeader from '~/components/OrderHeader'
import Footer from '~/components/Footer'
import Header from '~/components/Header'

export default function OrderLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}
