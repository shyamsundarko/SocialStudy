import React, {useEffect,useState} from 'react'

import { Button} from '@mui/material';


const School = ({schoolName, displayModules, selectedSchool, setSelectedSchool}) => {
  const [clicked, setClicked] = useState(true);
  const [color, setColor] = useState("#003054")
  const handleClick = () =>{
        setSelectedSchool(schoolName);
        displayModules(schoolName);
        setClicked(!clicked); 
  }  

  useEffect(() =>{
    if(schoolName == selectedSchool){
           setColor("#1dd90f");
    }else{
           setColor("#003054");
    }         
   },[selectedSchool]);  
          
  return (
       
    
        <Button onClick={handleClick} 
          style={{color:"white",
            fontWeight:"600", padding:"0.5rem", fontSize:"0.8rem", margin:"1rem", 
              backgroundColor:color, borderRadius:"20px", minWidth:"7rem"}}>
                {schoolName}</Button>

  )
}

export default School