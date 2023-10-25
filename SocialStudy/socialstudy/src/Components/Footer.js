
import { Grid } from '@material-ui/core'
import linkedin from '../images/linkedin.png'

import outlook from '../images/outlook.png'


const Footer = () => {
    return (
        <Grid container  id="footerContainer">
            <Grid item xs={4}></Grid>
            <Grid container item xs={4} >
                <Grid item xs={2} lg={4}></Grid>
                <Grid item xs={4} lg={2}><a href="https://www.linkedin.com/in/shyam-s-208166137/" target="_blank"><img src={linkedin} alt="Linkedin logo" className="socialLogo"/></a></Grid>
                <Grid item xs={4} lg={2}><a href="mailto:SHYAMSUN001@e.ntu.edu.sg" target="_blank"><img src={outlook} alt="Outlook logo" className="socialLogo"/></a></Grid>
                <Grid item xs={2} lg={4}></Grid>
            </Grid>
            <Grid item xs={4}></Grid>

            <Grid item xs={12}><a href="mailto:example@gmail.com" target="_blank" style={{color: "#E1A87A", fontWeight: "300", textDecoration: "underline", fontSize: "2vmin"}}>example@gmail.com</a></Grid>
            <Grid item xs={12} style={{fontWeight: "500", fontSize: "3vmin", fontFamily:"Times New Roman", color:"whitesmoke"}}>Say hello.</Grid>
            <Grid item xs={12} style={{marginTop:"3vmin", fontSize:"1.5vmin", color:"whitesmoke"}}>Copyright © 2022 Buffer Overflow. All rights reserved.</Grid>
        </Grid>
    )
}

export default Footer
