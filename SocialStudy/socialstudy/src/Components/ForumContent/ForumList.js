import React from 'react'
import Forum from './Forum';
import { Grid } from '@material-ui/core'
const ForumList = ({forums, selectedForum, getSelectedForum, setOpenDetails}) => {
  return (
    <Grid container item xs={12} style={{padding:"1rem"}} className="centering">
       {forums.map((forum)=>
            <Forum forum={forum} selectedForum={selectedForum} getSelectedForum={getSelectedForum} key={forum._id} setOpenDetails={setOpenDetails}></Forum>
       )}
    </Grid>
  )
}

export default ForumList