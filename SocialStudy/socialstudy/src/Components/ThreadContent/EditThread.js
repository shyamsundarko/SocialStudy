import React,{useState} from 'react'
import {Grid, TextField} from '@material-ui/core'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';

import api from '../../api'; 

const EditThread = ({thread, setForThreadReload, forThreadReload}) => {

    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState(thread.title);
    const [content, setContent] = useState(thread.content);
    const [loading, setLoading] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setTitle(thread.title);
      setContent(thread.content);
      setOpen(false);
    };

  
    const handleSubmit = async() =>{
        
       setLoading(true);
       try{
        const res = await api.patch('/threads/'+thread._id, 
        {
            title, 
            content
        });
        setForThreadReload(!forThreadReload);

        setLoading(false);
        handleClose();
      }
      catch(err)  {
        console.log(err.response);
      }
      
      
    }
    

    return (
    
    <Grid container >
      <Button style={{backgroundColor:"#8a443d", color:"white", borderRadius:"25px", padding:"1rem", minWidth:"8vw"}} onClick={handleClickOpen}>
        <EditOutlinedIcon/>
        Edit
      </Button>
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit Thread</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter title and content of the thread
          </DialogContentText>
          <TextField
            value={title}
            autoFocus
            margin="dense"
            id="Title"
            label="Title"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => setTitle(e.target.value)}
          />
          <TextField
            value = {content}
            autoFocus
            margin="dense"
            id="Content"
            label="Content"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {
            (title ==''|| content =='')?
            <Button disabled>
              Update
            </Button>
            :
            <Button onClick={handleSubmit}>
              {!loading ? "Update" :  <CircularProgress />}
            </Button>
          }
          
        </DialogActions>
      </Dialog>  
    </Grid>
  )
}

export default EditThread