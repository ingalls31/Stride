import React from 'react'
import { Outlet } from 'react-router-dom'
import CartHeader from '~/components/CartHeader'
import Footer from '~/components/Footer'
import Header from '~/components/Header'

export default function CartLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  )
}
