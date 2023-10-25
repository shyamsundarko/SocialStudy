const setupTest = require("./setupTest");
const {
  createTestUsers,
  loginAsTestUser,
  createTestThreads,
  mapObjectIdToString,
  generateUniqueId,
  createTestMessages,
} = require("./util");
const { Message } = require("../models/Message");
const { Thread } = require("../models/Thread");
const getClient = setupTest();

let client;
let regularUser, adminUser;
let thread1, thread2;

beforeEach(async () => {
  ({ regularUser, adminUser } = await createTestUsers());
  ({ thread1, thread2 } = await createTestThreads(regularUser, adminUser));
  client = getClient();
});

describe("POST /api/messages/", () => {
  test("Should create a new message if user is authenticated and thread exists", async () => {
    await loginAsTestUser(client);
    const data = {
      thread: thread1._id,
      content: "test message",
    };

    const res = await client.post(`/api/messages/`).send(data);
    expect(res.status).toBe(200);

    const message = await Message.findById(res.body._id);
    expect(message.author).toEqual(regularUser._id);
    expect(message.content).toEqual(data.content);
    expect(message.thread).toEqual(data.thread);

    const thread = await Thread.findById(thread1._id);
    expect(mapObjectIdToString(thread.messages)).toContainEqual(
      res.body._id.toString()
    );
  });

  test("Should not create a new message if user is unauthenticated", async () => {
    const data = {
      thread: thread1._id,
      content: "test message",
    };

    const res = await client.post(`/api/messages/`).send(data);
    expect(res.status).toBe(401);

    const messages = await Message.find({ thread: data.thread });
    expect(messages).toHaveLength(0);

    const thread = await Thread.findById(thread1._id);
    expect(mapObjectIdToString(thread.messages)).toHaveLength(0);
  });

  test("Should not create a new message if content is an empty string", async () => {
    await loginAsTestUser(client);
    const data = {
      thread: thread1._id,
      content: "",
    };

    const res = await client.post(`/api/messages/`).send(data);
    expect(res.status).toBe(400);

    const messages = await Message.find({ thread: data.thread });
    expect(messages).toHaveLength(0);

    const thread = await Thread.findById(thread1._id);
    expect(mapObjectIdToString(thread.messages)).toHaveLength(0);
  });

  test("Should not create a new message if content is not provided", async () => {
    await loginAsTestUser(client);
    const data = {
      thread: thread1._id,
    };

    const res = await client.post(`/api/messages/`).send(data);
    expect(res.status).toBe(400);

    const messages = await Message.find({ thread: data.thread });
    expect(messages).toHaveLength(0);

    const thread = await Thread.findById(thread1._id);
    expect(mapObjectIdToString(thread.messages)).toHaveLength(0);
  });

  test("Should not create a new message if thread not found", async () => {
    await loginAsTestUser(client);

    const threadId = await generateUniqueId(Thread);
    const data = {
      thread: threadId,
      content: "test message",
    };

    const res = await client.post(`/api/messages/`).send(data);
    expect(res.status).toBe(400);

    const messages = await Message.find({ thread: data.thread });
    expect(messages).toHaveLength(0);
  });

  test("Should not create a new message if thread id is invalid", async () => {
    await loginAsTestUser(client);
    const data = {
      thread: "1",
      content: "test message",
    };

    const res = await client.post(`/api/messages/`).send(data);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/messages/:messageId/upvote", () => {
  let message1, message2;

  beforeEach(async () => {
    ({ message1, message2 } = await createTestMessages(
      regularUser,
      adminUser,
      thread1,
      thread2
    ));
  });

  test("Should upvote message if user is authenticated and message exists", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/messages/${message1._id}/upvote`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.upvotes).toHaveLength(1);
    expect(mapObjectIdToString(message.upvotes)).toContain(
      regularUser._id.toString()
    );
  });

  test("Should upvote message and remove downvote if user has downvoted before", async () => {
    await loginAsTestUser(client);

    // User has downvoted before
    await message1.downvote(regularUser._id);

    const res = await client.post(`/api/messages/${message1._id}/upvote`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.upvotes).toHaveLength(1);
    expect(mapObjectIdToString(message.upvotes)).toContain(
      regularUser._id.toString()
    );

    // Make sure that the user's downvote is removed
    expect(message.downvotes).toHaveLength(0);
  });

  test("Should not re-upvote message if user has upvoted the same message before", async () => {
    await loginAsTestUser(client);

    // User has upvoted before
    await message1.upvote(regularUser._id);

    const res = await client.post(`/api/messages/${message1._id}/upvote`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.upvotes).toHaveLength(1);
    expect(mapObjectIdToString(message.upvotes)).toContain(
      regularUser._id.toString()
    );
  });

  test("Should not upvote message when user is unauthenticated", async () => {
    const res = await client.post(`/api/messages/${message1._id}/upvote`);
    expect(res.status).toBe(401);

    const message = await Message.findById(message1._id);
    expect(message.upvotes).toHaveLength(0);
  });

  test("Should not upvote message if message id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/messages/1/upvote`);
    expect(res.status).toBe(400);
  });

  test("Should not upvote message if message not found", async () => {
    await loginAsTestUser(client);

    const messageId = await generateUniqueId(Message);

    const res = await client.post(`/api/messages/${messageId}/upvote`);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/messages/:messageId/downvote", () => {
  let message1, message2;

  beforeEach(async () => {
    ({ message1, message2 } = await createTestMessages(
      regularUser,
      adminUser,
      thread1,
      thread2
    ));
  });

  test("Should downvote message if user is authenticated and message exists", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/messages/${message1._id}/downvote`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.downvotes).toHaveLength(1);
    expect(mapObjectIdToString(message.downvotes)).toContain(
      regularUser._id.toString()
    );
  });

  test("Should downvote message and remove upvote if user has upvoted before", async () => {
    await loginAsTestUser(client);

    // User has upvoted before
    await message1.upvote(regularUser._id);

    const res = await client.post(`/api/messages/${message1._id}/downvote`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.downvotes).toHaveLength(1);
    expect(mapObjectIdToString(message.downvotes)).toContain(
      regularUser._id.toString()
    );

    // Make sure that the user's upvotes is removed
    expect(message.upvotes).toHaveLength(0);
  });

  test("Should not re-downvote message if user has downvoted the same message before", async () => {
    await loginAsTestUser(client);

    // User has downvoted before
    await message1.downvote(regularUser._id);

    const res = await client.post(`/api/messages/${message1._id}/downvote`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.downvotes).toHaveLength(1);
    expect(mapObjectIdToString(message.downvotes)).toContain(
      regularUser._id.toString()
    );
  });

  test("Should not downvote message when user is unauthenticated", async () => {
    const res = await client.post(`/api/messages/${message1._id}/downvote`);
    expect(res.status).toBe(401);

    const message = await Message.findById(message1._id);
    expect(message.downvotes).toHaveLength(0);
  });

  test("Should not downvote message if message id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/messages/1/downvote`);
    expect(res.status).toBe(400);
  });

  test("Should not downvote message if message not found", async () => {
    await loginAsTestUser(client);

    const messageId = await generateUniqueId(Message);

    const res = await client.post(`/api/messages/${messageId}/downvote`);
    expect(res.status).toBe(404);
  });
});

