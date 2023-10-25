
import { BrowserRouter as Router, Route, Routes, Navigate}  from 'react-router-dom';

import {useState, useEffect} from 'react';

import StartingPage from './Components/StartingPage';
import LoginPage from './Components/LoginPage';
import RegisterPage from './Components/RegisterPage';
import ForumSelectionPage from './Components/ForumContent/ForumSelectionPage';
import Homepage from './Components/Homepage/Homepage';
import Profile from './Components/Profile';
import ForumEditorPage from './Components/ForumContent/Admin/ForumEditorPage';
import Discussion from './Components/Discussion/Discussion';
import api from './api';
function App() {


  const [user, setUser] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [selectedThread, setSelectedThread] = useState([]);
  
  const authenticate = () =>{
    setUser(true);
  }
  const unAuthenticate = () =>{
    setUser(false);
    window.location.reload(); //reloading to clear cache and force re-render
  }
  
  const check = async () =>{ //check if user is logged in
    const res = await api.get("/auth/user");
    if(res.status===200){
      setUser(true);
      setUserInfo(res.data);
    }
    else setUser(false);
  }

  useEffect(()=>{
    check();
  },[user]);


  const SelectedThread = (thread) =>{
    setSelectedThread(thread);
  }


  return (

    <Router>
        <div id="mainContainer">
          
          <Routes>
            {!user && (
              <>
                
                <Route exact path="/" element={<StartingPage />} />
                <Route exact path="/login" element={<LoginPage authenticate={authenticate}/>} />
                <Route exact path="/register" element={<RegisterPage />} />
              </>
            )}
            
            {user && (
              <>
              
                <Route exact path="/forum-selection" element={<ForumSelectionPage  unAuthenticate={unAuthenticate}/>} />
                <Route exact path="/homepage" element={<Homepage unAuthenticate={unAuthenticate} SelectedThread={SelectedThread} />} />
                <Route exact path="/profile" element={<Profile unAuthenticate={unAuthenticate} />} />
                <Route exact path="/forum-edit" element={<ForumEditorPage unAuthenticate={unAuthenticate} />} />
                <Route exact path="/thread-discussion" element={<Discussion thread={selectedThread} user={userInfo} unAuthenticate={unAuthenticate}/>} />
              </>

            )}
            
            <Route path="*" element={<Navigate to={user ? "/homepage" : "/login"}/>}/>
            
          </Routes>
            
            
        </div>
      </Router>
    );
  
  
}

export default App;
