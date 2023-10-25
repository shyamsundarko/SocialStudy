import { Button, Dialog, DialogTitle, DialogContent, Grid } from '@material-ui/core'
import React, { useState } from 'react'
import api from '../../../api'
import CircularProgress from '@mui/material/CircularProgress';

const CreateForumPopup = ({openCreate,setOpenCreate,schools,setSelectedSchool,displayModules}) => {

    const [name,setName]=useState('');
    const [description,setDescription]=useState('');
    const [school,setSchool]=useState('SCSE');
    const [isPending, setIsPending] = useState(false);

    
    const handleClose = () => {
      setOpenCreate(false);
      setName('');
      setDescription('');
    };

     
    const createForum= async (e) => {
        e.preventDefault();
        setIsPending(true);
        try{
            const res = await api.post('forums',{
                name: name,
                description: description,
                school: school,
            });
            if(res.status === 200){
                alert('forum created'); 
                setOpenCreate(false);
                setSelectedSchool(school);
                displayModules(school);
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
      <Dialog open={openCreate} onClose={handleClose}>
        <DialogTitle>Create New Forum</DialogTitle>
        <DialogContent>
        <Grid>
        <form className = 'create' onSubmit={createForum}>
        <label>Module Code:</label>
          <input
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
            <label>School:</label>
            <select
                value={ school }
                onChange={(e) => setSchool(e.target.value)}
            >
            {schools.map((school)=>
                <option key={school._id} value={school.name}>{school.name}</option>
            )}    
        
            </select>

           
              <Button type="submit" variant='outlined' style={{fontWeight:"600",textDecoration:"none", color:"green"}}>
                {!isPending? 'Submit': <CircularProgress size={25}></CircularProgress>}
              </Button>  
              
           
            
         
            
            
        </form>
        </Grid>
        
        </DialogContent>
        


      </Dialog>
    
  )
}

export default CreateForumPopup