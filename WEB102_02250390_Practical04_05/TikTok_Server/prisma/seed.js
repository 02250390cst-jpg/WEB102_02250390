const { PrismaClient } = require('../src/generated/prisma');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

const sampleVideos = [
  'https://hvhkopfpwfgktibhnhub.supabase.co/storage/v1/object/public/videos/Download%20(1).mp4',
  'https://hvhkopfpwfgktibhnhub.supabase.co/storage/v1/object/public/videos/Download.mp4',
  'https://hvhkopfpwfgktibhnhub.supabase.co/storage/v1/object/public/videos/sample-mp4-file.mp4',
  'https://hvhkopfpwfgktibhnhub.supabase.co/storage/v1/object/public/videos/sample_640x360.mp4',
  
];

async function main() {
  console.log('Seeding database...');

  // Clear existing data
  await prisma.follow.deleteMany();
  await prisma.commentLike.deleteMany();
  await prisma.videoLike.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.video.deleteMany();
  await prisma.user.deleteMany();

  // Create 10 users
  const hashedPassword = await bcrypt.hash('password123', 10);
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        username: `user${i}`,
        email: `user${i}@example.com`,
        password: hashedPassword,
        name: `Test User ${i}`,
        bio: `Bio for user ${i}`,
      }
    });
    users.push(user);
  }
  console.log(`Created ${users.length} users`);

  // Create 5 videos per user (50 total)
  const videos = [];
  for (const user of users) {
    for (let v = 1; v <= 5; v++) {
      const video = await prisma.video.create({
        data: {
          userId: user.id,
          caption: `Video ${v} by ${user.username}`,
          audioName: `Song ${v}`,
          videoUrl: sampleVideos[(v - 1) % sampleVideos.length],
          thumbnailUrl: `https://picsum.photos/seed/${user.id}-${v}/336/600`,
        }
      });
      videos.push(video);
    }
  }
  console.log(`Created ${videos.length} videos`);

  // Create 200 comments
  for (let i = 0; i < 200; i++) {
    const user = users[Math.floor(Math.random() * users.length)];
    const video = videos[Math.floor(Math.random() * videos.length)];
    await prisma.comment.create({
      data: {
        content: `Comment ${i + 1} on video`,
        userId: user.id,
        videoId: video.id,
      }
    });
  }
  console.log('Created 200 comments');

  // Create 300 video likes (unique)
  const videoLikePairs = new Set();
  let videoLikes = 0;
  while (videoLikes < 300) {
    const user = users[Math.floor(Math.random() * users.length)];
    const video = videos[Math.floor(Math.random() * videos.length)];
    const key = `${user.id}-${video.id}`;
    if (!videoLikePairs.has(key)) {
      videoLikePairs.add(key);
      await prisma.videoLike.create({ data: { userId: user.id, videoId: video.id } });
      videoLikes++;
    }
  }
  console.log(`Created ${videoLikes} video likes`);

  // Create 40 follow relationships (unique, no self-follow)
  const followPairs = new Set();
  let follows = 0;
  while (follows < 40) {
    const follower = users[Math.floor(Math.random() * users.length)];
    const following = users[Math.floor(Math.random() * users.length)];
    const key = `${follower.id}-${following.id}`;
    if (follower.id !== following.id && !followPairs.has(key)) {
      followPairs.add(key);
      await prisma.follow.create({ data: { followerId: follower.id, followingId: following.id } });
      follows++;
    }
  }
  console.log(`Created ${follows} follow relationships`);

  console.log('Seeding complete!');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());