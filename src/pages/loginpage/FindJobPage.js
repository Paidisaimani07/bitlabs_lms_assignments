import React from 'react'
import Nav from '../../components/common/Nav';
import Footer from '../../components/common/Footer';
import LoginBody from '../../components/logincomponents/LoginBody';
import FindJobs from '../../components/common/FindJobs'; // Import FindJobs component


function FindJobPage({onLogin}) {
  localStorage.clear();
  return (
    <div>
     <FindJobs />
    <LoginBody handleLogin={onLogin}/>
    <Footer />
    </div>
  )
}
export default FindJobPage;