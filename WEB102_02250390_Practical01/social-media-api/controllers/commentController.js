const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { comments, posts, users } = require('../utils/mockData');

// @desc    Get all comments
// @route   GET /api/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = comments.length;

  const results = comments.slice(startIndex, endIndex);

  const enhancedResults = results.map((comment) => {
    const user = users.find((u) => u.id === comment.user_id);
    return {
      ...comment,
      user: user
        ? {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            profile_picture: user.profile_picture
          }
        : null
    };
  });

  const pagination = {};
  if (endIndex < total) {
    pagination.next = { page: page + 1, limit };
  }
  if (startIndex > 0) {
    pagination.prev = { page: page - 1, limit };
  }

  res.status(200).json({
    success: true,
    count: enhancedResults.length,
    page,
    total_pages: Math.ceil(total / limit),
    pagination,
    data: enhancedResults
  });
});

// @desc    Get single comment by id
// @route   GET /api/comments/:id
// @access  Public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = comments.find((c) => c.id === req.params.id);
  if (!comment) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
  }

  const user = users.find((u) => u.id === comment.user_id);

  res.status(200).json({
    success: true,
    data: {
      ...comment,
      user: user
        ? {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            profile_picture: user.profile_picture
          }
        : null
    }
  });
});

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private (simulated via X-User-Id)
exports.createComment = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const { post_id, body } = req.body;
  if (!post_id || !body) {
    return next(new ErrorResponse('Please provide post_id and body', 400));
  }

  const post = posts.find((p) => p.id === post_id);
  if (!post) {
    return next(new ErrorResponse('Post not found for provided post_id', 404));
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const newComment = {
    id: (comments.length + 1).toString(),
    post_id,
    user_id: userId,
    body,
    created_at: new Date().toISOString().slice(0, 10)
  };

  comments.push(newComment);

  res.status(201).json({
    success: true,
    data: newComment
  });
});

// @desc    Update comment by id
// @route   PUT /api/comments/:id
// @access  Private (simulated via X-User-Id)
exports.updateComment = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const index = comments.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
  }

  if (comments[index].user_id !== userId) {
    return next(new ErrorResponse('Not authorized to update this comment', 403));
  }

  comments[index] = {
    ...comments[index],
    ...req.body,
    id: comments[index].id,
    user_id: comments[index].user_id,
    post_id: comments[index].post_id
  };

  res.status(200).json({
    success: true,
    data: comments[index]
  });
});

// @desc    Delete comment by id
// @route   DELETE /api/comments/:id
// @access  Private (simulated via X-User-Id)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const index = comments.findIndex((c) => c.id === req.params.id);
  if (index === -1) {
    return next(new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404));
  }

  if (comments[index].user_id !== userId) {
    return next(new ErrorResponse('Not authorized to delete this comment', 403));
  }

  comments.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});
