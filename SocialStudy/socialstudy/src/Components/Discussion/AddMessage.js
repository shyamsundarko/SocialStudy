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


const AddMessage = ({thread, setForReload, forReload}) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleClickOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setMessage('');
      setOpen(false);
    };

  
    const handleSubmit = async() =>{
      
        setLoading(true);
        try{
          const res = await api.post('/messages',{
            thread: thread._id,
            content: message,
          });
          setLoading(false);
          handleClose();
          setForReload(!forReload);
          
        }
        catch(err){
          console.log(err.response.data);
        }
        
      
       
      
      
    }
    

    return (
    
    <Grid container >
        <h3>Comments<Button style={{borderRadius:"60px", border:"solid 1px", marginLeft:"1rem"}} onClick={handleClickOpen}>+</Button></h3>
      <Dialog open={open} onClose={handleClose} style={{backgroundColor:"rgba(56,132,255,0.1)"}}>
        <DialogTitle>Post a message</DialogTitle>
        <DialogContent style={{minWidth:"20vw"}}>
          <DialogContentText>
            What would you like to say?
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            id="Message"
            label="Message"
            type="text"
            fullWidth
            variant="outlined"
            multiline={true}
            rows={6}
            onChange={(e) => setMessage(e.target.value)}
            style={{marginRight:"1rem"}}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {
            (message =='')?
            <Button disabled>
              Post
            </Button>
            :
            <Button onClick={handleSubmit}>
              {!loading ? "Post" :  <CircularProgress />}
            </Button>
          }
          
        </DialogActions>
      </Dialog>  
    </Grid>
  )
}

export default AddMessage