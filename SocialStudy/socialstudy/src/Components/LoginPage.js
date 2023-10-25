import { Grid } from '@material-ui/core'
import {React, useState, useEffect} from 'react'

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Container from '@mui/material/Container';
import { Button } from '@mui/material';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';

import { useFormik } from 'formik'
import * as Yup from 'yup'

import Navigationbar from './Navigationbar'
import Footer from './Footer'

import api from '../api'

const LoginPage = ({authenticate}) => {

  const [specialCasesMsg, setSpecialCasesMsg]= useState("");
  const [gridTopPadding, setGridTopPadding] = useState("20vh");
  const [cardBottomMargin, setCardBottomMargin] = useState("24vh");
  const [cardPadding, setCardPadding] = useState("25vmin");
  const [loading, setLoading] = useState(false);

  const validationSchema =  Yup.object().shape({
    username: Yup.string().required('Username required'),
    password: Yup.string().required('Password required')
  })

  const initialValues = {
    username: '',
    password: ''
  }

  const onSubmit = async (values) => {
    setLoading(true);
    try{
      const res = await api.post("/auth/login", {
        credential: values.username,
        password: values.password,
      })
      authenticate();
    }
    catch(err){
      
      if(err.response.status === 401){
        setSpecialCasesMsg("Incorrect username or password");
      }
      else if (err.response.status === 500){
        setSpecialCasesMsg("Internal server error");
      }
      else if(err.response.status === 403){
        setSpecialCasesMsg("User already logged in!");
      }
    }
      
    setLoading(false);
  }

  const formik = useFormik({
    initialValues,
    onSubmit,
    validationSchema,
  })

  
  useEffect(()=>{
    if(window.innerWidth>1000){
      setGridTopPadding("");
      setCardBottomMargin("20vh"); 
      setCardPadding("10vmin");
    }
    if(window.innerWidth>750){
      setGridTopPadding("18vh");
      setCardBottomMargin("31vh");
      
    }
    else if(window.innerWidth>500){
      setGridTopPadding("");
      
    }
    else{
      setGridTopPadding("20vh");
      setCardBottomMargin("28vh");
      setCardPadding("25vmin");
    }
  },[]);

  return (
    <Grid style={{backgroundColor:"#4f5666", paddingTop: gridTopPadding}}>
        <Navigationbar loggedIn={false} loginPage={true} registerPage={false} />
        <Grid container className='centering' style={{paddingTop: cardPadding, marginBottom: cardBottomMargin}}>
            
            <Grid item xs="auto">
              <Card className='Card AuthCard'>
                <CardContent > 
                  <h3 className='Card AuthCardTitle'>Login</h3>
                  <Container>
                    <form onSubmit={formik.handleSubmit}>
                      <TextField 
                        name='username'
                        type= 'text'
                        className="Card authInputs"
                        {... formik.getFieldProps('username')} 
                        label="Username"
                      />
                      
                      {formik.touched.username && formik.errors.username ? <h6 style={{color:"red", fontSize:"80%",marginTop:"0", marginBottom:"15px"}}>{formik.errors.username}</h6> : null} 

  
                      <TextField 
                        name='password'
                        type= 'password'
                        className="Card authInputs"
                        {... formik.getFieldProps('password')}
                        label="Password"
                      />
                      {formik.touched.password && formik.errors.password ? <h6 style={{color:"red", fontSize:"80%", margin:"0"}}>{formik.errors.password}</h6> : null} 
                      {specialCasesMsg && <h6 style={{color:"red", fontSize:"80%", margin:"0"}}>{specialCasesMsg}</h6>}
                      <Button type="submit" sx={{backgroundColor:"#42B729", 
                        border:"none", 
                        marginTop:"1.5rem", 
                        borderRadius:"20px", 
                        color:"white",
                        fontSize:"2vmin",
                        width:"18vmin"}}>
                         {!loading ? "Sign in" : <CircularProgress />}
                                                    
                      </Button>
      

                    </form>

                  </Container>
                </CardContent>
              
              </Card>
           
            </Grid>
            
        </Grid>
        <Grid item xs="auto">
            <Footer />
        </Grid>
        
    </Grid>
  )
}

export default LoginPage