import React, {useState, useEffect, Fragment} from 'react'
import {Grid, Card, CardContent} from '@material-ui/core';
import api from '../../api';
import ThreadList from '../ThreadContent/ThreadList';
import Skeleton from '@mui/material/Skeleton';

const Dashboard = ({forumID, SelectedThread, forReload}) => {
    const [threads, setThreads] = useState([]);
    const [loading, setLoading] = useState(false);

    const getThreads = async() =>{
        setLoading(true);
        try{
            const res = await api.get('/forums/'+forumID);
            setThreads(res.data.threads);
            setLoading(false);
        }
        catch(err)  {
            console.log(err.response);
          }
         
    }
   
    useEffect(()=>{
        getThreads();
    },[forumID,forReload]);
  return (
    
        <Card style={{minHeight:"50vh", backgroundColor:"#4C596F", borderRadius:"25px", marginTop:"5vmin"}} >
            <CardContent >
                <Grid container item xs={12} className="centering">

                    <Grid item xs={12}>
                        <h3 style={{color:"white"}}>Dashboard</h3>
                    </Grid>
                    <Grid item xs={12}>
                        {loading && forumID ? (
                            <Fragment>
                                <Skeleton style={{width:"100%", borderRadius:"25px"}}  animation="wave" height={80} ></Skeleton>
                            </Fragment>
                           )   
                            :
                            ( threads && <ThreadList threads={threads} SelectedThread={SelectedThread} />)}
                    </Grid>

                </Grid>
            </CardContent>
        </Card>
        
    
  )
}

export default Dashboard