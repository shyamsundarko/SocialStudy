import React from 'react'
import { Grid } from '@material-ui/core'
import School from './School'



const SchoolList = ({schools, displayModules, selectedSchool, setSelectedSchool}) => {
  return (
    <Grid container item xs={12}  >
        {schools.map((school)=>
            <School schoolName={school.name} displayModules={displayModules} key={school._id} selectedSchool={selectedSchool} setSelectedSchool={setSelectedSchool}></School>
       )} 
    </Grid>
   
  )
}

export default SchoolList