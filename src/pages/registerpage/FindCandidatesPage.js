import React from 'react'
import Nav from '../../components/common/Nav'
import Footer from '../../components/common/Footer'
import RegisterBody from '../../components/registercomponents/RegisterBody'
import FindCandidates from '../../components/common/FindCandidates'; 

export default function FindCandidatesPage({onLogin}) {
  localStorage.clear();
  return (
    <div>
     <FindCandidates />
     <RegisterBody handleLogin={onLogin}/>
     <Footer />
    </div>
  )
}
