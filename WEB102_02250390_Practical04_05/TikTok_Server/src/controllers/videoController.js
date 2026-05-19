const prisma = require('../lib/prisma');
const fs = require('fs');
const path = require('path');

// Get all videos
exports.getAllVideos = async (req, res) => {
  try {
    const { cursor, limit = 10 } = req.query;
    const limitNum = parseInt(limit) || 10;
    
    const queryOptions = {
      take: limitNum + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } }
      }
    };
    
    if (cursor) {
      queryOptions.cursor = { id: parseInt(cursor) };
      queryOptions.skip = 1;
    }
    
    const videos = await prisma.video.findMany(queryOptions);
    const hasNextPage = videos.length > limitNum;
    if (hasNextPage) videos.pop();
    
    if (req.user) {
      const userId = req.user.id;
      const videoIds = videos.map(video => video.id);
      const userLikes = await prisma.videoLike.findMany({
        where: { userId: parseInt(userId), videoId: { in: videoIds } }
      });
      videos.forEach(video => {
        video.isLiked = userLikes.some(like => like.videoId === video.id);
      });
    }
    
    const formattedVideos = videos.map(video => ({
      ...video,
      likeCount: video._count.likes,
      commentCount: video._count.comments,
      _count: undefined,
    }));
    
    const nextCursor = hasNextPage ? formattedVideos[formattedVideos.length - 1].id.toString() : null;
    
    res.status(200).json({
      videos: formattedVideos,
      pagination: { nextCursor, hasNextPage },
    });
  } catch (error) {
    console.error('Error getting videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get video by ID
exports.getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ message: 'Invalid video ID' });
    }
    
    const videoId = parseInt(id);
    
    await prisma.video.update({
      where: { id: videoId },
      data: { views: { increment: 1 } }
    });
    
    const video = await prisma.video.findUnique({
      where: { id: videoId },
      include: {
        user: { select: { id: true, username: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } }
      }
    });
    
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    if (req.user) {
      const like = await prisma.videoLike.findUnique({
        where: { userId_videoId: { userId: parseInt(req.user.id), videoId: parseInt(id) } }
      });
      video.isLiked = !!like;
    }
    
    res.status(200).json(video);
  } catch (error) {
    console.error(`Error fetching video ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch video' });
  }
};

exports.getUserVideos = async (req, res) => {
  try {
    const { id } = req.params;
    const userExists = await prisma.user.findUnique({ where: { id: parseInt(id) } });
    if (!userExists) return res.status(404).json({ message: 'User not found' });
    const videos = await prisma.video.findMany({
      where: { userId: parseInt(id) },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } }
      }
    });
    const formattedVideos = videos.map(v => ({ ...v, likeCount: v._count.likes, commentCount: v._count.comments, _count: undefined }));
    res.status(200).json({ videos: formattedVideos, totalVideos: videos.length });
  } catch (error) {
    console.error("Error getting videos for user:", error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get videos for following feed
exports.getFollowingVideos = async (req, res) => {
  try {
    const userId = req.user.id;
    const { cursor, limit = 10 } = req.query;
    const limitNum = parseInt(limit) || 10;
    
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    });
    
    const followingIds = following.map(follow => follow.followingId);
    
    if (followingIds.length === 0) {
      return res.status(200).json({
        videos: [],
        pagination: { nextCursor: null, hasNextPage: false },
      });
    }
    
    const queryOptions = {
      where: { userId: { in: followingIds } },
      take: limitNum + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, username: true, name: true, avatar: true } },
        _count: { select: { likes: true, comments: true } }
      }
    };
    
    if (cursor) {
      queryOptions.cursor = { id: parseInt(cursor) };
      queryOptions.skip = 1;
    }
    
    const videos = await prisma.video.findMany(queryOptions);
    const hasNextPage = videos.length > limitNum;
    if (hasNextPage) videos.pop();
    
    const formattedVideos = videos.map(video => ({
      ...video,
      likeCount: video._count.likes,
      commentCount: video._count.comments,
      _count: undefined,
    }));
    
    const nextCursor = hasNextPage ? formattedVideos[formattedVideos.length - 1].id.toString() : null;
    
    res.status(200).json({
      videos: formattedVideos,
      pagination: { nextCursor, hasNextPage },
    });
  } catch (error) {
    console.error('Error getting following videos:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create video - local storage (no Supabase)
// Create video - Supabase cloud storage
exports.createVideo = async (req, res) => {
  try {
    const { caption, audioName, videoUrl, thumbnailUrl, videoStoragePath, thumbnailStoragePath } = req.body;
    const userId = req.user.id;

    // If the frontend already uploaded directly to Supabase and sent URLs in the body
    if (videoUrl) {
      const newVideo = await prisma.video.create({
        data: {
          userId: parseInt(userId),
          caption,
          audioName,
          videoUrl,
          thumbnailUrl: thumbnailUrl || null,
          videoStoragePath: videoStoragePath || null,
          thumbnailStoragePath: thumbnailStoragePath || null,
        },
        include: {
          user: { select: { id: true, username: true, name: true, avatar: true } }
        }
      });

      return res.status(201).json(newVideo);
    }

    // Fallback: server-side upload via multer (if files sent to server)
    const storageService = require('../services/storageService');

    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    const videoFileName = storageService.generateUniqueFileName(videoFile.originalname);
    const videoPath = `user-${userId}/${videoFileName}`;

    const { fileUrl: uploadedVideoUrl } = await storageService.uploadLocalFile(
      'videos',
      videoFile.path,
      videoPath
    );

    let uploadedThumbnailUrl = null;
    let thumbnailPath = null;

    if (thumbnailFile) {
      const thumbnailFileName = storageService.generateUniqueFileName(thumbnailFile.originalname);
      thumbnailPath = `user-${userId}/${thumbnailFileName}`;
      const { fileUrl } = await storageService.uploadLocalFile(
        'thumbnails',
        thumbnailFile.path,
        thumbnailPath
      );
      uploadedThumbnailUrl = fileUrl;
    }

    const newVideo = await prisma.video.create({
      data: {
        userId: parseInt(userId),
        caption,
        audioName,
        videoUrl: uploadedVideoUrl,
        thumbnailUrl: uploadedThumbnailUrl,
        videoStoragePath: videoPath,
        thumbnailStoragePath: thumbnailPath,
      },
      include: {
        user: { select: { id: true, username: true, name: true, avatar: true } }
      }
    });

    // Clean up local temp files
    const fs = require('fs');
    fs.unlink(videoFile.path, () => {});
    if (thumbnailFile) fs.unlink(thumbnailFile.path, () => {});

    res.status(201).json(newVideo);
  } catch (error) {
    console.error('Error creating video:', error);
    res.status(500).json({ message: 'Failed to create video' });
  }
};
// Update video
exports.updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { caption, audioName } = req.body;
    const userId = req.user.id;
    
    const video = await prisma.video.findUnique({ where: { id: parseInt(id) } });
    
    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.userId !== parseInt(userId)) return res.status(403).json({ message: 'Not authorized to update this video' });
    
    const updatedVideo = await prisma.video.update({
      where: { id: parseInt(id) },
      data: { caption, audioName, updatedAt: new Date() },
      include: { user: { select: { id: true, username: true, name: true, avatar: true } } }
    });
    
    res.status(200).json(updatedVideo);
  } catch (error) {
    console.error(`Error updating video ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to update video' });
  }
};

