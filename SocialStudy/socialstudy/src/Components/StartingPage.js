import React from 'react'
import {Grid} from '@material-ui/core'
import Footer from './Footer'
import Navigationbar from './Navigationbar'
const StartingPage = () => {
  return (
    <Grid>
        <Navigationbar loggedIn={false} loginPage={true} registerPage={true} />
        <Grid container className='centering' style={{paddingTop:"30vmin", paddingBottom:"15vmin"}}>
            <Grid item xs={12} >
                <h1 style={{color:"whitesmoke", fontWeight:"600", fontSize:"7vmin"}}>Preparation made easy.</h1>
            </Grid>

            <Grid item xs={2}></Grid>
            <Grid item xs={8} >
                <p style={{fontSize:"2.5vmin", color:"gray"}}>SocialStudy is a virtual space where students & intellectuals can engage in meaningful conversations & discussions to better themselves as well as help others.</p>
            </Grid>
            <Grid item xs={2} ></Grid>
        </Grid>

        <Grid container className='centering' style={{marginBottom:"2rem"}}>
            
            <Grid item xs={12} sm={3} className="miscInfo">
                <h2 style={{color:"#232c4a", fontSize:"5vmin"}}>Discuss</h2>
            </Grid>
            <Grid item xs={12} sm={1} className="addBottomSpace"></Grid>
            <Grid item xs={12} sm={3} className="miscInfo" style={{backgroundColor:"#5A677B"}}>
                <h2 style={{color:"#ccd1e0", fontSize:"5vmin"}}>Educate</h2>
            </Grid>
            <Grid item xs={12} sm={1} className="addBottomSpace"></Grid>
            <Grid item xs={12} sm={3} className="miscInfo">
                <h2 style={{color:"#232c4a", fontSize:"5vmin"}}>Elevate</h2>
            </Grid>
        </Grid>
        <Footer />
    </Grid>
    
  )
}

export default StartingPage