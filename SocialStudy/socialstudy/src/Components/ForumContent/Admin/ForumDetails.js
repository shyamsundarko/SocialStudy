import { Button, Card, CardContent, Container, Grid} from '@material-ui/core'
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import React from 'react'
import { useState,useEffect } from 'react';
import api from '../../../api';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import CircularProgress from '@mui/material/CircularProgress';

const ForumDetails = ({openDetails,setOpenDetails,selectedForum,schools, forReload, setForReload}) => {

  const [forum, setForum] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(false);
  const [name,setName]=useState('');
  const [description,setDescription]=useState('');
  const [isPending, setIsPending] = useState(false);

  const handleClose = () => {
    setOpenDetails(false);
    setEdit(false);
  };

  const deleteModule = async (selectedForum) =>{
    setIsPending(true);
    const res = await api.delete('forums/'+selectedForum);
    if(res.status === 400){
      alert('invalid forum id');
    }

    if(res.status === 200){
      alert('module deleted'); 
      setForReload(!forReload);
      handleClose();
    }
    setIsPending(false);
  }

  useEffect(() =>{
      getModuleDetails(selectedForum)
    },[forReload,selectedForum]);

  const getModuleDetails = async (selectedForum) =>{
    setLoading(true);
    const res = await api.get('forums/'+selectedForum);
   
    if(res.status === 200){
      setForum(res.data);
      setLoading(false);
      setName(res.data.name);
      setDescription(res.data.description);
    }
  }    

  const updateForum= async (e) => {
    e.preventDefault();
    setIsPending(true);
    try{
        const res = await api.patch('forums/'+selectedForum,{
            description: description,
        });
        if(res.status === 200){
            alert('forum updated'); 
            setForReload(!forReload);
            handleClose();
            setIsPending(false);
        }

    }
    catch(err){
        console.log(err.response.data)
        if(err.response.status === 400){
            alert(err.response.data.message); 
    }
    setIsPending(false);
    }
  }









  return (
    <Dialog open={openDetails} onClose={handleClose}>
      <DialogTitle>{ edit ? "Editing Module" : "Module Details"} </DialogTitle> 
        <DialogContent>{!edit?
           <Card style={{marginTop:"2rem", border:"solid #b0273e 5px", backgroundColor:"#faebeb"}}>
            <CardContent>
                
                {(selectedForum && forum && !loading) ?(
                
                <Container>
                
                <h3>Module Code: {forum.name}</h3>
                <h3>Module Name: {forum.description}</h3>
                <h3>SchoolID: {forum.school}</h3>
                <Button 
                  variant='outlined'
                  onClick={() => deleteModule(selectedForum)}
                  style={{marginBottom:"2rem", margin:"1rem",backgroundColor:"#630704", color:"white",  position: 'relative', left: '40%'}}
                  >
                  <DeleteOutlineIcon/>
                  {!isPending? 'Delete' :<CircularProgress size={25}></CircularProgress>}
                </Button>

                <Button 
                  variant='outlined'
                  onClick={() => setEdit(true)}
                  style={{marginBottom:"2rem",margin:"1rem",backgroundColor:"#630704", color:"white",  position: 'relative', left: '40%'}}
                  >
                  <EditOutlinedIcon/>
                  Edit
                </Button>  
              
                </Container>
                )
                :
                <Container>
                  <CircularProgress></CircularProgress>
                </Container>
                }
            </CardContent>
           </Card>
               
        : 
        <Grid>
        <form className = 'create' onSubmit={updateForum}>
        <label>Module Code:</label>
          <input
            readOnly
            type ='text'
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          ></input>
         <label>Module Name:</label>
          <input 
            type ='text'
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
            <Button type="submit" variant='outlined' style={{fontWeight:"600",textDecoration:"none", color:"green"}}>{!isPending? 'Update': <CircularProgress size={25}></CircularProgress>}</Button>

        </form>
        </Grid>}
         
        </DialogContent>
      
    
        
    </Dialog>
         
      
    
  )
}

export default ForumDetails