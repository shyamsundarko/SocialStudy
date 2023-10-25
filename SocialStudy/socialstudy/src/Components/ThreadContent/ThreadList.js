import React from 'react'
import Thread from './Thread'
import {Grid} from '@material-ui/core'
const ThreadList = ({threads, SelectedThread}) => {
  
  return (
    <Grid container item xs={12}  >
        {threads.map((thread)=>
            <Thread thread={thread} key={thread._id} SelectedThread={SelectedThread}></Thread>
       )} 
    </Grid>
  )
}

export default ThreadList