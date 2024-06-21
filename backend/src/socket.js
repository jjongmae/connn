const socketIo = require('socket.io');

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*"
        }
    });

    io.on('connection', (socket) => {
        console.log('새로운 사용자가 연결되었습니다.');

        // 방에 참여하는 이벤트 리스너
        socket.on('join', ({ roomId, userId, name }) => {
            console.log(`이벤트: join, 방아이디: ${roomId}, 유저아이디: ${userId}, 이름: ${name}`);

            // 사용자 정보를 소켓 객체에 저장
            socket.userId = userId;
            socket.name = name;
            socket.roomId = roomId;

            // 소켓을 방에 추가
            socket.join(roomId);

            // 방에 있는 다른 사용자 목록 가져오기
            const otherUsers = Array.from(io.sockets.adapter.rooms.get(roomId) || [])
                .filter(id => id !== socket.id)
                .map(id => {
                    const s = io.sockets.sockets.get(id);
                    return { userId: s.userId, name: s.name };
                });

            // 새로 연결된 사용자에게 다른 사용자 목록 보내기
            socket.emit('allUsers', otherUsers);

            // 방의 다른 사용자들에게 새 사용자 정보 보내기
            socket.to(roomId).emit('userJoined', { userId: userId, name: name });

            // WebRTC offer 이벤트 리스너
            socket.on('offer', (data) => {
                console.log(`이벤트: offer, 데이터: ${JSON.stringify(data)}`);
                const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === data.to);
                if (targetSocket) {
                    socket.to(targetSocket.id).emit('offer', { sdp: data.sdp, from: userId });
                }
            });

            // WebRTC answer 이벤트 리스너
            socket.on('answer', (data) => {
                console.log(`이벤트: answer, 데이터: ${JSON.stringify(data)}`);
                const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === data.to);
                if (targetSocket) {
                    socket.to(targetSocket.id).emit('answer', { sdp: data.sdp, from: userId });
                }
            });

            // ICE 후보 이벤트 리스너
            socket.on('candidate', (data) => {
                console.log(`이벤트: candidate, 데이터: ${JSON.stringify(data)}`);
                const targetSocket = Array.from(io.sockets.sockets.values()).find(s => s.userId === data.to);
                if (targetSocket) {
                    socket.to(targetSocket.id).emit('candidate', { candidate: data.candidate, from: userId });
                }
            });

            // 연결 종료 이벤트 리스너
            socket.on('disconnect', () => {
                const { roomId, userId } = socket;
                socket.leave(roomId);
                socket.to(roomId).emit('userDisconnected', userId);
            });
        });
    });

    console.log('Socket.io 서버가 실행되었습니다.');

    return io;
};
