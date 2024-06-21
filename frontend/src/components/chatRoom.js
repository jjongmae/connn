import React , { useEffect, useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import USERS from '../mock/users.json'
import io from 'socket.io-client';

const fetchUserList = async (roomId) => {
  const host = process.env.REACT_APP_API_HOST;
  const port = process.env.REACT_APP_API_PORT;
  const url = `${host}:${port}/users/room/${roomId}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error(`유저 목록을 불러오는데 실패했습니다: ${error}`);
  }
};

const leaveChatRoom = async (userId, roomId) => {
  const host = process.env.REACT_APP_API_HOST;
  const port = process.env.REACT_APP_API_PORT;
  const url = `${host}:${port}/chatRooms/leave`; // 엔드포인트 변경

  try {
    const response = await fetch(url, {
      method: 'POST', // 메소드 변경
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ userId, roomId }) // userId와 roomId를 JSON 형태로 전송
    });
    const data = await response.json();
    if (response.ok) {
      console.log(data.message); // 성공 메시지 로그
    } else {
      console.error(data.message); // 실패 메시지 로그
    }
  } catch (error) {
    console.error(`채팅방 나가기 실패: ${error}`);
  }
};

const ChatRoom = () => {
  const [userList, setUserList] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [socket, setSocket] = useState(null);
  const [users, setUsers] = useState([]);
  const localStreamRef = useRef();
  const userStreamRefs = useRef({});
  const peerConnections = useRef({});
  const dataChannels = useRef({});
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId, userId, name } = location.state || {}; // state가 없는 경우를 대비하여 기본값 설정

  useEffect(() => {
    const host = process.env.REACT_APP_API_HOST;
    const port = process.env.REACT_APP_API_PORT;
    const serverUrl = `${host}:${port}`

    const newSocket = io(serverUrl);
    setSocket(newSocket);

    navigator.mediaDevices.getUserMedia({ audio: true, video: false }).then(stream => {
      localStreamRef.current.srcObject = stream;

      newSocket.emit('join', { roomId: roomId, userId: userId, name: name });

      newSocket.on('allUsers', async (otherUsers) => {
        console.log(`이벤트: allUsers, 데이터: ${JSON.stringify(otherUsers)}`);
        setUsers(prevUsers => [...prevUsers, ...otherUsers]);

        for (const user of otherUsers) {
          const peerConnection = createPeerConnection(newSocket, user.userId);
          const offer = await peerConnection.createOffer();
          await peerConnection.setLocalDescription(offer);
          newSocket.emit('offer', { sdp: offer, to: user.userId });
        }
      });

      newSocket.on('userJoined', async (data) => {
        console.log(`이벤트: userJoined, 데이터: ${JSON.stringify(data)}`);
        setUsers(prevUsers => [...prevUsers, { userId: data.userId, name: data.name }]); // Changed this line
      });

      newSocket.on('offer', async (data) => {
        console.log(`이벤트: offer, 데이터: ${JSON.stringify(data)}`);
        const { sdp, from } = data;        
        const peerConnection = createPeerConnection(newSocket, from);
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        newSocket.emit('answer', { sdp: answer, to: from });
      });

      newSocket.on('answer', async (data) => {
        console.log(`이벤트: answer, 데이터: ${JSON.stringify(data)}`);
        const { sdp, from } = data;
        const peerConnection = peerConnections.current[from];
        await peerConnection.setRemoteDescription(new RTCSessionDescription(sdp));
      });

      newSocket.on('candidate', async (data) => {
        console.log(`이벤트: candidate, 데이터: ${JSON.stringify(data)}`);
        const { candidate, from } = data;
        const peerConnection = peerConnections.current[from];
        await peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      });

      newSocket.on('userDisconnected', (userId) => {
        console.log(`이벤트: userDisconnected, 유저아이디: ${userId}`);
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

    const init = async () => {
      const data = await fetchUserList(roomId);
      setUserList(data);
      if (userId && name) { // userId와 name이 유효한 경우에만 사용자 추가
        console.log(`users 세팅 userId: ${userId}, name: ${name}`);
        setUsers(prevUsers => [...prevUsers, { userId, name }]);
      }
    };
    init();

    // 컴포넌트 언마운트 시 실행될 로직
    return async () => {
      await leaveChatRoom(userId, roomId);
      newSocket.close();
    };
  }, [roomId, userId]); // roomId와 userId가 변경될 때만 실행

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
      console.log(`peerConnection.ondatachannel event: ${event}`)
      const dataChannel = event.channel;
      dataChannel.onmessage = (event) => {
        console.log(`Data channel message: ${event.data}`);
        const message = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, message]);
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
      setMessages((prevMessages) => [...prevMessages, message]);
    };
    dataChannels.current[userId] = dataChannel;

    return peerConnection;
  };

  const handleSendMessage = () => {
    if (newMessage.trim() !== '') {
      const message = { user: name, text: newMessage };
      setMessages((prevMessages) => [...prevMessages, message]);
      for (const userId in dataChannels.current) {
        const dataChannel = dataChannels.current[userId];
        if (dataChannel.readyState === 'open') {
          dataChannel.send(JSON.stringify(message));
        } else {
          console.error(`Data channel for user ${userId} is not open. Current state: ${dataChannel.readyState}`);
        }
      }
      setNewMessage('');
    }
  };
  
  const handleLeaveRoom = async () => {
    navigate("/");
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
                <button>소리</button>
                <button>마이크</button>
                <button>채팅</button>
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