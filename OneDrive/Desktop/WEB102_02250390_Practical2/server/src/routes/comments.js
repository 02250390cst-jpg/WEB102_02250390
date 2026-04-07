const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');

// GET /api/comments - Get all comments
router.get('/', commentController.getAllComments);

// POST /api/comments - Create new comment
router.post('/', commentController.createComment);

// GET /api/comments/:id - Get comment by ID
router.get('/:id', commentController.getCommentById);

// PUT /api/comments/:id - Update comment
router.put('/:id', commentController.updateComment);

// DELETE /api/comments/:id - Delete comment
router.delete('/:id', commentController.deleteComment);

module.exports = router;
