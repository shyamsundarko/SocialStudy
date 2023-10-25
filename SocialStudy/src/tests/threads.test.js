const setupTest = require("./setupTest");
const {
  createTestUsers,
  loginAsTestUser,
  createTestForums,
  createTestThreads,
  createTestMessages,
} = require("./util");
const { Thread } = require("../models/Thread");
const { Forum } = require("../models/Forum");
const mongoose = require("mongoose");
const getClient = setupTest();

let client;
let forum1, forum2, forum3;
let regularUser, adminUser;

beforeEach(async () => {
  ({ regularUser, adminUser } = await createTestUsers());
  ({ forum1, forum2, forum3 } = await createTestForums());

  client = getClient();
});

describe("GET /api/threads/:threadId", () => {
  let thread1, thread2;
  beforeEach(async () => {
    ({ thread1, thread2 } = await createTestThreads(
      regularUser,
      adminUser,
      forum1,
      forum2
    ));
  });

  test("Should receive thread data if thread exists", async () => {
    // Add votes
    await thread1.upvote(regularUser._id);
    await thread1.downvote(adminUser._id);

    // Add messages
    await createTestMessages(
      regularUser,
      adminUser,
      thread1,
      thread2,
      forum1,
      forum2
    );

    await loginAsTestUser(client);

    const res = await client.get(`/api/threads/${thread1._id}`);
    expect(res.status).toBe(200);

    expect(res.body.author).toMatchObject({
      _id: expect.anything(),
      username: expect.any(String),
      admin: expect.any(Boolean),
    });

    // Check thread vote aggregation
    expect(res.body.upvotes).toBe(1);
    expect(res.body.downvotes).toBe(1);

    expect(res.body.upvoted).toBe(true);
    expect(res.body.downvoted).toBe(false);

    // Check message vote aggregation
    res.body.messages.forEach((message) => {
      expect(message.upvotes).toBe(0);
      expect(message.downvotes).toBe(0);

      expect(message.upvoted).toBe(false);
      expect(message.downvoted).toBe(false);
    });
  });

  test("Should not receive thread data if thread not found", async () => {
    await Thread.findByIdAndRemove(thread1._id);

    const res = await client.get(`/api/threads/${thread1._id}`);
    expect(res.status).toBe(404);
  });

  test("Should not receive thread data if thread id is invalid", async () => {
    const res = await client.get(`/api/threads/1`);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/threads", () => {
  test("Should create thread when user is authenticated and given valid inputs", async () => {
    await loginAsTestUser(client);

    const data = {
      forum: forum1._id,
      title: "Test Thread",
      content: "Test Content",
    };

    const res = await client.post(`/api/threads/`).send(data);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(res.body._id);
    expect(thread).not.toBeNull();
    expect({
      forum: thread.forum,
      title: thread.title,
      content: thread.content,
      author: thread.author,
    }).toEqual({ ...data, author: regularUser._id });
  });

  test("Should not create thread when forum id is invalid", async () => {
    await loginAsTestUser(client);

    const data = {
      forum: "1",
      title: "Test Thread",
      content: "Test Content",
    };

    const res = await client.post(`/api/threads/`).send(data);
    expect(res.status).toBe(400);

    const thread = await Thread.findOne({
      title: data.title,
      content: data.content,
    });
    expect(thread).toBeNull();
  });

  test("Should not create thread when forum not found", async () => {
    await loginAsTestUser(client);

    await Forum.findByIdAndRemove(forum1._id);

    const data = {
      forum: forum1._id,
      title: "Test Thread",
      content: "Test Content",
    };

    const res = await client.post(`/api/threads/`).send(data);
    expect(res.status).toBe(400);

    const thread = await Thread.findOne(data);
    expect(thread).toBeNull();
  });

  test("Should not create thread when user in unauthenticated", async () => {
    const data = {
      forum: forum1._id,
      title: "Test Thread",
      content: "Test Content",
    };

    const res = await client.post(`/api/threads/`).send(data);
    expect(res.status).toBe(401);

    const thread = await Thread.findById(res.body._id);
    expect(thread).toBeNull();
  });

  test("Should not create thread when title field is missing", async () => {
    await loginAsTestUser(client);

    const data = {
      forum: forum1._id,
      content: "Test Content",
    };

    const res = await client.post(`/api/threads/`).send(data);
    expect(res.status).toBe(400);

    const thread = await Thread.findOne(data);
    expect(thread).toBeNull();
  });

  test("Should not create thread when content field is missing", async () => {
    await loginAsTestUser(client);

    const data = {
      forum: forum1._id,
      title: "Test Thread",
    };

    const res = await client.post(`/api/threads/`).send(data);
    expect(res.status).toBe(400);

    const thread = await Thread.findOne(data);
    expect(thread).toBeNull();
  });

  test("Should not create thread when title field is an empty string", async () => {
    await loginAsTestUser(client);

    const data = {
      forum: forum1._id,
      title: "",
      content: "Test Content",
    };

    const res = await client.post(`/api/threads/`).send(data);
    expect(res.status).toBe(400);

    const thread = await Thread.findOne(data);
    expect(thread).toBeNull();
  });

  test("Should not create thread when content field is an empty string", async () => {
    await loginAsTestUser(client);

    const data = {
      forum: forum1._id,
      title: "Test Thread",
      content: "",
    };

    const res = await client.post(`/api/threads/`).send(data);
    expect(res.status).toBe(400);

    const thread = await Thread.findOne(data);
    expect(thread).toBeNull();
  });
});

describe("POST /api/threads/:threadId/upvote", () => {
  let thread1, thread2;
  beforeEach(async () => {
    ({ thread1, thread2 } = await createTestThreads(
      regularUser,
      adminUser,
      forum1,
      forum2
    ));
  });

  test("Should upvote thread when user is authenticated and thread exists", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/threads/${thread1._id}/upvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.upvotes).toHaveLength(1);
    expect(thread.upvotes).toContainEqual(regularUser._id);
  });

  test("Should upvote thread and remove downvote when user has downvoted before", async () => {
    await loginAsTestUser(client);

    // Downvoted before
    await Thread.findByIdAndUpdate(thread1._id, {
      $push: { downvotes: regularUser._id },
    });

    const res = await client.post(`/api/threads/${thread1._id}/upvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.upvotes).toHaveLength(1);
    expect(thread.upvotes).toContainEqual(regularUser._id);

    // Check if downvote removed (mutual exclusivity)
    expect(thread.downvotes).toHaveLength(0);
    expect(thread.downvotes).not.toContainEqual(regularUser._id);
  });

  test("Should not re-upvote thread when user tries to re-upvote", async () => {
    await loginAsTestUser(client);

    // Upvoted before
    await Thread.findByIdAndUpdate(thread1._id, {
      $push: { upvotes: regularUser._id },
    });

    const res = await client.post(`/api/threads/${thread1._id}/upvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.upvotes).toHaveLength(1);
    expect(thread.upvotes).toContainEqual(regularUser._id);
  });

  test("Should not upvote thread when user is unauthenticated", async () => {
    const res = await client.post(`/api/threads/${thread1._id}/upvote`);
    expect(res.status).toBe(401);

    const thread = await Thread.findById(thread1._id);
    expect(thread.upvotes).toHaveLength(0);
  });

  test("Should not upvote thread if thread not found", async () => {
    await loginAsTestUser(client);

    await Thread.findByIdAndRemove(thread1._id);

    const res = await client.post(`/api/threads/${thread1._id}/upvote`);
    expect(res.status).toBe(404);
  });

  test("Should not upvote thread if thread id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/threads/1/upvote`);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/threads/:threadId/downvote", () => {
  let thread1, thread2;
  beforeEach(async () => {
    ({ thread1, thread2 } = await createTestThreads(
      regularUser,
      adminUser,
      forum1,
      forum2
    ));
  });

  test("Should downvote thread when user is authenticated and thread exists", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/threads/${thread1._id}/downvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.downvotes).toHaveLength(1);
    expect(thread.downvotes).toContainEqual(regularUser._id);
  });

  test("Should downvote thread and remove upvote when user has upvoted before", async () => {
    await loginAsTestUser(client);

    // Upvoted before
    await Thread.findByIdAndUpdate(thread1._id, {
      $push: { upvotes: regularUser._id },
    });

    const res = await client.post(`/api/threads/${thread1._id}/downvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.downvotes).toHaveLength(1);
    expect(thread.downvotes).toContainEqual(regularUser._id);

    // Check if upvoted removed (mutual exclusivity)
    expect(thread.upvotes).toHaveLength(0);
    expect(thread.upvotes).not.toContainEqual(regularUser._id);
  });

  test("Should not re-downvote thread when user tries to re-downvote", async () => {
    await loginAsTestUser(client);

    // Downvoted before
    await Thread.findByIdAndUpdate(thread1._id, {
      $push: { downvotes: regularUser._id },
    });

    const res = await client.post(`/api/threads/${thread1._id}/downvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.downvotes).toHaveLength(1);
    expect(thread.downvotes).toContainEqual(regularUser._id);
  });

  test("Should not downvote thread when user is unauthenticated", async () => {
    const res = await client.post(`/api/threads/${thread1._id}/downvote`);
    expect(res.status).toBe(401);

    const thread = await Thread.findById(thread1._id);
    expect(thread.downvotes).toHaveLength(0);
  });

  test("Should not downvote thread if thread not found", async () => {
    await loginAsTestUser(client);

    await Thread.findByIdAndRemove(thread1._id);

    const res = await client.post(`/api/threads/${thread1._id}/downvote`);
    expect(res.status).toBe(404);
  });

  test("Should not downvote thread if thread id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/threads/1/downvote`);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/threads/:threadId/clear-upvote", () => {
  let thread1, thread2;
  beforeEach(async () => {
    ({ thread1, thread2 } = await createTestThreads(
      regularUser,
      adminUser,
      forum1,
      forum2
    ));
  });

  test("Should clear upvote when user is authenticated and has upvoted thread before", async () => {
    await loginAsTestUser(client);

    await thread1.upvote(regularUser._id);

    const res = await client.post(`/api/threads/${thread1._id}/clear-upvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.upvotes).toHaveLength(0);
    expect(thread.upvotes).not.toContainEqual(regularUser._id);
  });

  test("Should not clear upvote when user has not upvoted thread before", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/threads/${thread1._id}/clear-upvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.upvotes).toHaveLength(0);
    expect(thread.upvotes).not.toContainEqual(regularUser._id);
  });

  test("Should not clear upvote when user is not authenticated", async () => {
    const res = await client.post(`/api/threads/${thread1._id}/clear-upvote`);
    expect(res.status).toBe(401);

    const thread = await Thread.findById(thread1._id);
    expect(thread.upvotes).toHaveLength(0);
  });

  test("Should not clear upvote when thread not found", async () => {
    await loginAsTestUser(client);

    await Thread.findByIdAndRemove(thread1._id);

    const res = await client.post(`/api/threads/${thread1._id}/clear-upvote`);
    expect(res.status).toBe(404);
  });

  test("Should not clear upvote when thread id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/threads/1/clear-upvote`);
    expect(res.status).toBe(400);
  });
});

describe("POST /api/threads/:threadId/clear-downvote", () => {
  let thread1, thread2;
  beforeEach(async () => {
    ({ thread1, thread2 } = await createTestThreads(
      regularUser,
      adminUser,
      forum1,
      forum2
    ));
  });

  test("Should clear downvote when user is authenticated and has downvoted thread before", async () => {
    await loginAsTestUser(client);

    await thread1.downvote(regularUser._id);

    const res = await client.post(`/api/threads/${thread1._id}/clear-downvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.downvotes).toHaveLength(0);
    expect(thread.downvotes).not.toContainEqual(regularUser._id);
  });

  test("Should not clear downvote when user has not downvoted thread before", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/threads/${thread1._id}/clear-downvote`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread.downvotes).toHaveLength(0);
    expect(thread.downvotes).not.toContainEqual(regularUser._id);
  });

  test("Should not clear downvote when user is not authenticated", async () => {
    const res = await client.post(`/api/threads/${thread1._id}/clear-downvote`);
    expect(res.status).toBe(401);

    const thread = await Thread.findById(thread1._id);
    expect(thread.downvotes).toHaveLength(0);
  });

  test("Should not clear downvote when thread not found", async () => {
    await loginAsTestUser(client);

    await Thread.findByIdAndRemove(thread1._id);

    const res = await client.post(`/api/threads/${thread1._id}/clear-downvote`);
    expect(res.status).toBe(404);
  });

  test("Should not clear downvote when thread id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.post(`/api/threads/1/clear-downvote`);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/threads/:threadId", () => {
  let thread1, thread2;
  beforeEach(async () => {
    ({ thread1, thread2 } = await createTestThreads(
      regularUser,
      adminUser,
      forum1,
      forum2
    ));
  });

  test("Should edit thread if user edits their own thread and given valid inputs", async () => {
    await loginAsTestUser(client);

    const data = {
      title: "Edited Thread1 Title",
      content: "Edited Thread1 Content",
    };

    const res = await client.patch(`/api/threads/${thread1._id}`).send(data);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread).not.toBeNull();
    expect({ title: thread.title, content: thread.content }).toEqual(data);
    expect(thread.edited).toEqual(true);
  });

  test("Should edit thread if user edits their own thread and only title field is given", async () => {
    await loginAsTestUser(client);

    const data = {
      title: "Edited Thread1 Title",
    };

    const res = await client.patch(`/api/threads/${thread1._id}`).send(data);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread).not.toBeNull();
    expect({ title: thread.title, content: thread.content }).toEqual({
      title: data.title,
      content: thread1.content,
    });
    expect(thread.edited).toEqual(true);
  });

  test("Should edit thread if user edits their own thread and only content field is given", async () => {
    await loginAsTestUser(client);

    const data = {
      content: "Edited Thread1 Content",
    };

    const res = await client.patch(`/api/threads/${thread1._id}`).send(data);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread).not.toBeNull();
    expect({ title: thread.title, content: thread.content }).toEqual({
      title: thread1.title,
      content: data.content,
    });
    expect(thread.edited).toEqual(true);
  });

  test("Should not edit thread if title field is an empty string", async () => {
    await loginAsTestUser(client);

    const data = {
      title: "",
      content: "Edited Thread1 Content",
    };

    const res = await client.patch(`/api/threads/${thread1._id}`).send(data);
    expect(res.status).toBe(400);

    const thread = await Thread.findById(thread1._id);
    expect(thread).not.toBeNull();
    expect({ title: thread.title, content: thread.content }).toEqual({
      title: thread1.title,
      content: thread1.content,
    });
    expect(thread.edited).toEqual(false);
  });

  test("Should not edit thread if content field is an empty string", async () => {
    await loginAsTestUser(client);

    const data = {
      title: "Edited Thread1 Title",
      content: "",
    };

    const res = await client.patch(`/api/threads/${thread1._id}`).send(data);
    expect(res.status).toBe(400);

    const thread = await Thread.findById(thread1._id);
    expect(thread).not.toBeNull();
    expect({ title: thread.title, content: thread.content }).toEqual({
      title: thread1.title,
      content: thread1.content,
    });
    expect(thread.edited).toEqual(false);
  });

  test("Should not edit thread if user is not authenticated", async () => {
    const data = {
      title: "Edited Thread1 Title",
      content: "Edited Thread1 Content",
    };

    const res = await client.patch(`/api/threads/${thread1._id}`).send(data);
    expect(res.status).toBe(401);

    const thread = await Thread.findById(thread1._id);
    expect(thread).not.toBeNull();
    expect({ title: thread.title, content: thread.content }).toEqual({
      title: thread1.title,
      content: thread1.content,
    });
    expect(thread.edited).toEqual(false);
  });

  test("Should not edit thread if user tries to edit other user's thread", async () => {
    await loginAsTestUser(client);

    const data = {
      title: "Edited Thread1 Title",
      content: "Edited Thread1 Content",
    };

    const res = await client.patch(`/api/threads/${thread2._id}`).send(data);
    expect(res.status).toBe(403);

    const thread = await Thread.findById(thread2._id);
    expect(thread).not.toBeNull();
    expect({ title: thread.title, content: thread.content }).toEqual({
      title: thread2.title,
      content: thread2.content,
    });
    expect(thread.edited).toEqual(false);
  });

  test("Should not edit thread if thread not found", async () => {
    await loginAsTestUser(client);

    const data = {
      title: "Edited Thread1 Title",
      content: "Edited Thread1 Content",
    };

    await Thread.findByIdAndRemove(thread1._id);

    const res = await client.patch(`/api/threads/${thread1._id}`).send(data);
    expect(res.status).toBe(404);
  });

  test("Should not edit thread if thread id is invalid", async () => {
    await loginAsTestUser(client);

    const data = {
      title: "Edited Thread1 Title",
      content: "Edited Thread1 Content",
    };

    const res = await client.patch(`/api/threads/1`).send(data);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/threads/:threadId", () => {
  let thread1, thread2;
  beforeEach(async () => {
    ({ thread1, thread2 } = await createTestThreads(
      regularUser,
      adminUser,
      forum1,
      forum2
    ));
  });

  test("Should delete thread if user is authenticated and deletes their own thread", async () => {
    await loginAsTestUser(client);

    const res = await client.delete(`/api/threads/${thread1._id}`);
    expect(res.status).toBe(200);

    const thread = await Thread.findById(thread1._id);
    expect(thread).toBeNull();
  });

  test("Should not delete thread if user tries to delete other user's thread", async () => {
    await loginAsTestUser(client);

    const res = await client.delete(`/api/threads/${thread2._id}`);
    expect(res.status).toBe(403);

    const thread = await Thread.findById(thread2._id);
    expect(thread).not.toBeNull();
  });

  test("Should not delete thread if user is unauthenticated", async () => {
    const res = await client.delete(`/api/threads/${thread1._id}`);
    expect(res.status).toBe(401);

    const thread = await Thread.findById(thread1._id);
    expect(thread).not.toBeNull();
  });

  test("Should not delete thread if thread not found", async () => {
    await loginAsTestUser(client);

    await Thread.findByIdAndRemove(thread1._id);

    const res = await client.delete(`/api/threads/${thread1._id}`);
    expect(res.status).toBe(404);
  });

  test("Should not delete thread if thread id is invalid", async () => {
    await loginAsTestUser(client);

    const res = await client.delete(`/api/threads/1`);
    expect(res.status).toBe(400);
  });
});
