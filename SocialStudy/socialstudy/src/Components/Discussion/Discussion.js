import React,{useState, useEffect} from 'react'
import {Button, Grid} from '@material-ui/core'
import Navigationbar from '../Navigationbar';
import Footer from '../Footer';
import MessageList from './MessageList';
import AddMessage from './AddMessage';
import EditThread from '../ThreadContent/EditThread';
import api from '../../api';
import LoadingScreen from '../LoadingScreen'
import { useNavigate } from 'react-router-dom';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CircularProgress from '@mui/material/CircularProgress';

const Discussion = ({thread, unAuthenticate}) => {
  const navigate = useNavigate();
  const [author, setAuthor] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createdThread, setCreatedThread] = useState(false);
  const [forReload, setForReload] = useState(false);
  const [title, setTitle] = useState(thread.title);
  const [content, setContent] = useState(thread.content);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [forThreadReload, setForThreadReload] = useState(false);
  
  const getCurrentUser = async () => {
    const res = await api.get("/auth/user");
    if(res.status===200){
      if(res.data._id === thread.author){
        setCreatedThread(true);
      }
    }
    else setCreatedThread(false);
  }

  const logout = async() =>{
    unAuthenticate();
    const res =  await api.post("/auth/logout");
  }
  
  const getAuthor = async() =>{
    try{
      const res = await api.get('/users/'+thread.author);
      setAuthor(res.data.username);
    }
    catch(err){
      console.log(err.response.data);
    }
  }

  const getMsgFromDb = async() =>{
    const res = await api.get('/threads/'+thread._id);
    setMessages(res.data.messages);
  }
  
  const deleteThread = async() => {
    setLoadingDelete(true);
    const res = await api.delete('/threads/'+thread._id);
    if(res.status===200){
      setLoadingDelete(false);
      navigate('/homepage');
    }
  
  }

  const getThreadDetails = async () =>{
    setLoading(true);
    const res = await api.get('/threads/'+thread._id);
    thread = res.data;
    setTitle(thread.title);
    setContent(thread.content);
    setLoading(false);
  }

  useEffect(()=>{
    getMsgFromDb();
    getCurrentUser();
    getAuthor();
    
  },[forReload]);

  useEffect(()=>{
    getThreadDetails();
  },[forThreadReload]);

  return (
    <Grid style={{minHeight:"100vh"}}>
      {loading ? <LoadingScreen /> : 
      <div>
      <Navigationbar loggedIn={true} loginPage={false} registerPage={false} logout={logout}/>
        <Grid style={{backgroundColor:"white",paddingTop:"10vmin", paddingBottom:"5vmin", minHeight:"90vh", marginTop:"0.5rem"}}>
          <Grid container item xs={12} >
            

            <Grid item xs={1} />
            <Grid container item xs={11}>
              <Grid item xs={8}>
                <h2 style={{color:"#313842", fontSize:"4.5vmin", marginBottom:"0"}}>{title}</h2>
                <h3 style={{ color:"grey", marginBottom:"2rem"}}>{content}</h3>
              </Grid>
              <Grid item xs={1} style={{marginTop:"5vmin", marginRight:"1vmin"}}>
                {createdThread && <EditThread thread={thread} setForThreadReload={setForThreadReload} forThreadReload={forThreadReload}/> }
              </Grid>
            
              <Grid item xs={1} style={{marginTop:"5vmin"}}>
                {createdThread &&  
                  <div>
                    {loadingDelete ? <CircularProgress style={{marginTop:"0.2rem"}}/> :

                      <Button style={{backgroundColor:"#e3402d", color:"white", borderRadius:"25px", padding:"1rem", minWidth:"8vw"}} onClick={deleteThread}> 
                        <DeleteOutlineIcon/> Delete
                      </Button>

                    }
                  </div>
                }
              </Grid>
              <Grid item xs={2} />
            </Grid>
            


            <Grid item xs={1} />
            <Grid item xs={2} className="customBox centering" style={{borderRadius:"30px", backgroundColor:"#313842"}}>
             <h6 style={{color:"white", margin:"0.5rem"}}>{author}</h6>
            </Grid>
            <Grid item xs={9} />
          </Grid>


          <hr style={{color:"#d63636", border:"solid 2px", width:"90%", marginTop:"2rem"}}></hr>


          <Grid container item xs={12} style={{marginTop:"2rem", color:"#313842"}}>
            <Grid item xs={1} />
            <Grid item xs={3}>
              <AddMessage thread={thread} setForReload={setForReload} forReload={forReload} />
            </Grid>
            <Grid item xs={8} />

          
            <Grid item xs={1} />
            <Grid item xs={10}>
              <MessageList messages={messages} setForReload={setForReload} forReload={forReload}/> 
            </Grid>
            <Grid item xs={1} />
          
            
          </Grid>

          
        </Grid>
        <Footer />
        </div>
      } 
    </Grid>
    
  )
}

export default Discussion