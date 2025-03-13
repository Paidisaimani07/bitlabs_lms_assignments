import { apiUrl } from '../../services/ApplicantAPIService';
import axios from 'axios';

function ZohoCRMService (){
 const Createlead = async(leadData)=> {  

  try {
    const response = await axios.post(`${apiUrl}/zoho/create-lead`, leadData,{
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200 || response.status === 201) {
      console.log("Lead submitted successfully", response.data);
      return response.data?.[0].details.id;
    } else {
      console.error("Failed to submit lead", response.data);
    }
  } catch (error) {
    console.error("Error submitting lead:", error.response ? error.response.data : error.message);
  }
}

const Searchlead = async(email) => {
  try {
    const response = await axios.get(`${apiUrl}/zoho/searchlead/${email}`)

    
    if (response.status === 200 || response.status === 201) {
      console.log("Lead found ", response);
      return response.data?.data?.[0]?.id ;
      
    } else {
      console.error("Failed to find lead", response.data);
      
    }
  } catch (error) {
    console.error("Error finding lead:", error.response ? error.response.data : error.message);
  }
}

const handleLead= async (leadData)=>{

  try{
  const zohoUserId = await Searchlead(leadData.data?.[0].Email);
 
  if (zohoUserId) {
    console.log("Lead already exists!");
    return zohoUserId;
  } 
  else{
    console.log("Creating new lead...");
    return await Createlead(leadData);
  }
  
}catch(error){
  console.error("Error handling lead:", error.response ? error.response.data : error.message);
  
}

}
return{
  Createlead,
  Searchlead,
  handleLead
}
}
export default ZohoCRMService;
