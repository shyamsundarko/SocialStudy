import {React, useEffect, useState} from 'react'
import { Grid, Button } from '@material-ui/core'
import Typography from '@mui/material/Typography';

import Navigationbar from '../Navigationbar'
import Footer from '../Footer'
import SchoolList from './SchoolList';
import ForumList from './ForumList';
import api from '../../api'
import LoadingScreen from '../LoadingScreen'
import { useNavigate } from 'react-router-dom';
import CircularProgress from '@mui/material/CircularProgress';

const ForumSelectionPage = ({unAuthenticate}) => {
  const navigate = useNavigate();

  const [schools, setSchools] = useState([]);
  const [forums, setForums] = useState([]);
  const [selectedForum, setSelectedForum]=useState("");
  const [selectedSchool,setSelectedSchool] = useState('CEE');
  const [loadingSchool, setLoadingSchool] = useState(false);
  const [loadingModule, setLoadingModule] = useState(false);
  const [loading, setLoading] = useState(false);
  
   const logout = async() =>{
    unAuthenticate();
    const res =  await api.post("/auth/logout");
    
  }

  const getSchoolList = async() =>{
    setLoadingSchool(true);
    const res = await api.get("/schools");
    if(res.status === 200){
      setSchools(res.data);
      setLoadingSchool(false);
    }
  }
  const displayModules = async (schoolName) =>{
      setLoadingModule(true);
      const res = await api.get('forums?school='+schoolName);
      if(res.status === 200){
        setForums(res.data);
        setLoadingModule(false);
      }
      
    }
  const getSelectedForum = (forumID) => {
    setSelectedForum(forumID);
  }
  const addToWatchlist = (selectedForum) =>{
    setLoading(true);
    const res = api.post('forums/'+selectedForum+"/star");
    setLoading(false);
    navigate('/homepage');
  }
  
  useEffect(() =>{
    getSchoolList();
    displayModules(selectedSchool);
  },[]);

  return (
    <Grid style={{minHeight:"100vh"}}>
        <Navigationbar loggedIn={true} loginPage={false} registerPage={false} logout={logout}/>
        <Grid container className='centering' style={{backgroundColor:"white",paddingTop:"10vmin", paddingBottom:"5vmin", minHeight:"90vh"}}>
            <Grid item xs={1} md={2}></Grid>
            <Grid item xs={10} md={4}>
              <Typography style={{fontWeight:"600",fontSize: '6vmin', marginTop:"7vmin"}} className="color1">
                  Module Selection
              </Typography>
            </Grid>
            <Grid item xs={1} md={5}></Grid>


            <Grid item xs={1} md={3} ></Grid>
            <Grid item xs={10} md={3}>
              <Typography style={{fontWeight:"600", color:"#0161a8" ,fontSize: '5vmin'}}>
                Select School
              </Typography>
            </Grid>
            <Grid item xs={1} md={6}></Grid>


            <Grid item xs={1} md={3} ></Grid>
            <Grid container item xs={10} md={6} className='centering customBox' >
              <Grid item xs={12}>
                { loadingSchool ? <CircularProgress /> : <SchoolList schools={schools} displayModules={displayModules} selectedSchool={selectedSchool} setSelectedSchool={setSelectedSchool}></SchoolList> }
              </Grid>
              <Grid item xs={12}></Grid>
            </Grid>
            <Grid item xs={1} md={3} ></Grid>

            

            <Grid item xs={1} md={3} ></Grid>
            <Grid item xs={10} md={3}>
              <Typography style={{fontWeight:"600", color:"#0161a8" ,fontSize: '5vmin'}}>
                Select Module
              </Typography>
            </Grid>
            <Grid item xs={1} md={6}></Grid>

            <Grid item xs={1} md={3} ></Grid>
            <Grid container item xs={10} md={6}  className='customBox' >
              <Grid item xs={12}>
               {loadingModule ? <CircularProgress /> : <ForumList forums={forums} selectedForum = {selectedForum} getSelectedForum={getSelectedForum} ></ForumList> }
              </Grid>
              <Grid item xs={12}></Grid>
            </Grid>
            <Grid item xs={1} md={3} ></Grid>


             
            <Grid container item xs={12} sm={6} style={{marginTop:"2rem", marginBottom:"6vmin"}}> 
              <Grid item xs={1} md={9}></Grid>     
              <Grid item xs={10} md={2}>
                  <Button 
                        size = 'large'
                        style={{fontWeight:"600",textDecoration:"none", color:"#44a8f5", fontSize: "2vmin", borderRadius:"30px", minWidth:"33vmin", maxWidth:"15rem"}}
                        variant='outlined'
                        onClick={()=>addToWatchlist(selectedForum)}
                        >{!loading? 'Done' : <CircularProgress></CircularProgress>}
                  </Button> 
              </Grid>
              <Grid item xs={1}></Grid>     
            </Grid>
            
        </Grid>
        <Footer />

    </Grid>
  )
}

export default ForumSelectionPage