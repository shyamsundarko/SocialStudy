import React, {useState, useEffect} from 'react'
import {Grid} from '@material-ui/core';
import Navigationbar from '../Navigationbar';
import Watchlist from './Watchlist';
import Dashboard from './Dashboard';
import AddThread from '../ThreadContent/AddThread';
import Footer from '../Footer';
import api from '../../api';
import LoadingScreen from '../LoadingScreen';
const Homepage = ({unAuthenticate, SelectedThread}) => {

  const [username, setUsername] = useState("");
  const [uid, setUid] = useState("");
  const [watchlist, setWatchlist] = useState([]);
  const [admin,setAdmin] = useState(false);
  const [threads, setThreads] = useState([]);
  const [selectedForum, setSelectedForum] = useState("");
  const [loading, setLoading] = useState(true);
  const [clicked, setClicked] = useState(false);
  const [forReload, setForReload] = useState(false);
  const [loadingDelete, setLoadingDelete] = useState(false);

  const logout = async() =>{
    unAuthenticate();
    const res =  await api.post("/auth/logout");
  }

  const getDetails = async() => {
    const res = await api.get("/auth/user");

    if(res.status===200){
      setUsername(res.data.username);
      setAdmin(res.data.admin)
      setUid(res.data._id);
      const response = await api.get("/users/"+res.data._id+"/starred-forums");
      if(response.status === 200){
        setWatchlist(response.data);
      }
      setLoading(false);
      setLoadingDelete(false);
    }
    else if(res.status===401){
      console.log("user not logged in!");
    }
  }

  const getSelectedForum = async(forumID) =>{
    setSelectedForum(forumID);

    const res = await api.get("/forums/"+forumID);
    if(res.status === 200){
      setLoading(false);
      
    }
  }

  const removeFromWatchlist = async() => {
    setLoadingDelete(true);
    const res = await api.post("/forums/"+selectedForum+"/unstar");  
    setSelectedForum('');
    getDetails();
  }

  const resetForum = (click) =>{
    setClicked(click);
  }
  useEffect(() => {
    getDetails();
  },[forReload]);

  return (
      <Grid style={{minHeight:"100vh"}}>
        {loading ? <LoadingScreen /> : 
        <div>
          <Navigationbar loggedIn={true} loginPage={false} registerPage={false} logout={logout}/>
        
        
          <Grid container className='centering' style={{backgroundColor:"white",paddingTop:"10vmin", paddingBottom:"5vmin", minHeight:"90vh"}}>

            <Grid item xs={12} md={1}></Grid>
            <Grid container item xs={12} md={3} style={{marginTop:"7vmin"}} className="centering">
                <Grid item xs={12} md={2}></Grid>
                <Grid item xs={12} md={2}>
                  <h2 style={{color:"#2D3C60", fontSize:"3vmin", margin:"0"}}>Hi,</h2>
                </Grid>
                <Grid item xs={12} md={8}></Grid>
                <Grid item xs={12} md={3}></Grid>
                <Grid item xs={12} md={2}>
                  <h2 style={{color:"#546FAC", fontSize:"5.5vmin", margin:"0", fontVariant:"small-caps"}}>{username}</h2>
                </Grid>
                <Grid item xs={12} md={7} />
            </Grid>
            
            <Grid container item xs={12} md={8} className="centering">
              <Grid item xs={8}  />
              
              <Grid item xs={3} >
              {selectedForum ?  <AddThread forumID={selectedForum} forReload={forReload} setForReload={setForReload} /> : null }
              </Grid>
              <Grid item xs={1}  />
              
              
              
            </Grid> 


            <Grid container item xs={12} >
              <Grid item xs={2} md={1}></Grid>
              <Grid item xs={7} md={3} >
                <Watchlist loading={loadingDelete} watchlist={watchlist} selectedForum={selectedForum} getSelectedForum={getSelectedForum} removeFromWatchlist={removeFromWatchlist} admin={admin}  />
              </Grid>
              <Grid item xs={12} md={7}>
                <Dashboard forumID={selectedForum} SelectedThread={SelectedThread} forReload={forReload} />
              </Grid>
              <Grid item xs={12} md={1} />

            </Grid>

          </Grid>
          <Footer />
        </div>
         
         
        }
        
      </Grid>
   
       
        
        
            
        
        
        
    
  )
}

export default Homepage