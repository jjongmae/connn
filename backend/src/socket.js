const socketIo = require('socket.io');

module.exports = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*"
        }
    });

    io.on('connection', (socket) => {
        console.log('새로운 클라이언트가 연결되었습니다:', socket.id);

        socket.on('joinRoom', ({ userId, roomId, name }) => {
            console.log(`${userId} has joined room ${roomId}/${userId}/${name}`);
            socket.join(roomId);
            io.to(roomId).emit('userJoined', { userId, roomId, name }); // 모든 클라이언트에게 전송
        });

        socket.on('leaveRoom', ({ userId, roomId }) => {
            console.log(`${userId} has left room ${roomId}/${userId}`);
            socket.leave(roomId);
            io.to(roomId).emit('userLeft', { userId, roomId }); // 모든 클라이언트에게 전송
        });

        // 클라이언트로부터 offer를 받았을 때
        socket.on('offer', (data) => {
            console.log('Offer 받음:', data);
            socket.to(data.roomId).emit('offer', data);
        });

        // 클라이언트로부터 answer를 받았을 때
        socket.on('answer', (data) => {
            console.log('Answer 받음:', data);
            socket.to(data.roomId).emit('answer', data);
        });

        // 클라이언트로부터 ICE candidate를 받았을 때
        socket.on('candidate', (data) => {
            console.log('Candidate 받음:', data);
            socket.to(data.roomId).emit('candidate', data);
        });

        socket.on('disconnect', () => {
            console.log('클라이언트가 연결을 끊었습니다:', socket.id);
        });
    });

    console.log('Socket.io 서버가 실행되었습니다.');

    return io;
};