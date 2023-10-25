const { User } = require("../models/User");
const { Forum } = require("../models/Forum");
const { School } = require("../models/School");
const { Thread } = require("../models/Thread");
const mongoose = require("mongoose");
const { Message } = require("../models/Message");

const generateUniqueId = async (model) => {
  // Keep generating random ids until it doesn't exist in the collection
  while (1) {
    const id = new mongoose.Types.ObjectId();
    if (!(await model.exists({ _id: id }))) {
      return id;
    }
  }
};

const createTestUsers = async () => {
  const regularUser = await User.create({
    username: "test",
    email: "test@test.com",
    password: "testtest",
    bio: "testbio",
    admin: false,
  });

  const adminUser = await User.create({
    username: "admin",
    email: "admin@admin.com",
    password: "adminadmin",
    bio: "adminbio",
    admin: true,
  });

  return { regularUser, adminUser };
};

const loginAsTestUser = async (client, asAdmin = false) => {
  await client.post("/api/auth/login").send({
    credential: asAdmin ? "admin" : "test",
    password: asAdmin ? "adminadmin" : "testtest",
  });
};

const createTestSchools = async () => {
  const school1 = await School.create({ name: "SCH1", fullName: "School 1" });
  const school2 = await School.create({ name: "SCH2", fullName: "School 2" });

  return { school1, school2 };
};

const createTestForums = async (school1, school2) => {
  if (!school1 && !school2) {
    ({ school1, school2 } = await createTestSchools());
  }

  const forum1 = await Forum.create({
    name: "TT0001",
    description: "Test 1",
    school: school1._id,
  });

  const forum2 = await Forum.create({
    name: "TT0002",
    description: "Test 2",
    school: school2._id,
  });

  const forum3 = await Forum.create({
    name: "TT0003",
    description: "Test 3",
    school: school1._id,
  });

  return { forum1, forum2, forum3 };
};

const createTestThreads = async (regularUser, adminUser, forum1, forum2) => {
  if (!regularUser && !adminUser) {
    ({ regularUser, adminUser } = await createTestUsers());
  }

  if (!forum1 && !forum2) {
    ({ forum1, forum2 } = await createTestForums());
  }

  const thread1 = await Thread.create({
    forum: forum1._id,
    title: "Thread1 Title",
    content: "Thread1 Content",
    author: regularUser._id,
  });

  const thread2 = await Thread.create({
    forum: forum2._id,
    title: "Thread1 Title",
    content: "Thread1 Content",
    author: adminUser._id,
  });

  return { thread1, thread2 };
};

const createTestMessages = async (
  regularUser,
  adminUser,
  thread1,
  thread2,
  forum1,
  forum2
) => {
  if (!regularUser && !adminUser) {
    ({ regularUser, adminUser } = await createTestUsers());
  }

  if (!thread1 && !thread2) {
    ({ thread1, thread2 } = await createTestThreads(
      regularUser,
      adminUser,
      forum1,
      forum2
    ));
  }

  const message1 = await Message.create({
    thread: thread1._id,
    author: regularUser._id,
    content: "message1 content",
  });
  const message2 = await Message.create({
    thread: thread2._id,
    author: adminUser._id,
    content: "message2 content",
  });

  await thread1.addMessage(message1._id);
  await thread2.addMessage(message2._id);

  return { message1, message2 };
};

const mapObjectIdToString = (arr) => arr.map((id) => id.toString());

module.exports = {
  createTestUsers,
  loginAsTestUser,
  createTestSchools,
  createTestForums,
  createTestThreads,
  generateUniqueId,
  mapObjectIdToString,
  createTestMessages,
};
