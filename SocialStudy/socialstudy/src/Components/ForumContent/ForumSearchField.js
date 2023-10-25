import * as React from 'react';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Autocomplete from '@mui/material/Autocomplete';


export default function ForumSearchField({forumList}) {
  return (
   
    <Stack spacing={2} sm={10} sx={{ width: "100%" }} >
        <Autocomplete className='field'
          freeSolo
            // add in the line below after freeSolo when we can query the forumList from the DB
            // options={forumList.map((option) => option.title)}
          renderInput={(params) => <TextField {...params} label="Search for a module..." />}
        />
    </Stack> 
  
  );
}