import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Avatar,
  Snackbar,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { makeStyles } from '@mui/styles';
import MuiAlert from '@mui/material/Alert';


const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    padding: 0,
    margin: 0,
  },
  chatHeader: {
    backgroundColor: '#1976d2',
    color: '#fff',
    padding: '10px',
    textAlign: 'center',
  },
  chatLogContainer: {
    flexGrow: 1,
    overflowY: 'auto',
    padding: '10px',
    backgroundColor: '#f5f5f5',
    display: 'flex',
    flexDirection: 'column',
  },
  chatBubble: {
    marginBottom: '10px',
    padding: '10px',
    borderRadius: '10px',
    maxWidth: '75%',
    display: 'flex',
    alignItems: 'center',
  },
  chatBubbleUser: {
    backgroundColor: '#d1eaff',
    alignSelf: 'flex-end',
  },
  chatBubbleOther: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    border: '1px solid #ddd',
  },
  avatar: {
    marginRight: '10px',
  },
  messageInputContainer: {
    display: 'flex',
    padding: '10px',
    borderTop: '1px solid #ddd',
    backgroundColor: '#fff',
    position: 'sticky',
    bottom: 0,
    left: 0,
    right: 0,
  },
  messageInput: {
    flexGrow: 1,
  },
  sendButton: {
    marginLeft: '10px',
  },
  inputContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
}));
let socket = io(process.env.REACT_APP_SOCKET_SERVER_URL||"http://localhost:5000");
if(!socket){
   socket = io("http://localhost:5000");
}
console.log(socket)

const Alert = React.forwardRef(function Alert(props, ref) {
  return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
});

const Chat = () => {
  const classes = useStyles();
  const [message, setMessage] = useState('');
  const [room, setRoom] = useState('');
  const [chatLog, setChatLog] = useState([]);
  const [isJoined, setIsJoined] = useState(false);
  const [username, setUsername] = useState('');
  const [snackOpen, setSnackOpen] = useState(false);
  
  const chatEndRef = useRef(null); 

  
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  
  const toggleRoom = () => {
    if (room) {
      if (isJoined) {
        socket.emit('leaveRoom', room);
      } else {
        socket.emit('joinRoom', room);
        handleSnackOpen(); 
      }
      setIsJoined(!isJoined);
    }
  };

  
  const sendMessage = () => {
    if (message && isJoined && username) {
      socket.emit('chatMessage', { room, message, username });
      setMessage(''); 
    }
  };

  
  useEffect(() => {
    socket.on('message', (data) => {
      setChatLog((prevLog) => [...prevLog, data]);
    });

    return () => {
      socket.off('message');
    };
  }, []);

  
  useEffect(() => {
    scrollToBottom();
  }, [chatLog]);

  
  const handleSnackOpen = () => {
    setSnackOpen(true);
  };

  
  const handleSnackClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackOpen(false);
  };

  return (
    <Container className={classes.container}>
  
      <Box className={classes.chatHeader}>
        <Typography variant="h6">
          Chat Room: {room || 'No Room Joined'}
        </Typography>
      </Box>

   
      <Box className={classes.chatLogContainer}>
        {chatLog.map((log, index) => (
          <Box
            key={index}
            className={`${classes.chatBubble} ${
              log.username === username ? classes.chatBubbleUser : classes.chatBubbleOther
            }`}
          >
            <Avatar className={classes.avatar}>{log.username[0].toUpperCase()}</Avatar>
            <Typography>
              <strong>{log.username}:</strong> {log.message}
            </Typography>
          </Box>
        ))}
        <div ref={chatEndRef} />
      </Box>

    
      <Box className={classes.inputContainer}>
        <TextField
          label="Enter Username"
          variant="outlined"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ flexGrow: 1, marginRight: '10px' }}
          disabled={isJoined} 
        />
        <TextField
          label="Enter Room"
          variant="outlined"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          style={{ flexGrow: 1, marginRight: '10px' }}
          disabled={isJoined} 
        />
        <Button
          variant="contained"
          color="secondary"
          onClick={toggleRoom}
          style={{ height: '56px' }}
        >
          {isJoined ? 'Leave Room' : 'Join Room'}
        </Button>
      </Box>


      <Box className={classes.messageInputContainer}>
        <TextField
          label="Enter message"
          variant="outlined"
          className={classes.messageInput}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          disabled={!isJoined || !username} 
        />
        <Button
          variant="contained"
          color="primary"
          className={classes.sendButton}
          onClick={sendMessage}
          style={{ marginLeft: '20px' }}
          disabled={!isJoined || !username} 
        >
          <SendIcon />
        </Button>
      </Box>

  
      <Snackbar open={snackOpen} autoHideDuration={6000} onClose={handleSnackClose}>
        <Alert onClose={handleSnackClose} severity="success">
          Welcome to the chat!
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default Chat;
