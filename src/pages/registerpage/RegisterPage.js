import React from 'react'
import Nav from '../../components/common/Nav'
import Footer from '../../components/common/Footer'
import RegisterBody from '../../components/registercomponents/RegisterBody'

export default function RegisterPage({onLogin}) {
  localStorage.clear();
  return (
    <div>
     {/* <Nav /> */}
     <RegisterBody handleLogin={onLogin}/>
     {/* <Footer /> */}
    </div>
  )
}
