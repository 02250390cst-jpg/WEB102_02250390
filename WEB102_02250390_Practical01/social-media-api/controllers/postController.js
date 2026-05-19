const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/async');
const { posts, users } = require('../utils/mockData');

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
exports.getPosts = asyncHandler(async (req, res, next) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = posts.length;

  const results = posts.slice(startIndex, endIndex);

  // Enhance posts with author details
  const enhancedResults = results.map((post) => {
    const user = users.find((u) => u.id === post.user_id);
    return {
      ...post,
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

// @desc    Get single post by id
// @route   GET /api/posts/:id
// @access  Public
exports.getPost = asyncHandler(async (req, res, next) => {
  const post = posts.find((p) => p.id === req.params.id);
  if (!post) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  const user = users.find((u) => u.id === post.user_id);

  res.status(200).json({
    success: true,
    data: {
      ...post,
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

// @desc    Create new post
// @route   POST /api/posts
// @access  Private (simulated via `X-User-Id` header)
exports.createPost = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');

  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const user = users.find((u) => u.id === userId);
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const { title, body } = req.body;
  if (!title || !body) {
    return next(new ErrorResponse('Please provide title and body', 400));
  }

  const newPost = {
    id: (posts.length + 1).toString(),
    user_id: userId,
    title,
    body,
    created_at: new Date().toISOString().slice(0, 10)
  };

  posts.push(newPost);

  res.status(201).json({
    success: true,
    data: newPost
  });
});

// @desc    Update post by id
// @route   PUT /api/posts/:id
// @access  Private (simulated via `X-User-Id` header)
exports.updatePost = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');

  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const index = posts.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  if (posts[index].user_id !== userId) {
    return next(new ErrorResponse('Not authorized to update this post', 403));
  }

  const updatedPost = {
    ...posts[index],
    ...req.body,
    id: posts[index].id,
    user_id: posts[index].user_id
  };

  posts[index] = updatedPost;

  res.status(200).json({
    success: true,
    data: updatedPost
  });
});

// @desc    Delete post by id
// @route   DELETE /api/posts/:id
// @access  Private (simulated via `X-User-Id` header)
exports.deletePost = asyncHandler(async (req, res, next) => {
  const userId = req.header('X-User-Id');

  if (!userId) {
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  const index = posts.findIndex((p) => p.id === req.params.id);
  if (index === -1) {
    return next(new ErrorResponse(`Post not found with id of ${req.params.id}`, 404));
  }

  if (posts[index].user_id !== userId) {
    return next(new ErrorResponse('Not authorized to delete this post', 403));
  }

  posts.splice(index, 1);

  res.status(200).json({
    success: true,
    data: {}
  });
});