// Delete video - local storage cleanup
// Delete video - Supabase cloud storage cleanup
exports.deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const video = await prisma.video.findUnique({ where: { id: parseInt(id) } });

    if (!video) return res.status(404).json({ message: 'Video not found' });
    if (video.userId !== parseInt(userId)) return res.status(403).json({ message: 'Not authorized to delete this video' });

    // Delete from Supabase storage
    const supabase = require('../lib/supabase');
    if (supabase) {
      if (video.videoStoragePath) {
        const { error } = await supabase.storage.from('videos').remove([video.videoStoragePath]);
        if (error) console.error('Error deleting video from storage:', error);
      }
      if (video.thumbnailStoragePath) {
        const { error } = await supabase.storage.from('thumbnails').remove([video.thumbnailStoragePath]);
        if (error) console.error('Error deleting thumbnail from storage:', error);
      }
    }

    await prisma.video.delete({ where: { id: parseInt(id) } });

    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error(`Error deleting video ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to delete video' });
  }
};

// Like/unlike video
exports.toggleVideoLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const video = await prisma.video.findUnique({ where: { id: parseInt(id) } });
    if (!video) return res.status(404).json({ message: 'Video not found' });
    
    const existingLike = await prisma.videoLike.findUnique({
      where: { userId_videoId: { userId: parseInt(userId), videoId: parseInt(id) } }
    });
    
    let action;
    
    if (existingLike) {
      await prisma.videoLike.delete({
        where: { userId_videoId: { userId: parseInt(userId), videoId: parseInt(id) } }
      });
      action = 'unliked';
    } else {
      await prisma.videoLike.create({
        data: { userId: parseInt(userId), videoId: parseInt(id) }
      });
      action = 'liked';
    }
    
    const likeCount = await prisma.videoLike.count({ where: { videoId: parseInt(id) } });
    
    res.status(200).json({ message: `Video ${action} successfully`, action, likeCount });
  } catch (error) {
    console.error(`Error toggling like for video ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to toggle like' });
  }
};

// Get video comments
exports.getVideoComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);
    
    const comments = await prisma.comment.findMany({
      where: { videoId: parseInt(id) },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        user: { select: { id: true, username: true, name: true, avatar: true } },
        _count: { select: { likes: true } }
      }
    });
    
    if (req.user) {
      const userId = req.user.id;
      const commentIds = comments.map(comment => comment.id);
      const userLikes = await prisma.commentLike.findMany({
        where: { userId: parseInt(userId), commentId: { in: commentIds } }
      });
      comments.forEach(comment => {
        comment.isLiked = userLikes.some(like => like.commentId === comment.id);
      });
    }
    
    const totalComments = await prisma.comment.count({ where: { videoId: parseInt(id) } });
    
    res.status(200).json({
      comments,
      totalPages: Math.ceil(totalComments / take),
      currentPage: parseInt(page),
      totalComments
    });
  } catch (error) {
    console.error(`Error fetching comments for video ${req.params.id}:`, error);
    res.status(500).json({ message: 'Failed to fetch comments' });
  }
};