const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const db = require('./database/db')

let io;
const roomMaxUsers = {}; // 방의 최대 인원 정보를 저장할 객체

module.exports = (server) => {
    io = socketIo(server, {
        cors: {
            origin: "*"
        }
    });

    io.on('connection', (socket) => {
        console.log('새로운 사용자가 연결되었습니다.');

        // 연결 종료 이벤트 리스너 (방에 참여하지 않은 상태)
        socket.on('disconnect', () => {
            console.log('방에 참여하지 않은 사용자가 연결을 끊었습니다.');
        });

        // 방에 참여하는 이벤트 리스너
        socket.on('join', async ({ roomId, name, auth }) => {
            console.log(`[join] roomId: ${roomId}, name: ${name}, auth: ${auth}`);

            // 방의 최대 인원 확인
            if (!roomMaxUsers[roomId]) {
                const [room] = await db.query('SELECT total_members FROM chat_rooms WHERE room_id = ?', [roomId]);
                if (!room || room.length === 0) {
                    socket.emit('error', { message: '방을 찾을 수 없습니다.' });
                    return;
                }
                roomMaxUsers[roomId] = room[0].total_members;
            }

            const maxUsers = roomMaxUsers[roomId];
            const currentRoom = io.sockets.adapter.rooms.get(roomId);
            const currentRoomSize = currentRoom ? currentRoom.size : 0;

            if (currentRoomSize >= maxUsers) {
                socket.emit('roomFull', { message: '방의 최대 인원을 초과했습니다.' });
                return;
            }

            // 사용자 아이디 할당
            const userId = uuidv4();
            socket.emit('userId', userId);

            // 사용자 정보를 소켓 객체에 저장
            socket.roomId = roomId;
            socket.name = name;
            socket.auth = auth;
            socket.userId = userId;

            // 소켓을 방에 추가
            socket.join(roomId);

            // 방에 있는 다른 사용자 목록 가져오기
            const otherUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
                .filter(id => id !== socket.id)
                .map(id => {
                    const s = io.sockets.sockets.get(id);
                    return { userId: s.userId, name: s.name, auth: s.auth };
            });

            // 새로 연결된 사용자에게 다른 사용자 목록 보내기
            socket.emit('allUsers', otherUsers);

            // 방의 다른 사용자들에게 새 사용자 정보 보내기
            socket.to(roomId).emit('userJoined', { userId: userId, name: name, auth: auth });

            // WebRTC offer 이벤트 리스너
            socket.on('offer', (data) => {
                console.log(`[offer] 데이터: ${JSON.stringify(data)}`);
                const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === data.to);
                if (targetSocket) {
                    socket.to(targetSocket.id).emit('offer', { sdp: data.sdp, from: userId });
                }
            });

            // WebRTC answer 이벤트 리스너
            socket.on('answer', (data) => {
                console.log(`[answer] 데이터: ${JSON.stringify(data)}`);
                const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === data.to);
                if (targetSocket) {
                    socket.to(targetSocket.id).emit('answer', { sdp: data.sdp, from: userId });
                }
            });

            // ICE 후보 이벤트 리스너
            socket.on('candidate', (data) => {
                console.log(`[candidate] 데이터: ${JSON.stringify(data)}`);
                const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === data.to);
                if (targetSocket) {
                    socket.to(targetSocket.id).emit('candidate', { candidate: data.candidate, from: userId });
                }
            });

            // 연결 종료 이벤트 리스너 (방에 참여한 상태)
            socket.on('disconnect', async () => {
                const { roomId, userId } = socket;
                console.log(`[disconnect] roomId:${roomId}, userId: ${userId}`);
                socket.leave(roomId);
                socket.to(roomId).emit('userDisconnected', userId);

                // 방에 남아있는 소켓이 있는지 확인
                const remainingSockets = io.sockets.adapter.rooms.get(roomId);
                if (!remainingSockets || remainingSockets.size === 0) {
                    // DB에서 채팅방 삭제
                    try {
                        await deleteChatRoomFromDB(roomId);
                    } catch (error) {
                        console.error(`roomId: ${roomId} 채팅방 삭제 중 오류 발생:`, error);
                    }
                }
            });
        });
    });

    console.log('Socket.io 서버가 실행되었습니다.');

    return io;
};

// 방의 소켓 정보를 가져오는 함수
module.exports.getRoomUsers = (roomId) => {
    if (!io) {
        throw new Error('Socket.io 서버가 초기화되지 않았습니다.');
    }
    const socketsInRoom = Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(id => {
        const s = io.sockets.sockets.get(id);
        return { roomId: roomId, userId: s.userId, name: s.name, auth: s.auth };
    });
    return socketsInRoom;
};

// DB에서 채팅방을 삭제하는 함수
async function deleteChatRoomFromDB(roomId) {
    try {
        const [result, ] = await db.query('DELETE FROM chat_rooms WHERE room_id = ?', [roomId]);
        if (result.affectedRows > 0) {
            console.log(`roomId: ${roomId} 채팅방이 삭제되었습니다.`);
        } else {
            console.log(`roomId: ${roomId} 채팅방을 찾을 수 없습니다.`);
        }
    } catch (err) {
        console.error(`deleteChatRoomFromDB 에러: ${err.message}`);
        throw err;
    }
}