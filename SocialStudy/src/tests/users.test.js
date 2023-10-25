const setupTest = require("./setupTest");
const { User } = require("../models/User");
const {
  createTestUsers,
  loginAsTestUser,
  generateUniqueId,
  createTestForums,
} = require("./util");
const getClient = setupTest();

let client;
let regularUser, adminUser;

beforeEach(async () => {
  ({ regularUser, adminUser } = await createTestUsers());
  client = getClient();
});

describe("GET /api/users/", () => {
  test("Should get all users given no username query", async () => {
    const res = await client.get(`/api/users/`);
    expect(res.status).toBe(200);

    expect(res.body).toHaveLength(2);

    // Ensures that password is not passed
    res.body.forEach((user) => {
      expect(user).not.toHaveProperty("password");
    });
  });

  test("Should get all users given username query", async () => {
    // Trying to get admin user (case-insensitive, LIKE query)
    const res = await client.get(`/api/users?username=DMI`);
    expect(res.status).toBe(200);

    expect(res.body).toHaveLength(1);
  });
});

describe("GET /api/users/:userId", () => {
  test("Should receive user data if user exists", async () => {
    const res = await client.get(`/api/users/${regularUser._id}`);
    expect(res.status).toBe(200);

    const user = regularUser.toJSON();
    delete user.password;

    expect(res.body).toMatchObject({
      ...user,
      createdAt: expect.anything(),
      updatedAt: expect.anything(),
    });

    // Ensure that hashed password is not passed around
    expect(res.body).not.toHaveProperty("password");
  });

  test("Should not receive user data given invalid user id", async () => {
    const res = await client.get(`/api/users/1`);
    expect(res.status).toBe(400);
  });

  test("Should not receive user data if user not found", async () => {
    await User.findByIdAndRemove(regularUser._id);

    const res = await client.get(`/api/users/${regularUser._id}`);
    expect(res.status).toBe(404);
  });
});

describe("GET /api/users/:userId/starred-forums", () => {
  let forum1, forum2, forum3;
  beforeEach(async () => {
    ({ forum1, forum2, forum3 } = await createTestForums());

    await regularUser.starForum(forum1._id);
    await regularUser.starForum(forum2._id);
    await adminUser.starForum(forum3._id);
  });

  test("Should get all starred forums if user exists", async () => {
    const res = await client.get(
      `/api/users/${regularUser._id}/starred-forums`
    );
    expect(res.status).toBe(200);

    expect(res.body).toHaveLength(2);
    expect(res.body).toMatchObject([
      {
        ...forum1.toJSON(),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      },
      {
        ...forum2.toJSON(),
        createdAt: expect.anything(),
        updatedAt: expect.anything(),
      },
    ]);
  });

  test("Should not get all starred forums if user not found", async () => {
    const userId = await generateUniqueId(User);

    const res = await client.get(`/api/users/${userId}/starred-forums`);
    expect(res.status).toBe(404);
  });

  test("Should not get all starred forums if user id is invalid", async () => {
    const res = await client.get(`/api/users/1/starred-forums`);
    expect(res.status).toBe(400);
  });
});

