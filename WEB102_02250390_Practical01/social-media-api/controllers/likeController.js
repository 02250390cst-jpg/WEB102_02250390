const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { likes, posts, users } = require('../utils/mockData');

// @desc    Get all likes
// @route   GET /api/likes
// @access  Public
exports.getLikes = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = likes.length;

  const results = likes.slice(startIndex, endIndex);

  const enhancedResults = results.map((like) => {
    const user = users.find((u) => u.id === like.user_id);
    const post = posts.find((p) => p.id === like.post_id);
    return {
      ...like,
      user: user ? { id: user.id, username: user.username } : null,
      post: post ? { id: post.id, title: post.title } : null
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

// @desc    Get single like by id
// @route   GET /api/likes/:id
// @access  Public
exports.getLike = asyncHandler(async (req, res, next) => {
  const like = likes.find((l) => l.id === req.params.id);
  if (!like) {
    return next(new ErrorResponse(`Like not found with id of ${req.params.id}`, 404));
  }

  const user = users.find((u) => u.id === like.user_id);
  const post = posts.find((p) => p.id === like.post_id);

  res.status(200).json({
    success: true,
    data: {
      ...like,
      user: user ? { id: user.id, username: user.username } : null,
      post: post ? { id: post.id, title: post.title } : null
    }
  });
});

// @desc    Create new like
// @route   POST /api/likes
// @access  Private (simulated via X-User-Id)
exports.createLike = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const { post_id } = req.body;
  if (!post_id) {
    return next(new ErrorResponse('Please provide post_id', 400));
  }

  const post = posts.find((p) => p.id === post_id);
  if (!post) {
    return next(new ErrorResponse('Post not found for provided post_id', 404));
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const existing = likes.find((l) => l.post_id === post_id && l.user_id === userId);
  if (existing) {
    return next(new ErrorResponse('Already liked', 400));
  }

  const newLike = {
    id: (likes.length + 1).toString(),
    post_id,
    user_id: userId,
    created_at: new Date().toISOString().slice(0, 10)
  };

  likes.push(newLike);

  res.status(201).json({
    success: true,
    data: newLike
  });
});

// @desc    Delete like by id
// @route   DELETE /api/likes/:id
// @access  Private (simulated via X-User-Id)
exports.deleteLike = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const index = likes.findIndex((l) => l.id === req.params.id);
  if (index === -1) {
    return next(new ErrorResponse(`Like not found with id of ${req.params.id}`, 404));
  }

  if (likes[index].user_id !== userId) {
    return next(new ErrorResponse('Not authorized to delete this like', 403));
  }

  likes.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});
