const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { comments, users, posts } = require('../utils/mockData');

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
    const post = posts.find((p) => p.id === comment.post_id);

    return {
      ...comment,
      user: user
        ? {
            id: user.id,
            username: user.username,
            full_name: user.full_name,
            profile_picture: user.profile_picture
          }
        : null,
      post: post
        ? {
            id: post.id,
            caption: post.caption,
            image: post.image
          }
        : null
    };
  });

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
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

// @desc    Get single comment
// @route   GET /api/comments/:id
// @access  Public
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = comments.find((c) => c.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  const user = users.find((u) => u.id === comment.user_id);
  const post = posts.find((p) => p.id === comment.post_id);

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
        : null,
      post: post
        ? {
            id: post.id,
            caption: post.caption,
            image: post.image
          }
        : null
    }
  });
});

// @desc    Create new comment
// @route   POST /api/comments
// @access  Private (simulated)
exports.createComment = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const postId = req.body.post_id;
  const text = req.body.text;

  if (!postId || !text) {
    return next(new ErrorResponse('post_id and text are required', 400));
  }

  const post = posts.find((p) => p.id === postId);
  if (!post) {
    return next(new ErrorResponse('Post not found', 404));
  }

  const newComment = {
    id: (comments.length + 1).toString(),
    text,
    user_id: userId,
    post_id: postId,
    created_at: new Date().toISOString().slice(0, 10)
  };

  comments.push(newComment);

  res.status(201).json({
    success: true,
    data: newComment
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (simulated)
exports.updateComment = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const comment = comments.find((c) => c.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  if (comment.user_id !== userId) {
    return next(new ErrorResponse('Not authorized to update this comment', 401));
  }

  const index = comments.findIndex((c) => c.id === req.params.id);
  comments[index] = {
    ...comment,
    ...req.body,
    id: comment.id,
    user_id: comment.user_id,
    post_id: comment.post_id
  };

  res.status(200).json({
    success: true,
    data: comments[index]
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (simulated)
exports.deleteComment = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');
  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const comment = comments.find((c) => c.id === req.params.id);

  if (!comment) {
    return next(
      new ErrorResponse(`Comment not found with id of ${req.params.id}`, 404)
    );
  }

  if (comment.user_id !== userId) {
    return next(new ErrorResponse('Not authorized to delete this comment', 401));
  }

  const index = comments.findIndex((c) => c.id === req.params.id);
  comments.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});