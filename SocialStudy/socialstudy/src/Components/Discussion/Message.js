import React, {Fragment, useEffect, useState} from 'react'
import {Button, Card, Grid } from '@material-ui/core'
import api from '../../api'

import Skeleton from '@mui/material/Skeleton';
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import CircularProgress from '@mui/material/CircularProgress';
import EditMessage from './EditMessage';

const Message = ({message,createdMessage, setForReload, forReload}) => {
  const [author, setAuthor] = useState("");
  const [voteCount, setvoteCount] = useState('');
  const [voteStatus,setVoteStatus] = useState('nil');
  const [loading,setLoading] = useState(false);

  const deleteMessage= async() => {
    setLoading(true);
    const res = await api.delete('/messages/'+message._id);
    setLoading(false);
    setForReload(!forReload);
  }

  const getAuthor = async() =>{
    setLoading(true);
    try{
      const res = await api.get('/users/'+message.author);
      setAuthor(res.data.username);
    }
    catch(err){
      console.log(err.response.data);
    }
    setLoading(false);
  }

  const handleUpvote = async () =>{
    try{
        if(voteStatus === 'nil'){
          console.log("upvote");
          setvoteCount(voteCount + 1);
          setVoteStatus('up');
          const res = await api.post('/messages/'+message._id+'/upvote');
        
        }
        else if(voteStatus === 'up'){
          console.log('cancel upvote')   
          setvoteCount(voteCount - 1); 
          setVoteStatus('nil');
          const res = await api.post('/messages/'+message._id+'/clear-upvote');

        }else{
          console.log('cancel downvote and upvote')
          setvoteCount(voteCount + 2); 
          setVoteStatus('up') 
          const res = await api.post('/messages/'+message._id+'/upvote');


        }
      } 
    catch(err){
      if(err.response.status === 404){
        setForReload(!forReload);
      }
    }
  }

  const handleDownvote = async () =>{
    try{
      if(voteStatus === 'nil'){
        console.log("downvote");
        setvoteCount(voteCount - 1);
        setVoteStatus('down');
        const res = await api.post('/messages/'+message._id+'/downvote');
      
      }
      else if(voteStatus === 'down'){
        console.log('cancel downvote')  
        setvoteCount(voteCount + 1);
        setVoteStatus('nil');
        const res = await api.post('/messages/'+message._id+'/clear-downvote');
      
      }else{
        console.log('cancel upvote ,and downvote')
        setvoteCount(voteCount - 2); 
        setVoteStatus('down') 
        const res = await api.post('/messages/'+message._id+'/downvote');
      
      }
    }
    catch(err){
      if(err.response.status === 404){
        setForReload(!forReload);
      }
    }
     
  }  


 useEffect(()=>{
    getAuthor();

    if(message.upvoted)
      setVoteStatus('up');
    else if(message.downvoted)
      setVoteStatus('down');

    setvoteCount(message.upvotes - message.downvotes);  
    
 },[])
  return (
    
    <Card style={{width:"100%", borderRadius:"20px", padding:"1rem", marginBottom:"1rem", backgroundColor:"#ffe1d4"}}>
      <Grid container>
 
        <Grid item xs={2} className="customBox centering" style={{borderRadius:"30px", backgroundColor:"#313842", marginRight:"1rem"}}>
               <h6 style={{color:"white", margin:"0.5rem"}}>{loading ? ( <Skeleton animation="wave"  height={10}  ></Skeleton>) :author}</h6>
        </Grid>
        
        <Grid container item xs={2}>
          
            {createdMessage &&
            <Fragment>
               <Grid item xs={6}>
                 <EditMessage message = {message} setForReload={setForReload} forReload={forReload}></EditMessage>
              </Grid>
              <Grid item xs={6}>
                <Button style={{backgroundColor:"#e3402d", color:"white", borderRadius:"25px", width:"6rem"}} onClick={deleteMessage}> 
                  { !loading ? <DeleteOutlineIcon/> :<CircularProgress size ='1rem'/>}{ !loading ? 'Delete' : 'Deleting'}
                </Button>
              </Grid>
            </Fragment>
            }
        </Grid>
        <Grid item xs={8} />
      
      
        <Grid item xs={9}>
           <h4 style={{marginLeft:"2vmin"}}>{loading ? ( <Skeleton animation="wave"  height={30}  ></Skeleton>) : message.content}</h4>
        </Grid>
        <Grid item xs={1}> 
          <Button>
            {voteStatus == 'up'? 
            <ThumbUpRoundedIcon color='action' onClick={handleUpvote}></ThumbUpRoundedIcon> :<ThumbUpOutlinedIcon color='action' onClick={handleUpvote}></ThumbUpOutlinedIcon>
            }
          </Button>  
        </Grid>
        <Grid item xs={1}>
          <Button color='action'>{loading ? null : voteCount}</Button>
        </Grid>
        <Grid  item xs={1}>
          <Button>
            {voteStatus == 'down'? 
              <ThumbDownAltRoundedIcon  color='action' onClick={handleDownvote}/> : <ThumbDownAltOutlinedIcon color='action' onClick={handleDownvote}/>
            }
          </Button>
        </Grid>

      </Grid>
      
    </Card>
  )
}

export default Message