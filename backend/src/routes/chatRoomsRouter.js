var express = require('express');
var router = express.Router();
var chatRoomController = require('../controllers/chatRoomsController');

router.get('/', chatRoomController.getAllChatRooms);
router.post('/', chatRoomController.createChatRoom);
router.get('/:id', chatRoomController.getChatRoom);
router.put('/:id', chatRoomController.updateChatRoom);
router.delete('/:id', chatRoomController.deleteChatRoom);
router.post('/search', chatRoomController.searchChatRoom);

module.exports = router;