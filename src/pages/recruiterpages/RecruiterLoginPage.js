import React from 'react'
import Nav from '../../components/common/Nav';
import Footer from '../../components/common/Footer';
import RecruiterLogin from '../../components/recruitercomponents/RecruiterLogin';
function RecruiterLoginPage({onLogin}) {
  return (
    <div>
     {/* <Nav /> */}
    <RecruiterLogin handleLogin={onLogin}/>
    {/* <Footer /> */}
    </div>
  )
}
export default RecruiterLoginPage;