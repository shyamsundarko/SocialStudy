import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';
import {Grid, TextField} from '@material-ui/core'
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import api from '../../api';

const EditMessage = ({message, setForReload, forReload}) => { 
    const [open, setOpen] = useState(false);
    const [content, setContent] = useState(message.content);  
    const [loading, setLoading] = useState(false);

    const handleSubmit = async() =>{
        
        setLoading(true);
        try{
         const res = await api.patch('/messages/'+message._id, 
         { 
             content: content
         });
         setLoading(false);
         setForReload(!forReload);
         handleClose();
       }
       catch(err)  {
         console.log(err);
       }
       
       
     }
     
    const handleClickOpen = () => {
        setOpen(true);
      };

    const handleClose = () => {
        setOpen(false);
      };

    return (
        <Grid container >
        <Button style={{backgroundColor:"#8a443d", color:"white", borderRadius:"25px", width:"7rem", marginRight:"0.25rem"}} onClick={handleClickOpen}> 
          <EditOutlinedIcon/> Edit
        </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Edit message</DialogTitle>
        <DialogContent style={{minWidth:"20vw"}}>
          <DialogContentText>
            What would you like to say?
          </DialogContentText>
          
          <TextField
            value = {content}
            autoFocus
            margin="dense"
            id="Message"
            label="Message"
            type="text"
            fullWidth
            variant="standard"
            onChange={(e) => setContent(e.target.value)}
            style={{marginRight:"1rem"}}
          />
          
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          {
              content == '' ?
              <Button disabled> Save</Button>
              :
            (
                !loading?
                <Button onClick={handleSubmit}> Save</Button>
                :
                <Button disabled>Saving</Button>
            )

          }
          
          
        </DialogActions>
      </Dialog>  
    </Grid>
    )
}

export default EditMessage