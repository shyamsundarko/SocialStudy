import React, {useEffect, useState} from 'react'

import { Button } from '@mui/material';

const Forum =({forum,selectedForum, getSelectedForum, setOpenDetails}) => {
//const [clicked, setClicked] = useState(true);
const [color, setColor] = useState("#003054")
const handleClick = () =>{

        getSelectedForum(forum._id);
        if(setOpenDetails)
          setOpenDetails(true);
        // setClicked(!clicked);
        // if(clicked === true){
        //         resetForum(clicked);
                
        //         setColor("black");
        // }
        // else{   resetForum(clicked);
        //         setColor("#003054");
        // }      
}
useEffect(() =>{
 if(forum._id === selectedForum){
        setColor("#1dd90f");
 }else{
        setColor("#003054");
 }      
        
},[selectedForum]);


  return (

          <Button onClick={handleClick} 
          style={{color:"white",
          fontWeight:"600", padding:"0.5rem", fontSize:"0.8rem", margin:"1rem", 
            backgroundColor:color, borderRadius:"20px", minWidth:"7rem"}}
                      >{forum.name}
          </Button>

  )
}

export default Forum