import React, { useState, useEffect } from 'react'
import { Grid } from '@material-ui/core'

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
import api from '../api';




const RegisterPage = () => {


  const [specialCasesMsg, setSpecialCasesMsg]= useState("");
  const [gridTopPadding, setGridTopPadding] = useState("15vh");
  const [cardBottomMargin, setCardBottomMargin] = useState("24vh");
  const [cardPadding, setCardPadding] = useState("25vmin");
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object().shape({
    email: Yup.string().email('Invalid email').required('Email required'),
    username: Yup.string().required('Username required'),
    password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password required'),
    checkPassword: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Confirm password required')
  })

  const initialValues = {
    email: '',
    username: '',
    password: '',
    checkPassword: ''
  }
  const onSubmit = async (values) => {
      setLoading(true);
      try{
        const res= await api.post('/auth/register', {
          email: values.email,
          username: values.username,
          password: values.password,
          confirmPassword: values.checkPassword
        });
        window.location.href="/login";
      }
      catch(err){
        if(err.response.status===403){
          setSpecialCasesMsg("User already logged in!");
        }
        else if(err.response.status===400){
          setSpecialCasesMsg(err.response.data.message+". Please try a different one.");
        }
      }
      setLoading(false);
  }

  const formik =  useFormik({
    initialValues,
    onSubmit,
    validationSchema,
    
  })
  

  useEffect(()=>{
    if(window.innerWidth>1000){
      setGridTopPadding("");
      setCardBottomMargin("31vh"); 
      setCardPadding("13vmin");
    }
    if(window.innerWidth>750){
      setGridTopPadding("15vh");
      setCardBottomMargin("31vh");

    }
    else if(window.innerWidth>500){
      setGridTopPadding("");
    }
    else{
      setGridTopPadding("15vh");
      setCardBottomMargin("24vh");
      setCardPadding("25vmin");
    }
  },[]);
  
 

  return (
    <Grid style={{backgroundColor:"#4f5666", paddingTop: gridTopPadding}}>
        <Navigationbar loggedIn={false} loginPage={false} registerPage={true} />
        
          
          <Grid container className='centering' style={{paddingTop: cardPadding, marginBottom: cardBottomMargin}}>
            
            <Grid item xs="auto">
              <Card className='Card AuthCard'>
                <CardContent >
                  <h3 className='Card AuthCardTitle'>Register</h3>
                  <Container>
                    <form onSubmit={formik.handleSubmit}>
                    <TextField 
                        name='email'
                        type= 'email'
                        className="Card authInputs"
                        {... formik.getFieldProps('email')} 
                        label="Email"
                      />
                      {formik.touched.email && formik.errors.email ? <h6 style={{color:"red", fontSize:"80%",marginTop:"0", marginBottom:"15px"}}>{formik.errors.email}</h6> : null} 
                      {/* only check for error if the input is clicked on */}
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
                      {formik.touched.password && formik.errors.password ? <h6 style={{color:"red", fontSize:"80%",marginTop:"0", marginBottom:"15px"}}>{formik.errors.password}</h6> : null} 
                      
                      <TextField 
                        name='checkPassword'
                        type= 'password'
                        className="Card authInputs"
                        {... formik.getFieldProps('checkPassword')}
                        
                        label="Confirm Password"
                      />
                      { formik.touched.checkPassword ? 
                            ((formik.values.password === formik.values.checkPassword ) ? 
                              <h6 style={{color:"green", fontSize:"80%",marginTop:"0", marginBottom:"15px"}}>Passwords matching!</h6> : <h6 style={{color:"red", fontSize:"80%",marginTop:"0", marginBottom:"15px"}}>Passwords do not match!</h6>
                              ): null}                        

                      <Button type="submit" sx={{backgroundColor:"#42B729", 
                        border:"none", 
                        marginTop:"1.5rem", 
                        borderRadius:"20px", 
                        color:"white",
                        fontSize:"2vmin",
                        width:"18vmin"}}>
                        {!loading ? "Sign up" : <CircularProgress /> }  
                  
                      </Button>
                      {specialCasesMsg && <h6 style={{color:"red", fontSize:"80%", margin:"0", marginTop:"1rem"}}>{specialCasesMsg}</h6>}
                    </form>
                  </Container>
                </CardContent>
              </Card>          
            </Grid>
            
          </Grid>
        
        <Footer />
    </Grid>
  )
}

export default RegisterPage