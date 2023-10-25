import React, {useEffect, useState} from 'react'
import {Grid} from '@material-ui/core'
import Navigationbar from './Navigationbar'
import Footer from './Footer'
import api from '../api'
const Profile = ({unAuthenticate}) => {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const logout = async() =>{
        unAuthenticate();
        const res =  await api.post("/auth/logout");
        
      }
    const getProfile = async() => {
        const res = await api.get("/auth/user");
        if(res.status===200){
            setUsername(res.data.username);
            setEmail(res.data.email);
        }
        
    }
    useEffect(()=>{
        getProfile();
    },[])
  return (
    <Grid container style={{minHeight:"100vh"}}>
        <Navigationbar loggedIn={true} logout={logout}/>
        <Grid container item xs={12} style={{paddingTop:"5rem", backgroundColor:"white", fontSize:"3vmin", minHeight:"90vh"}} className="centering" >
            <Grid item xs={12}><h1 style={{color:"#274059"}}>Profile</h1></Grid>
            <Grid container item xs={12} style={{marginBottom:"4rem", backgroundColor:"#d4e6fc", paddingTop:"1rem", paddingBottom:"0.5rem"}}>
                <Grid item xs={2} />
                <Grid item xs={4}>
                    <img src="https://www.w3schools.com/howto/img_avatar.png" alt="Avatar" style={{width:"40%"}}/>
                </Grid>
                <Grid item xs={6} style={{marginTop:"4rem"}}>
                    <Grid item xs={2} />
                    <Grid item xs={4} style={{color:"#1762ad"}}>{username}</Grid>
                    <Grid item xs={6} />

                    <Grid item xs={2} />
                    <Grid item xs={4} style={{fontSize:"1rem", color:"#1679db"}}>{email}</Grid>
                    <Grid item xs={6} />

                    <Grid item xs={2} />
                    <Grid item xs={4} style={{fontSize:"1rem", color:"darkgrey"}}>Student</Grid>
                    <Grid item xs={6} />
                </Grid>
            </Grid>
            
            
        </Grid>
        <Footer />
    </Grid>

  )
}

export default Profile