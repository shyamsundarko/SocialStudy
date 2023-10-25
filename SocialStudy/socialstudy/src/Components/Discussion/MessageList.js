import {React, useEffect, useState} from 'react'
import {Grid} from '@material-ui/core'
import Message from './Message'

import api from '../../api'

const MessageList = ({messages,forReload, setForReload}) => {
   
  const [currentUser,setCurrentUser] = useState('');

  const getCurrentUser = async () => {
    const res = await api.get("/auth/user");
    if(res.status===200){
      setCurrentUser(res.data._id);
  }
  }
  useEffect(() =>{
    getCurrentUser();
  },[]);

  return (
    <Grid container item xs={12}  >
        {messages.map((message)=>
            <Message message={message} key={message._id} createdMessage={currentUser == message.author ? true :false} setForReload={setForReload} forReload={forReload}></Message>
       )} 
    </Grid>
  )
}

export default MessageList