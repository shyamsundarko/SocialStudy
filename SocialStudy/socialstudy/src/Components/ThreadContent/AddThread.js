import React,{useState} from 'react'
import {Grid, TextField} from '@material-ui/core'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import CircularProgress from '@mui/material/CircularProgress';

import api from '../../api'; 
import {useNavigate} from 'react-router-dom';
import { set } from 'mongoose';

const AddThread = ({forumID, forReload, setForReload}) => {
  
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => { 
      setTitle('');
      setContent('');
      setOpen(false);
    };

  
    const handleSubmit = async() =>{
  
      setLoading(true);
       try{
       const res = await api.post('threads',{
          
          forum: forumID,
          title: title,
          content: content
        
        });
        setForReload(!forReload);

        
        setLoading(false);
        handleClose();
      }
      catch(err)  {
        console.log(err.response);
      }
      
      
    }
    

    return (
    
    <Grid container >
      <Button variant="outlined" onClick={handleClickOpen}>
        Start a discussion
      </Button>
      <Dialog open={open} onClose={handleClose} style={{backgroundColor:"rgba(56,132,255,0.1)"}}>
        <DialogTitle>Create New Thread</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Please enter title and content of the thread
          </DialogContentText>
          <TextField
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
            
            margin="dense"
            id="Content"
            label="Content"
            type="text"
            fullWidth
            variant="outlined"
            multiline={true}
            rows={6}
            onChange={(e) => setContent(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {
            (title ===''|| content ==='')?
            <Button disabled>
              Create
            </Button>
            :
            <Button onClick={handleSubmit}>
              {!loading ? "Create" :  <CircularProgress />}
            </Button>
          }
        </DialogActions>
      </Dialog>  
    </Grid>
  )
}

export default AddThread