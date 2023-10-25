import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import { useState, useEffect } from 'react';
import Typography from '@mui/material/Typography';

import Container from '@mui/material/Container';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';


import userIcon from '../images/userIcon.png';
import { Link } from 'react-router-dom';

const Navigationbar = (props) => {
 
  const [fSize, setFSize] = useState("2rem");
 
  useEffect(()=>{
    if(window.innerWidth < 525) {
      setFSize("1.5rem");
    }
    else{
      setFSize("2rem");
    }
  },[])
  
  return (
    <AppBar position="fixed" sx={{backgroundColor:"white"}} >
      <Container maxWidth="xl">
        <Toolbar>
          <Typography
            variant="h5"
            sx={{ mr: 2, flexGrow: 1}}
            >
              <Link to='/' style={{fontWeight:"600",textDecoration:"none", color:"#44a8f5", fontSize: fSize}}>SocialStudy</Link>
            
          </Typography>
          {props.loggedIn ? 
            
            <Box style={{display:"flex"}}>
              <Link to="/profile"><Avatar src={userIcon} sx={{padding:"1px", mr: 2}}/></Link>
              
              <Button variant='contained'sx={{borderRadius:"20px", width:"17vmin", padding:"0", height:"2.5rem"}}
                onClick={props.logout}
              >
                    <h4 style={{fontSize: "1.5vmin", fontWeight:"600", textDecoration:"none", color:"white"}}>Logout</h4>
                </Button> 
            </Box>

          : 
            <Typography>
              {props.registerPage ? 
                <Button 
                  variant='contained'
                  sx={{borderRadius:"20px", width:"16vmin", mr: 1}}
                  >
                    <Link to="/login" style={{fontSize: "2vmin", fontWeight:"600", textDecoration:"none", color:"white" }}>Login</Link>
                </Button>  
                :
                null
              }
              {props.loginPage ?
                <Button 
                  variant='outlined'
                  sx={{borderRadius:"20px",  width:"16vmin" }}
                  >
                    <Link to="/register" style={{fontSize: "2vmin", fontWeight:"600", textDecoration:"none", color:"#267bd3" }}>Register</Link>
                </Button>
                :
                null
              }
            
            </Typography>
          }
          
        </Toolbar>
      </Container>
    </AppBar>
  );
};
export default Navigationbar;