describe("POST /api/messages/:messageId/clear-upvote", () => {
  let message1, message2;

  beforeEach(async () => {
    ({ message1, message2 } = await createTestMessages(
      regularUser,
      adminUser,
      thread1,
      thread2
    ));
  });

  test("Should clear upvote if user is authenticated and has upvoted message before", async () => {
    await loginAsTestUser(client);
    await message1.upvote(regularUser._id);

    const res = await client.post(`/api/messages/${message1._id}/clear-upvote`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.upvotes).toHaveLength(0);
  });

  test("Should not clear upvote if user has not upvoted thread before", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/messages/${message1._id}/clear-upvote`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.upvotes).toHaveLength(0);
  });

  test("Should not clear upvote if user is unauthenticated", async () => {
    await message1.upvote(regularUser._id);

    const res = await client.post(`/api/messages/${message1._id}/clear-upvote`);
    expect(res.status).toBe(401);

    const message = await Message.findById(message1._id);
    expect(message.upvotes).toHaveLength(1);
    expect(mapObjectIdToString(message.upvotes)).toContainEqual(
      regularUser._id.toString()
    );
  });

  test("Should not clear upvote if thread not found", async () => {
    await loginAsTestUser(client);

    const messageId = await generateUniqueId(Message);

    const res = await client.post(`/api/messages/${messageId}/clear-upvote`);
    expect(res.status).toBe(404);
  });

  test("Should not clear upvote if thread id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/messages/1/clear-upvote`);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/messages/:messageId/clear-downvote", () => {
  let message1, message2;

  beforeEach(async () => {
    ({ message1, message2 } = await createTestMessages(
      regularUser,
      adminUser,
      thread1,
      thread2
    ));
  });

  test("Should clear downvote if user is authenticated and has downvoted message before", async () => {
    await loginAsTestUser(client);
    await message1.downvote(regularUser._id);

    const res = await client.post(
      `/api/messages/${message1._id}/clear-downvote`
    );
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.downvotes).toHaveLength(0);
  });

  test("Should not clear downvote if user has not downvoted thread before", async () => {
    await loginAsTestUser(client);

    const res = await client.post(
      `/api/messages/${message1._id}/clear-downvote`
    );
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.downvotes).toHaveLength(0);
  });

  test("Should not clear downvote if user is unauthenticated", async () => {
    await message1.downvote(regularUser._id);

    const res = await client.post(
      `/api/messages/${message1._id}/clear-downvote`
    );
    expect(res.status).toBe(401);

    const message = await Message.findById(message1._id);
    expect(message.downvotes).toHaveLength(1);
    expect(mapObjectIdToString(message.downvotes)).toContainEqual(
      regularUser._id.toString()
    );
  });

  test("Should not clear downvote if thread not found", async () => {
    await loginAsTestUser(client);

    const messageId = await generateUniqueId(Message);

    const res = await client.post(`/api/messages/${messageId}/clear-downvote`);
    expect(res.status).toBe(404);
  });

  test("Should not clear downvote if thread id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/messages/1/clear-downvote`);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/messages/:messageId", () => {
  let message1, message2;

  beforeEach(async () => {
    ({ message1, message2 } = await createTestMessages(
      regularUser,
      adminUser,
      thread1,
      thread2
    ));
  });

  test("Should edit message if user edits their message and message exists", async () => {
    await loginAsTestUser(client);

    const data = {
      content: "edited message",
    };

    const res = await client.patch(`/api/messages/${message1._id}`).send(data);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message.content).toEqual(data.content);
    expect(message.edited).toEqual(true);
  });

  test("Should not edit message if content is an empty string", async () => {
    await loginAsTestUser(client);

    const data = {
      content: "",
    };

    const res = await client.patch(`/api/messages/${message1._id}`).send(data);
    expect(res.status).toBe(400);

    const message = await Message.findById(message1._id);
    expect(message.content).not.toEqual(data.content);
    expect(message.edited).not.toEqual(true);
  });

  test("Should not edit message if no content field is given", async () => {
    await loginAsTestUser(client);

    const data = {};

    const res = await client.patch(`/api/messages/${message1._id}`).send(data);
    expect(res.status).toBe(400);

    const message = await Message.findById(message1._id);
    expect(message.content).not.toEqual(data.content);
    expect(message.edited).not.toEqual(true);
  });

  test("Should not edit message if user is unauthenticated", async () => {
    const data = {
      content: "edited message",
    };

    const res = await client.patch(`/api/messages/${message1._id}`).send(data);
    expect(res.status).toBe(401);

    const message = await Message.findById(message1._id);
    expect(message.content).not.toEqual(data.content);
    expect(message.edited).not.toEqual(true);
  });

  test("Should not edit message if user tries to edit other user's message", async () => {
    await loginAsTestUser(client, { asAdmin: true });

    const data = {
      content: "edited message",
    };

    const res = await client.patch(`/api/messages/${message1._id}`).send(data);
    expect(res.status).toBe(403);

    const message = await Message.findById(message1._id);
    expect(message.content).not.toEqual(data.content);
    expect(message.edited).not.toEqual(true);
  });

  test("Should not edit message if message not found", async () => {
    await loginAsTestUser(client);

    const data = {
      content: "edited message",
    };

    const messageId = await generateUniqueId(Message);

    const res = await client.patch(`/api/messages/${messageId}`).send(data);
    expect(res.status).toBe(404);
  });

  test("Should not edit message if message id is invalid", async () => {
    await loginAsTestUser(client);

    const data = {
      content: "edited message",
    };

    const res = await client.patch(`/api/messages/1`).send(data);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/messages/:messageId", () => {
  let message1, message2;

  beforeEach(async () => {
    ({ message1, message2 } = await createTestMessages(
      regularUser,
      adminUser,
      thread1,
      thread2
    ));
  });

  test("Should delete message if user deletes their own message and message exists", async () => {
    await loginAsTestUser(client);

    const res = await client.delete(`/api/messages/${message1._id}`);
    expect(res.status).toBe(200);

    const message = await Message.findById(message1._id);
    expect(message).toBeNull();
  });

  test("Should not delete message if user tries to delete other user's message", async () => {
    await loginAsTestUser(client, { asAdmin: true });

    const res = await client.delete(`/api/messages/${message1._id}`);
    expect(res.status).toBe(403);

    const message = await Message.findById(message1._id);
    expect(message).not.toBeNull();
  });

  test("Should not delete message if message not found", async () => {
    await loginAsTestUser(client);

    const messageId = await generateUniqueId(Message);

    const res = await client.delete(`/api/messages/${messageId}`);
    expect(res.status).toBe(404);
  });

  test("Should not delete message if message id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.delete(`/api/messages/1`);
    expect(res.status).toBe(400);
  });
});
