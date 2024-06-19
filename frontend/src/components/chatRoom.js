import React , { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import USERS from '../mock/users.json'
import io from 'socket.io-client';

let socket;
let peerConnections = {};

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

const getUserNameById = (userList, userId) => {
  const user = userList.find(user => user.userId === userId);
  return user ? user.name : '알 수 없는 사용자';
};

const ChatRoom = () => {
    //사용자 목록
    const [userList, setUserList] = useState([]);
  
    // 채팅 메시지 목록
    const [messages, setMessages] = useState([]);
  
    // 입력한 채팅 메시지
    const [newMessage, setNewMessage] = useState('');
  
    const navigate = useNavigate();
    const location = useLocation();
    const { roomId, userId, name } = location.state || {}; // state가 없는 경우를 대비하여 기본값 설정

    const setupPeerConnection = async (peerUserId) => {
      const peerConnection = new RTCPeerConnection();
      peerConnections[peerUserId] = peerConnection; // 여기로 이동

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));
  
      peerConnection.onicecandidate = event => {
        if (event.candidate) {
          socket.emit('candidate', { from: userId, to: peerUserId, candidate: event.candidate, roomId: roomId });
        }
      };
  
      peerConnection.ontrack = event => {
        // 여기서 받은 트랙을 재생할 수 있습니다.
        const remoteAudio = document.getElementById('remoteAudio'); // HTML에서 오디오 태그의 ID
        if (remoteAudio.srcObject !== event.streams[0]) {
          remoteAudio.srcObject = event.streams[0]; // 수신된 스트림을 오디오 태그의 소스로 설정
          console.log('오디오 트랙이 추가되었습니다:', event.streams[0]);
        }
      };

      // 데이터 채널 설정
      await setupDataChannel(peerConnection, peerUserId);
  
      return peerConnection;
    };

    const setupDataChannel = async (peerConnection, peerUserId) => {
      const dataChannel = peerConnection.createDataChannel("chat");
    
      dataChannel.onopen = () => {
        console.log("Data channel is open and ready to be used.");
      };
    
      dataChannel.onmessage = event => {        
        const data = JSON.parse(event.data);
        const userName = getUserNameById(userList, data.userId);
        setMessages(prevMessages => [...prevMessages, { user: userName, text: data.message }]);
      };
    
      peerConnections[peerUserId].dataChannel = dataChannel;
    };

    const handleNewPeer = async (data) => {
      const { peerUserId } = data;
      const peerConnection = await setupPeerConnection(peerUserId);
  
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      socket.emit('offer', { to: peerUserId, offer: offer, roomId: roomId });
    };
  
    const handleSendMessage = () => {
      if (newMessage.trim() !== '') {
        Object.values(peerConnections).forEach(pc => {
          if (pc.dataChannel && pc.dataChannel.readyState === "open") {
            pc.dataChannel.send(JSON.stringify({ userId, message: newMessage }));
          }
        });
        setMessages([...messages, { user: name, text: newMessage }]);
        setNewMessage('');
      }
    };
  
    const handleLeaveRoom = async () => {      
      // 요청 성공 후 메인 페이지로 이동
      navigate("/");
    };

    //API 호출을 위한 useEffect
    useEffect(() => {
      // 환경 변수에서 호스트와 포트 정보 가져오기
      const host = process.env.REACT_APP_API_HOST;
      const port = process.env.REACT_APP_API_PORT;
      const serverUrl = `${host}:${port}`

      // WebSocket 연결 초기화
      socket = io(serverUrl, { secure: true });
      socket.emit('joinRoom', { userId, roomId, name: name }); // 사용자의 이름을 서버로 전송

      socket.on('userJoined', (data) => {
        if (data.roomId === roomId && data.userId !== userId) { // roomId 확인 및 자기 자신 제외
          console.log(`${data.userId}가 채팅방에 입장했습니다.`);
          handleNewPeer(data);

          // 새로운 유저 정보를 기존 목록에 추가
          setUserList(prevUserList => [...prevUserList, { userId: data.userId, name: data.name }]);
        }
      });

      socket.on('userLeft', (data) => {
        if (data.roomId === roomId) { // roomId 확인
          console.log(`${data.userId}가 채팅방에서 나갔습니다.`);
          const peerUserId = data.userId;
          if (peerConnections[peerUserId]) {
            peerConnections[peerUserId].close(); // 해당 사용자와의 연결 종료
            delete peerConnections[peerUserId]; // 연결 객체 삭제
          }
          // userList에서 해당 사용자 삭제
          setUserList(prevUserList => prevUserList.filter(user => user.userId !== peerUserId));
        }
      });

      socket.on('offer', async data => {
        if (data.roomId === roomId) { // roomId 확인
          const peerConnection = await setupPeerConnection(data.from);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.offer));
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          socket.emit('answer', { to: data.from, answer: answer, roomId: roomId });
        }
      });
  
      socket.on('answer', data => {
        if (data.roomId === roomId) { // roomId 확인
          const peerConnection = peerConnections[data.from];
          peerConnection.setRemoteDescription(new RTCSessionDescription(data.answer));
        }
      });
  
      socket.on('candidate', data => {
        if (data.roomId === roomId && data.from && peerConnections[data.from]) {
          const peerConnection = peerConnections[data.from];
          peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
        } else {
          console.error('candidate 정보가 올바르지 않습니다:', data);
        }
      });

      // 기존 유저 목록 가져오기 로직
      const init = async () => {
        const data = await fetchUserList(roomId);
        setUserList(data);
      };
      init();

      // 컴포넌트 언마운트 시 실행될 로직
      return async () => {
        // 사용자 목록 삭제 요청
        await leaveChatRoom(userId, roomId); // userId와 roomId를 전송
        Object.values(peerConnections).forEach(pc => pc.close());
        socket.emit('leaveRoom', { userId, roomId });
        socket.disconnect();
      };
    }, [roomId, userId]); // roomId와 userId가 변경될 때만 실행

    return (
      <div className="chat-room">
        <div className="left">
          <div className="user-list">
            <h2>참여자</h2>
            <ul>
              {userList.map((user) => (
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
        <audio id="remoteAudio" style={{ display: 'none' }}></audio>
      </div>
    );
  }

  export default ChatRoom;