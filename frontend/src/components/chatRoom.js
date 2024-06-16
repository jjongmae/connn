import React , { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import USERS from '../mock/users.json'

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

const deleteUserList = async (userId) => {
  const host = process.env.REACT_APP_API_HOST;
  const port = process.env.REACT_APP_API_PORT;
  const url = `${host}:${port}/users/${userId}`;

  try {
    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (response.ok) {
      console.log(data.message); // 성공 메시지 로그
    } else {
      console.error(data.message); // 실패 메시지 로그
    }
  } catch (error) {
    console.error(`사용자 삭제 실패: ${error}`);
  }
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
    const { roomId, userId } = location.state || {}; // state가 없는 경우를 대비하여 기본값 설정
  
    const handleSendMessage = () => {
      if (newMessage.trim() !== '') {
        setMessages([...messages, { user: 'Me', text: newMessage }]);
        setNewMessage('');
      }
    };
  
    const handleLeaveRoom = async () => {
      // 사용자 목록 삭제 요청
      await deleteUserList(userId); // userId는 현재 사용자의 ID
      // 요청 성공 후 메인 페이지로 이동
      navigate("/");
    };

    //API 호출을 위한 useEffect
    useEffect(() => {
      const init = async () => {
        const data = await fetchUserList(roomId);
        setUserList(data);
      };ㅔ

      init();
    }, []);
  
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
            />
            <button onClick={handleSendMessage}>전송</button>
          </div>
        </div>
      </div>
    );
  }

  export default ChatRoom;