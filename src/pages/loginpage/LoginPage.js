import React from 'react'
import Nav from '../../components/common/Nav';
import Footer from '../../components/common/Footer';
import LoginBody from '../../components/logincomponents/LoginBody';


function LoginPage({onLogin}) {
  localStorage.clear();
  return (
    <div>
     <Nav />
    <LoginBody handleLogin={onLogin}/>
    <Footer />
    </div>
  )
}
export default LoginPage;