import React from 'react';
import {Grid, Card, CardContent, Button} from '@material-ui/core';
import { Link } from 'react-router-dom';
import ForumList from '../ForumContent/ForumList';
import CircularProgress from '@mui/material/CircularProgress';

const Watchlist = ({loading, watchlist, selectedForum,  getSelectedForum, removeFromWatchlist, admin}) => {

    

    
  return (
    <Grid container item xs={12} style={{marginTop:"4vmin"}} className="centering">
            <Grid item xs={1}></Grid>
            <Grid container item xs={4}>
                <Card style={{width:"18vw", minWidth:"15rem", height:"100%", borderRadius:"20px", backgroundColor:"#F5F7FA", minHeight:"40vh"}}>
                    <CardContent>
                        <h3 style={{paddingLeft:"2vmin", paddingRight:"2vmin", color:"#2d3c60a8"}} className="test">WATCHLIST</h3>
                        <Grid container style={{minHeight:"30vh"}}>
                            <ForumList forums={watchlist} selectedForum={selectedForum} getSelectedForum={getSelectedForum}/>
                        </Grid>
                        <Grid item xs={12}>
                            <Button ><Link to="/forum-selection" 
                                style={{textDecoration:"none", fontVariant:"none", backgroundColor:"#92B7FD", 
                                    color:"white", borderRadius:"20px", padding:"5px", textTransform:"none", minWidth:"10rem"}}>Add module</Link></Button>
                        
                        </Grid>
                        <Grid item xs={12}>
                            <Button  
                                style={{textDecoration:"none", fontVariant:"none", backgroundColor:"#c93412", 
                                    color:"white", borderRadius:"20px", padding:"5px", textTransform:"none", minWidth:"11rem"}} onClick={removeFromWatchlist}>
                                    {!loading? 'Remove module' : <CircularProgress size={25}></CircularProgress>}
                            </Button>
                        </Grid>

                        { admin &&
                        <Grid item xs={12}>
                        <Button ><Link to="/forum-edit" 
                            style={{textDecoration:"none", fontVariant:"none", backgroundColor:"#92B7FD", 
                                color:"white", borderRadius:"20px", padding:"5px", textTransform:"none", minWidth:"10rem"}}>Edit module</Link></Button>

                        </Grid>
                        }
                    </CardContent>
                </Card>
            </Grid>
            <Grid item xs={7}></Grid>
        </Grid>
  )
}

export default Watchlist