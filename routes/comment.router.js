const express = require('express');
const router = express.Router();
const commentController = require('../controllers/comment.controller');

router.post('/', commentController.addComment);
router.get('/:id', commentController.getCommentByID);
router.put('/:id', commentController.updateComment);
router.delete('/:id', commentController.deleteComment);
router.get('/post/:postId', commentController.getCommentsByPostId);

module.exports = router;
