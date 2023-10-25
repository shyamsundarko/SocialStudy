const setupTest = require("./setupTest");
const { Forum } = require("../models/Forum");
const { School } = require("../models/School");
const {
  createTestUsers,
  loginAsTestUser,
  createTestSchools,
  createTestForums,
} = require("./util");
const { User } = require("../models/User");
const getClient = setupTest();

let school1, school2;
let regularUser, adminUser;

beforeEach(async () => {
  ({ regularUser, adminUser } = await createTestUsers());
  ({ school1, school2 } = await createTestSchools());
});

describe("GET /api/forums", () => {
  let forum1, forum2, forum3;

  beforeEach(async () => {
    ({ forum1, forum2, forum3 } = await createTestForums(school1, school2));
  });

  test("Should get all forums without filters", async () => {
    const client = getClient();
    const res = await client.get("/api/forums/");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    res.body.forEach((forum) => {
      expect(forum).toHaveProperty("school.name");
    });
  });

  test("Should get all forums with keyword filter", async () => {
    const client = getClient();
    let res = await client.get("/api/forums?keyword=test");

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);

    res = await client.get("/api/forums?keyword=0001");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(1);

    res = await client.get("/api/forums?keyword=TT1234");
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(0);
  });

  test("Should get all forums with valid school filter", async () => {
    const client = getClient();
    const res = await client.get(`/api/forums?school=${school1.name}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
  });

  test("Should not get all forums with invalid school filter", async () => {
    const client = getClient();
    const res = await client.get(`/api/forums?school=INVALID`);

    expect(res.status).toBe(400);
  });
});

describe("GET /api/forums/:forumId", () => {
  let forum1, forum2, forum3;

  beforeEach(async () => {
    ({ forum1, forum2, forum3 } = await createTestForums(school1, school2));
  });

  // TODO: test populate threads and aggregations
  test("Should receive forum data given valid inputs", async () => {
    const client = getClient();
    const res = await client.get(`/api/forums/${forum1._id}`);

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject({
      ...forum1.toJSON(),
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
    });
  });

  test("Should not receive forum data if forum not found", async () => {
    const client = getClient();

    await Forum.findByIdAndRemove(forum1._id);
    const res = await client.get(`/api/forums/${forum1._id}`);

    expect(res.status).toBe(404);
  });

  test("Should not receive forum data if invalid forumId", async () => {
    const client = getClient();
    const res = await client.get(`/api/forums/1`);

    expect(res.status).toBe(400);
  });
});

describe("POST /api/forums/:forumId/star", () => {
  let forum1, forum2;

  beforeEach(async () => {
    ({ forum1, forum2 } = await createTestForums(school1, school2));
  });

  test("Should star when user is authenticated and given valid inputs", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    let res = await client.post(`/api/forums/${forum1._id}/star`);
    expect(res.status).toBe(200);

    let user = await User.findOne({ username: "test" });

    expect(user.starredForums).toContainEqual(forum1._id);
    expect(user.starredForums).toHaveLength(1);

    // Star another forum
    res = await client.post(`/api/forums/${forum2._id}/star`);
    expect(res.status).toBe(200);

    user = await User.findOne({ username: "test" });

    expect(user.starredForums).toContainEqual(forum2._id);
    expect(user.starredForums).toHaveLength(2);
  });

  test("Should not star when user is not authenticated", async () => {
    const client = getClient();

    const res = await client.post(`/api/forums/${forum1._id}/star`);
    expect(res.status).toBe(401);

    const user = await User.findOne({ username: "test" });

    expect(user.starredForums).not.toContainEqual(forum1._id);
    expect(user.starredForums).toHaveLength(0);
  });

  test("Should not star when forum does not exist", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    await Forum.findByIdAndDelete(forum1._id);

    const res = await client.post(`/api/forums/${forum1._id}/star`);
    expect(res.status).toBe(404);

    const user = await User.findOne({ username: "test" });

    expect(user.starredForums).not.toContainEqual(forum1._id);
    expect(user.starredForums).toHaveLength(0);
  });

  test("Should not star when forumId is not a valid id", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    const res = await client.post(`/api/forums/1/star`);
    expect(res.status).toBe(400);

    const user = await User.findOne({ username: "test" });

    expect(user.starredForums).not.toContainEqual("1");
    expect(user.starredForums).toHaveLength(0);
  });

  test("Should not repeat star when user has starred the same forum before", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    await client.post(`/api/forums/${forum1._id}/star`);

    // Re-star
    const res = await client.post(`/api/forums/${forum1._id}/star`);
    expect(res.status).toBe(200);

    const user = await User.findOne({ username: "test" });

    expect(user.starredForums).toContainEqual(forum1._id);
    expect(user.starredForums).toHaveLength(1);
  });
});

describe("POST /api/forums/:forumId/unstar", () => {
  let forum1, forum2, forum3;

  beforeEach(async () => {
    ({ forum1, forum2, forum3 } = await createTestForums(school1, school2));

    // regularUser pre-starred forum1 and forum2
    await User.findByIdAndUpdate(regularUser._id, {
      $push: { starredForums: forum1._id },
    });
    await User.findByIdAndUpdate(regularUser._id, {
      $push: { starredForums: forum2._id },
    });
  });

  test("Should unstar when user is authenticated and given valid inputs", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    let res = await client.post(`/api/forums/${forum1._id}/unstar`);
    expect(res.status).toBe(200);

    let user = await User.findOne({ username: "test" });

    expect(user.starredForums).not.toContainEqual(forum1._id);
    expect(user.starredForums).toHaveLength(1);

    res = await client.post(`/api/forums/${forum2._id}/unstar`);
    expect(res.status).toBe(200);

    user = await User.findOne({ username: "test" });

    expect(user.starredForums).not.toContainEqual(forum2._id);
    expect(user.starredForums).toHaveLength(0);
  });

  test("Should not unstar when user is not authenticated", async () => {
    const client = getClient();

    const res = await client.post(`/api/forums/${forum1._id}/unstar`);
    expect(res.status).toBe(401);

    const user = await User.findOne({ username: "test" });

    expect(user.starredForums).toContainEqual(forum1._id);
    expect(user.starredForums).toHaveLength(2);
  });

  test("Should not unstar when forum does not exist", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    await Forum.findByIdAndDelete(forum3._id);

    const res = await client.post(`/api/forums/${forum3._id}/unstar`);
    expect(res.status).toBe(404);

    const user = await User.findOne({ username: "test" });

    expect(user.starredForums).toHaveLength(2);
  });

  test("Should not unstar when forumId is not a valid id", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    const res = await client.post(`/api/forums/1/unstar`);
    expect(res.status).toBe(400);

    const user = await User.findOne({ username: "test" });

    expect(user.starredForums).toHaveLength(2);
  });

  test("Should not unstar when user has not starred the forum before", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    const res = await client.post(`/api/forums/${forum3._id}/unstar`);
    expect(res.status).toBe(200);

    const user = await User.findOne({ username: "test" });

    expect(user.starredForums).not.toContainEqual(forum3._id);
    expect(user.starredForums).toHaveLength(2);
  });
});

describe("POST /api/forums/", () => {
  test("Should create when user is an admin and given valid data", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const data = {
      name: "TT0001",
      description: "Test 1",
      school: school1.name,
    };

    const res = await client.post("/api/forums").send(data);
    expect(res.status).toBe(200);

    const forum = await Forum.findOne({
      name: data.name,
      description: data.description,
    });
    expect(forum).not.toBeNull();
  });

  test("Should not create when user is not authenticated", async () => {
    const client = getClient();

    const data = {
      name: "TT0001",
      description: "Test 1",
      school: school1.name,
    };

    const res = await client.post("/api/forums").send(data);
    expect(res.status).toBe(401);

    const forum = await Forum.findOne({
      name: data.name,
      description: data.description,
    });
    expect(forum).toBeNull();
  });

  test("Should not create when user is authenticated, but not an admin", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    const data = {
      name: "TT0001",
      description: "Test 1",
      school: school1.name,
    };

    const res = await client.post("/api/forums").send(data);
    expect(res.status).toBe(401);

    const forum = await Forum.findOne({
      name: data.name,
      description: data.description,
    });
    expect(forum).toBeNull();
  });

  test("Should not create when there is a forum with same name exists", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const data = {
      name: "TT0001",
      description: "Test 1",
      school: school1.name,
    };

    await Forum.create({
      name: data.name,
      description: data.description,
      school: school1._id,
    });

    const res = await client.post("/api/forums").send(data);
    expect(res.status).toBe(400);

    const forums = await Forum.find({
      name: data.name,
      description: data.description,
    });
    expect(forums).toHaveLength(1);
  });

  test("Should not create when school does not exist", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const data = {
      name: "TT0001",
      description: "Test 1",
      school: school1.name,
    };

    await School.findByIdAndDelete(school1._id);

    const res = await client.post("/api/forums").send(data);
    expect(res.status).toBe(400);

    const forum = await Forum.findOne({
      name: data.name,
      description: data.description,
    });
    expect(forum).toBeNull();
  });
});

describe("PATCH /api/forums/:forumId", () => {
  let forum1;

  beforeEach(async () => {
    ({ forum1 } = await createTestForums(school1, school2));
  });

  test("Should edit forum when user is an admin and given valid inputs", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const data = {
      description: "Test 1 (edited)",
    };

    const res = await client.patch(`/api/forums/${forum1._id}`).send(data);
    expect(res.status).toBe(200);

    const forum = await Forum.findById(forum1._id);
    expect(forum).not.toBeNull();
    expect(forum.description).toBe(data.description);
    expect(forum.edited).toBe(true);
  });

  test("Should not edit forum when user is not authenticated", async () => {
    const client = getClient();

    const data = {
      description: "Test 1 (edited)",
    };

    const res = await client.patch(`/api/forums/${forum1._id}`).send(data);
    expect(res.status).toBe(401);

    const forum = await Forum.findById(forum1._id);
    expect(forum).not.toBeNull();
    expect(forum.description).not.toBe(data.description);
    expect(forum.edited).toBe(false);
  });

  test("Should not edit forum when user is not an admin", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    const data = {
      description: "Test 1 (edited)",
    };

    const res = await client.patch(`/api/forums/${forum1._id}`).send(data);
    expect(res.status).toBe(401);

    const forum = await Forum.findById(forum1._id);
    expect(forum).not.toBeNull();
    expect(forum.description).not.toBe(data.description);
  });

  test("Should not edit forum when forum not found", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const data = {
      description: "Test 1 (edited)",
    };

    await Forum.findByIdAndRemove(forum1._id);

    const res = await client.patch(`/api/forums/${forum1._id}`).send(data);
    expect(res.status).toBe(404);
  });

  test("Should not edit forum when forumId is not a valid id", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const data = {
      description: "Test 1 (edited)",
    };

    const res = await client.patch(`/api/forums/1`).send(data);
    expect(res.status).toBe(400);
  });

  test("Should not edit forum description when description is not passed to req.body", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const prevDesc = forum1.description;

    const res = await client.patch(`/api/forums/${forum1._id}`).send({});
    expect(res.status).toBe(200);

    const forum = await Forum.findById(forum1._id);
    expect(forum.description).toBe(prevDesc);
    expect(forum.edited).toBe(true);
  });
});

describe("DELETE /api/forums/:forumId/", () => {
  let forum1;

  beforeEach(async () => {
    ({ forum1 } = await createTestForums(school1, school2));
  });

  test("Should delete forum when user is an admin and given valid inputs", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const res = await client.delete(`/api/forums/${forum1._id}`);
    expect(res.status).toBe(200);

    const forum = await Forum.findById(forum1._id);
    expect(forum).toBeNull();
  });

  test("Should not delete forum when user is not authenticated", async () => {
    const client = getClient();

    const res = await client.delete(`/api/forums/${forum1._id}`);
    expect(res.status).toBe(401);

    const forum = await Forum.findById(forum1._id);
    expect(forum).not.toBeNull();
  });

  test("Should not delete forum when user is not an admin", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    const res = await client.delete(`/api/forums/${forum1._id}`);
    expect(res.status).toBe(401);

    const forum = await Forum.findById(forum1._id);
    expect(forum).not.toBeNull();
  });

  test("Should not delete forum when forum not found", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    await Forum.findByIdAndDelete(forum1._id);

    const res = await client.delete(`/api/forums/${forum1._id}`);
    expect(res.status).toBe(404);
  });
});
