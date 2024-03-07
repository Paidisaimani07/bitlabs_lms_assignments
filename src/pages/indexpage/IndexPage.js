// import React from 'react'
// import Nav from '../../components/common/Nav'
// import Banner from '../../components/indexpagecomponents/Banner'
// import Body from '../../components/indexpagecomponents/Body'
// import Footer from '../../components/common/Footer'



// export default function IndexPage() {
//   return (
//     <div> 
//      <Nav />
//      <Banner />
//      <Body />
//      <Footer />
//     </div>
//   )
// }

import React from 'react';
import { useLocation } from 'react-router-dom';
import Nav from '../../components/common/Nav';
import Banner from '../../components/indexpagecomponents/Banner';
import Body from '../../components/indexpagecomponents/Body';
import Footer from '../../components/common/Footer';
import FindJobs from '../../components/common/FindJobs'; // Import FindJobs component
import FindCandidates from '../../components/common/FindCandidates'; // Import FindCandidates component

export default function IndexPage() {
  const location = useLocation();
  const isFindJobsPage = location.pathname === '/find-jobs';
  const isFindCandidatesPage = location.pathname === '/find-candidates';

  return (
    <div>
      {isFindJobsPage && <FindJobs />}
      {isFindCandidatesPage && <FindCandidates />}
      {!isFindJobsPage && !isFindCandidatesPage && (
        <>
          <Nav />
        </>
      )}
       <Banner />
          <Body />
          <Footer />
    </div>
  );
}
