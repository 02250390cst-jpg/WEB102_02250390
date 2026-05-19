// In-memory data store (mock database)
const dataStore = {
  // Auto-increment counters for new records
  nextIds: {
    users: 3,
    videos: 5,
    comments: 4
  },

  // Seed users used by the API during development
  users: [
    {
      id: 1,
      username: 'john_doe',
      email: 'john@example.com',
      name: 'John Doe',
      followers: [2],
      following: [2],
      createdAt: new Date('2024-01-15').toISOString()
    },
    {
      id: 2,
      username: 'jane_smith',
      email: 'jane@example.com',
      name: 'Jane Smith',
      followers: [1],
      following: [1],
      createdAt: new Date('2024-01-20').toISOString()
    }
  ],

  // Seed videos used by the API during development
  videos: [
    {
      id: 1,
      title: 'My First Video',
      description: 'This is my first video on the platform',
      url: 'https://example.com/video1.mp4',
      userId: 1,
      likes: [2],
      createdAt: new Date('2024-02-01').toISOString()
    },
    {
      id: 2,
      title: 'Funny Videos',
      description: 'Collection of funny moments',
      url: 'https://example.com/video2.mp4',
      userId: 2,
      likes: [1],
      createdAt: new Date('2024-02-05').toISOString()
    },
    {
      id: 3,
      title: 'Daily Vlog',
      description: 'My daily life vlog',
      url: 'https://example.com/video3.mp4',
      userId: 1,
      likes: [],
      createdAt: new Date('2024-02-10').toISOString()
    },
    {
      id: 4,
      title: 'Tutorial: Web Development',
      description: 'Learn web development basics',
      url: 'https://example.com/video4.mp4',
      userId: 2,
      likes: [1],
      createdAt: new Date('2024-02-15').toISOString()
    }
  ],

  // Seed comments linked to the sample videos and users
  comments: [
    {
      id: 1,
      videoId: 1,
      userId: 2,
      comment: 'Great video! Keep it up.',
      createdAt: new Date('2024-02-02').toISOString()
    },
    {
      id: 2,
      videoId: 2,
      userId: 1,
      comment: 'This made me laugh so hard!',
      createdAt: new Date('2024-02-06').toISOString()
    },
    {
      id: 3,
      videoId: 4,
      userId: 1,
      comment: 'Very helpful tutorial, thanks!',
      createdAt: new Date('2024-02-16').toISOString()
    }
  ]
};

// Export the shared mock database object
module.exports = dataStore;
