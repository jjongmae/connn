import React , { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import USERS from '../mock/users.json'

const fetchUserList = async () => {
  try {
    const data = USERS;
    return data;
  } catch (error) {
    throw new Error(`유저 목록을 불러오는데 실패했습니다: ${error}`);
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
  
    const handleSendMessage = () => {
      if (newMessage.trim() !== '') {
        setMessages([...messages, { user: 'Me', text: newMessage }]);
        setNewMessage('');
      }
    };
  
    const handleLeaveRoom = () => {
      // 채팅방 나가기 클릭 시 MainPage로 이동
      navigate("/");
    };

    //API 호출을 위한 useEffect
    useEffect(() => {
      const init = async () => {
        const data = await fetchUserList();
        setUserList(data);
      };

      init();
    }, []);
  
    return (
      <div className="chat-room">
        <div className="left">
          <div className="user-list">
            <h2>참여자</h2>
            <ul>
              {userList.map((user) => (
                <div key={user.userIdx}>
                  <li>{user.userName}</li>
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