import React , { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import io from 'socket.io-client';

const ChatRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();  // useLocation을 먼저 호출합니다.
  const { roomId, name, auth } = location.state || {};
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const localStreamRef = useRef();
  const userStreamRefs = useRef({});
  const peerConnections = useRef({});
  const dataChannels = useRef({});
  const [userAudioStatus, setUserAudioStatus] = useState({});
  const [microphoneStatus, setMicrophoneStatus] = useState(true);
  const [userChatStatus, setUserChatStatus] = useState({});
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const host = process.env.REACT_APP_API_HOST;
    const port = process.env.REACT_APP_API_PORT;
    const serverUrl = `${host}:${port}`;
    const newSocket = io(serverUrl);
    
    setSocket(newSocket);

    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
      localStreamRef.current.srcObject = stream;

      newSocket.emit('join', { roomId: roomId, name: name, auth: auth });

      newSocket.on('userId', async (userId) => {
        console.log(`[userId] userId: ${userId}`);
        setUserId(userId);
        setUsers(prevUsers => [...prevUsers, { userId, name, auth }]);
      });

      newSocket.on('roomFull', async (data) => {
        console.log(`[roomFull] data: ${JSON.stringify(data)}`);
        alert('최대 인원을 초과했습니다.');
        navigate(-1);
      });

      newSocket.on('allUsers', async (otherUsers) => {
        console.log(`[allUsers] otherUsers: ${JSON.stringify(otherUsers)}`);
        setUsers(prevUsers => [...prevUsers, ...otherUsers]);
        
        for (const user of otherUsers) {
          const peerConnection = createPeerConnection(newSocket, user.userId);
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          newSocket.emit('offer', { sdp: offer, to: user.userId });
          setUserAudioStatus(prevStatus => ({
            ...prevStatus,
            [user.userId]: true,
          }));
          setUserChatStatus(prevStatus => ({
            ...prevStatus,
            [user.userId]: true,
          }));
        }
      });

      newSocket.on('userJoined', async (data) => {
        console.log(`[userJoined] 데이터: ${JSON.stringify(data)}`);
        setUsers(prevUsers => [...prevUsers, { userId: data.userId, name: data.name }]);
        setUserAudioStatus(prevStatus => ({
          ...prevStatus,
          [data.userId]: true,
        }));
        setUserChatStatus(prevStatus => ({
          ...prevStatus,
          [data.userId]: true,
        }));
      });

      newSocket.on('offer', async (data) => {
        console.log(`[offer] 데이터: ${JSON.stringify(data)}`);
        const { sdp, from } = data;        
        const peerConnection = createPeerConnection(newSocket, from);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        newSocket.emit('answer', { sdp: answer, to: from });
      });

      newSocket.on('answer', async (data) => {
        console.log(`[answer] 데이터: ${JSON.stringify(data)}`);
        const { sdp, from } = data;
        const peerConnection = peerConnections.current[from];
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      newSocket.on('candidate', async (data) => {
        console.log(`[candidate] 데이터: ${JSON.stringify(data)}`);
        const { candidate, from } = data;
        const peerConnection = peerConnections.current[from];
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      newSocket.on('userDisconnected', (userId) => {
        console.log(`[userDisconnected] 유저아이디: ${userId}`);
        const peerConnection = peerConnections.current[userId];
        if (peerConnection) {
          peerConnection.close();
          delete peerConnections.current[userId];
          delete dataChannels.current[userId];
          delete userStreamRefs.current[userId];
          setUsers((prevUsers) => prevUsers.filter((user) => user.userId !== userId));
        }
      });
    });

    // 컴포넌트 언마운트 시 실행될 로직
    return async () => {
      newSocket.close();
    };
  }, []);

  const createPeerConnection = (socket, userId) => {
    console.log(`createPeerConnection 유저아이디: ${userId}`);
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:stun.l.google.com:19302',
        },
      ],
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit('candidate', { candidate: event.candidate, to: userId });
      }
    };

    peerConnection.ontrack = (event) => {
      userStreamRefs.current[userId].srcObject = event.streams[0];
    };

    peerConnection.ondatachannel = (event) => {
      console.log(`[ondatachannel] event: ${event}`)
      const dataChannel = event.channel;
      dataChannel.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setUserChatStatus((prevStatus) => {
          if (prevStatus[message.userId] !== false) {
            setMessages((prevMessages) => [...prevMessages, message]);
          }
          return prevStatus;
        });
      };
      dataChannels.current[userId] = dataChannel;
    };

    localStreamRef.current.srcObject.getTracks().forEach((track) => {
      peerConnection.addTrack(track, localStreamRef.current.srcObject);
    });

    peerConnections.current[userId] = peerConnection;

    const dataChannel = peerConnection.createDataChannel('chat');
    dataChannel.onopen = () => {
      console.log(`Data channel with user ${userId} is now open.`);
    };
    dataChannel.onclose = () => {
      console.log(`Data channel with user ${userId} has been closed.`);
    };
    dataChannel.onerror = (error) => {
      console.error(`Data channel error with user ${userId}: ${error}`);
    };
    dataChannel.onmessage = (event) => {
      console.log(`Data channel message event: ${event}`);
      const message = JSON.parse(event.data);
      setUserChatStatus((prevStatus) => {
        if (prevStatus[message.userId] !== false) {
          setMessages((prevMessages) => [...prevMessages, message]);
        }
        return prevStatus;
      });
    };
    dataChannels.current[userId] = dataChannel;

    return peerConnection;
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message = { user: name, text: newMessage, userId: userId };
      setMessages((prevMessages) => [...prevMessages, message]);
      for (const userId in dataChannels.current) {
        if (userChatStatus[userId] !== false) { // userChatStatus가 false가 아닌 경우에만 전송
          const dataChannel = dataChannels.current[userId];
          if (dataChannel.readyState === 'open') {
            dataChannel.send(JSON.stringify(message));
          } else {
            console.error(`Data channel for user ${userId} is not open. Current state: ${dataChannel.readyState}`);
          }
        }
      }
      setNewMessage('');
    }
  };
  
  const handleLeaveRoom = async () => {
    navigate("/");
  };

  const toggleAudio = (userId) => {
    console.log(`toggleAudio 호출 userId: ${userId}`);
    const audioElement = userStreamRefs.current[userId];    
    if (audioElement) {
      const isMuted = !audioElement.muted;
      audioElement.muted = isMuted;
      console.log(`userAudioStatus: ${JSON.stringify(userAudioStatus)}`);
      setUserAudioStatus((prevStatus) => ({
        ...prevStatus,
        [userId]: !isMuted,
      }));
    } else{
      console.error(`audioElement is undefined`);
    }
  };

  const toggleMicrophone = () => {
    console.log(`toggleMicrophone 호출`);
    const audioTracks = localStreamRef.current.srcObject.getAudioTracks();
    if (audioTracks.length > 0) {
        const enabled = audioTracks[0].enabled;
        audioTracks[0].enabled = !enabled;
        setMicrophoneStatus(!enabled); // 마이크 상태 업데이트
    }
  };

  const toggleChat = (userId) => {
    console.log(`toggleChat 호출 userId: ${userId}`);
    console.log(`userChatStatus: ${JSON.stringify(userChatStatus)}`);
    setUserChatStatus((prevStatus) => ({
      ...prevStatus,
      [userId]: !prevStatus[userId],
    }));
    console.log(`userChatStatus: ${JSON.stringify(userChatStatus)}`);
  };

  return (
    <div className="chat-room">
      <div>
        <audio ref={localStreamRef} autoPlay muted />
        {users.map((user) => (
          <audio key={user.userId} ref={(el) => (userStreamRefs.current[user.userId] = el)} autoPlay />
        ))}
      </div>
      <div className="left">
        <div className="user-list">
          <h2>참여자</h2>
          <ul>
            {users.map((user) => (
              <div key={user.userId}>
                <li>{user.name}</li>
                <button 
                  onClick={() => toggleAudio(user.userId)} 
                  style={{ backgroundColor: userAudioStatus[user.userId] ? 'green' : 'red', ...(user.userId === userId && { backgroundColor: '' }) }}
                  disabled={user.userId === userId}
                >
                  소리
                </button>
                <button 
                  onClick={toggleMicrophone} 
                  style={{ backgroundColor: microphoneStatus ? 'green' : 'red', ...(user.userId !== userId && { backgroundColor: '' }) }}
                  disabled={user.userId !== userId}
                >
                  마이크
                </button>
                <button
                  onClick={() => toggleChat(user.userId)}
                  style={{ backgroundColor: userChatStatus[user.userId] ? 'green' : 'red', ...(user.userId === userId && { backgroundColor: '' }) }}
                  disabled={user.userId === userId}
                >
                  채팅
                </button>
                <button>강제퇴장</button>
              </div>
            ))}
          </ul>
        </div>
        <div className="leave-button">
          <button onClick={handleLeaveRoom}>채팅방 나가기</button>
        </div>
      </div>
      <div className="right">
        <h2>채팅 내용</h2>
        <div className="messages">
          {messages.map((message, index) => (
            <div key={index} className="message">
              <strong>{message.user}:</strong> {message.text}
            </div>
          ))}
        </div>
        <div className="input-area">
          <input
            type="text"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSendMessage();
              }
            }}
          />
          <button onClick={handleSendMessage}>전송</button>
        </div>
      </div>
    </div>
  );
}

export default ChatRoom;