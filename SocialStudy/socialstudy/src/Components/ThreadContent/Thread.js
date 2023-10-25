import {React, useState, useEffect, Fragment} from 'react'
import {Button, Grid} from '@mui/material';
import {Link} from 'react-router-dom';
import Skeleton from '@mui/material/Skeleton';
import api from '../../api'
import ThumbUpOutlinedIcon from '@mui/icons-material/ThumbUpOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import ThumbUpRoundedIcon from '@mui/icons-material/ThumbUpRounded';
import ThumbDownAltRoundedIcon from '@mui/icons-material/ThumbDownAltRounded';

const Thread = ({thread, SelectedThread}) => {

  const [voteCount, setvoteCount] = useState('');
  const [voteStatus,setVoteStatus] = useState('nil');
  const [loading,setLoading] = useState(false);

  const handleUpvote = async () =>{
    
    if(voteStatus === 'nil'){
      console.log("upvote");
      setvoteCount(voteCount + 1);
      setVoteStatus('up');
      const res = await api.post('/threads/'+thread._id+'/upvote');
      
    }
    else if(voteStatus === 'up'){
      console.log('cancel upvote')
      setvoteCount(voteCount - 1);  
      setVoteStatus('nil');
      const res = await api.post('/threads/'+thread._id+'/clear-upvote');
     
    }else{
      console.log('cancel downvote and upvote')
      setvoteCount(voteCount + 2); 
      setVoteStatus('up') 
      const res = await api.post('/threads/'+thread._id+'/upvote');
      
    }
      
  }
  const handleDownvote = async () =>{
    if(voteStatus === 'nil'){
      console.log("downvote");
      setvoteCount(voteCount - 1);
      setVoteStatus('down');
      const res = await api.post('/threads/'+thread._id+'/downvote');
    
    }
    else if(voteStatus === 'down'){
      console.log('cancel downvote')
      setvoteCount(voteCount + 1);  
      setVoteStatus('nil');
      const res = await api.post('/threads/'+thread._id+'/clear-downvote');
     
    }else{
      console.log('cancel upvote ,and downvote')
      setvoteCount(voteCount - 2); 
      setVoteStatus('down') 
      const res = await api.post('/threads/'+thread._id+'/downvote');
      
    }
     
  }

  const getThreadDetails = async () =>{
    setLoading(true);
    const res = await api.get('/threads/'+thread._id);
    thread = res.data;

    if(thread.upvoted)
      setVoteStatus('up');
    else if(thread.downvoted)
      setVoteStatus('down');
    setvoteCount(thread.upvotes - thread.downvotes); // get total vote count
    
    setLoading(false);
  }


  useEffect( ()=>{
    getThreadDetails();
  },[]);


  return (
    <Grid container style={{margin: "0.5rem"}}>
      <Grid item xs={9}>
      
        <Button style={{width:"100%"}} onClick={() => SelectedThread(thread)}>
          <Link to="/thread-discussion" style={{
            fontWeight:"600", padding:"0.5rem", fontSize:"0.8rem",
            backgroundColor:"#d3e1f5", borderRadius:"20px", width:"100%", color:"#3e444d", textDecoration:"none", margin:"none"}}>
              {loading ? (
                <Fragment>
                  <Skeleton animation="wave"  height={10}  ></Skeleton>
                  <Skeleton animation="wave"  height={10}  width="80%"></Skeleton>
                </Fragment>
            )
        :thread.title}
          </Link>
    
        </Button>
        
        
      </Grid>
      <Grid container item xs={1}>
      {loading ? null :
      <Fragment>
        <Button>
          {voteStatus === 'up'? 
          <ThumbUpRoundedIcon style={{color:"white"}} onClick={handleUpvote}></ThumbUpRoundedIcon> :<ThumbUpOutlinedIcon style={{color:"white"}} onClick={handleUpvote}></ThumbUpOutlinedIcon>
          }
        </Button>
      </Fragment>
      }
      </Grid>
      <Grid container item xs={1}>
        <Button style={{color:"white"}}>{loading ? null : voteCount}</Button>
      </Grid>
      <Grid container item xs={1}>
      {loading ? null :
        <Button>
          {voteStatus === 'down'? 
            <ThumbDownAltRoundedIcon  style={{color:"white"}} onClick={handleDownvote}/> : <ThumbDownAltOutlinedIcon style={{color:"white"}} onClick={handleDownvote}/>
          }
        </Button>
      }
      </Grid>
              
    </Grid>
  )
}

export default Thread