describe("PATCH /api/users/:userId", () => {
  test("Should edit user profile given valid inputs", async () => {
    await loginAsTestUser(client);

    const data = {
      username: "test2",
      email: "test2@test2.com",
      password: "test2test2",
      bio: "test2 bio",
    };

    const res = await client.patch(`/api/users/${regularUser._id}`).send(data);
    expect(res.status).toBe(200);

    const user = await User.findOne({ username: data.username });

    // check if password is changed
    expect(user.password).not.toEqual(regularUser.password);

    // check if password is hashed
    expect(user.password).not.toEqual(data.password);

    // check basic values
    delete data.password;
    expect({
      username: user.username,
      email: user.email,
      bio: user.bio,
    }).toMatchObject(data);

    // check if updatedAt is working
    expect(user.updatedAt.getTime()).toBeGreaterThan(user.createdAt.getTime());
  });

  test("Should edit user profile and preserve unspecified properties given some inputs", async () => {
    await loginAsTestUser(client);

    const data = { bio: "edited bio" };
    const res = await client.patch(`/api/users/${regularUser._id}`).send(data);
    expect(res.status).toBe(200);

    const user = await User.findOne({ username: regularUser.username });
    expect(user.toJSON()).toMatchObject({
      ...regularUser.toJSON(),
      bio: data.bio,
      updatedAt: expect.anything(),
    });

    // check if updatedAt is working
    expect(user.updatedAt.getTime()).toBeGreaterThan(user.createdAt.getTime());
  });

  test("Should not edit user profile if username has been taken", async () => {
    await loginAsTestUser(client);

    const data = { username: "admin" };
    const res = await client.patch(`/api/users/${regularUser._id}`).send(data);
    expect(res.status).toBe(400);

    const user = await User.findOne({ username: regularUser.username });
    expect(user).not.toBeNull();
  });

  test("Should not edit user profile if email has been taken", async () => {
    await loginAsTestUser(client);

    const data = { email: "admin@admin.com" };
    const res = await client.patch(`/api/users/${regularUser._id}`).send(data);
    expect(res.status).toBe(400);

    const user = await User.findOne({ username: regularUser.username });

    // email remains
    expect(user.email).toEqual(regularUser.email);
  });

  test("Should not edit user profile if unauthenticated user tries to edit", async () => {
    const data = {
      bio: "edited bio",
    };

    const res = await client.patch(`/api/users/${regularUser._id}`).send(data);

    expect(res.status).toBe(401);

    const user = await User.findOne({ username: regularUser.username });
    expect(user.bio).toEqual(regularUser.bio);
  });

  test("Should not edit user profile if user tries to edit another user's profile", async () => {
    await loginAsTestUser(client);

    const data = {
      bio: "edited bio",
    };

    const res = await client.patch(`/api/users/${adminUser._id}`).send(data);

    expect(res.status).toBe(403);
    const user = await User.findOne({ username: adminUser.username });
    expect(user.bio).toEqual(adminUser.bio);
  });

  test("Should not edit user profile if user id is invalid", async () => {
    await loginAsTestUser(client);

    const data = {
      bio: "edited bio",
    };

    const res = await client.patch(`/api/users/1`).send(data);
    expect(res.status).toBe(403);
  });

  test("Should not edit user profile if user not found", async () => {
    await loginAsTestUser(client);

    const data = {
      bio: "edited bio",
    };

    const id = await generateUniqueId(User);

    const res = await client.patch(`/api/users/${id}`).send(data);
    expect(res.status).toBe(403);
  });

  test("Should not allow edit if new username has non-alphanumerical values", async () => {
    await loginAsTestUser(client);

    const data = { username: "admin!@#" };
    const res = await client.patch(`/api/users/${regularUser._id}`).send(data);
    expect(res.status).toBe(400);

    const user = await User.findOne({ username: regularUser.username });
    expect(user).not.toBeNull();
  });
});

describe("DELETE /api/users/:userId", () => {
  test("Should delete account if user deletes their own account", async () => {
    await loginAsTestUser(client);

    const res = await client.delete(`/api/users/${regularUser._id}`);
    expect(res.status).toBe(200);

    const user = await User.findOne({ username: regularUser.username });
    expect(user).toBeNull();
  });

  test("Should not delete account if user tries to delete another account", async () => {
    await loginAsTestUser(client, { asAdmin: true });

    const res = await client.delete(`/api/users/${regularUser._id}`);
    expect(res.status).toBe(403);

    const user = await User.findOne({ username: regularUser.username });
    expect(user).not.toBeNull();
  });

  test("Should not delete account if an unauthenticated user tries to delete another account", async () => {
    const res = await client.delete(`/api/users/${regularUser._id}`);
    expect(res.status).toBe(401);

    const user = await User.findOne({ username: regularUser.username });
    expect(user).not.toBeNull();
  });
});
