const setupTest = require("./setupTest");
const { User } = require("../models/User");
const { createTestUsers, loginAsTestUser } = require("./util");
const getClient = setupTest();

describe("POST /api/auth/register", () => {
  test("Should register given valid inputs", async () => {
    const data = {
      username: "test",
      email: "test@test.com",
      password: "testtest",
      confirmPassword: "testtest",
    };

    const client = getClient();
    const res = await client.post("/api/auth/register").send(data);

    expect(res.status).toEqual(200);

    // Found user in database
    const user = await User.findOne({
      username: data.username,
      email: data.email,
    });
    expect(user).toBeTruthy();

    // Make sure the password is hashed before saving
    expect(user.password).not.toEqual(data.password);
  });


  test("Should not register when password length is below 8", async () => {
    const data = {
      username: "test",
      email: "test@test.com",
      password: "test",
      confirmPassword: "test",
    };

    const client = getClient();
    const res = await client.post("/api/auth/register").send(data);

    expect(res.status).toEqual(400);

    const user = await User.findOne({
      username: data.username,
      email: data.email,
    });

    expect(user).toBeNull();
  });

  test("Should not register when passwords do not match", async () => {
    const data = {
      username: "test",
      email: "test@test.com",
      password: "testtest",
      confirmPassword: "testtestt",
    };

    const client = getClient();
    const res = await client.post("/api/auth/register").send(data);

    expect(res.status).toEqual(400);

    const user = await User.findOne({
      username: data.username,
      email: data.email,
    });

    expect(user).toBeNull();
  });

  test("Should not register when email is invalid", async () => {
    const data = {
      username: "test",
      email: "test",
      password: "testtest",
      confirmPassword: "testtest",
    };

    const client = getClient();
    const res = await client.post("/api/auth/register").send(data);

    expect(res.status).toEqual(400);

    const user = await User.findOne({
      username: data.username,
      email: data.email,
    });

    expect(user).toBeNull();
  });

  test("Should not register when no username is entered", async () => {
    const data = {
      username: "",
      email: "test@test.com",
      password: "testtest",
      confirmPassword: "testtest",
    };

    const client = getClient();
    const res = await client.post("/api/auth/register").send(data);

    expect(res.status).toEqual(400);

    const user = await User.findOne({
      username: data.username,
      email: data.email,
    });

    expect(user).toBeNull();
  });

  test("Should not register when username has been taken", async () => {
    await createTestUsers();

    const data = {
      username: "test",
      email: "test2@test.com",
      password: "testtest",
      confirmPassword: "testtest",
    };

    const client = getClient();
    const res = await client.post("/api/auth/register").send(data);

    expect(res.status).toEqual(400);

    const user = await User.findOne({
      username: data.username,
      email: data.email,
    });

    expect(user).toBeNull();
  });

  test("Should not register when username has non-alphanumerical values", async () => {
    await createTestUsers();

    const data = {
      username: "test!@#$%^&",
      email: "test2@test.com",
      password: "testtest",
      confirmPassword: "testtest",
    };

    const client = getClient();
    const res = await client.post("/api/auth/register").send(data);

    expect(res.status).toEqual(400);

    const user = await User.findOne({
      username: data.username,
      email: data.email,
    });

    expect(user).toBeNull();
  });

  test("Should not register when email has been taken", async () => {
    await createTestUsers();

    const data = {
      username: "test2",
      email: "test@test.com",
      password: "testtest",
      confirmPassword: "testtest",
    };

    const client = getClient();
    const res = await client.post("/api/auth/register").send(data);

    expect(res.status).toEqual(400);

    const user = await User.findOne({
      username: data.username,
      email: data.email,
    });

    expect(user).toBeNull();
  });

  test("Should not register when user is authenticated", async () => {
    await createTestUsers();
    const client = getClient();
    await loginAsTestUser(client);

    const data = {
      credential: "test2",
      password: "testtest",
    };

    const res = await client.post("/api/auth/register").send(data);
    expect(res.status).toBe(403);

    const user = await User.exists({ username: data.credential });
    expect(user).toBeNull();
  });
});

describe("POST /api/auth/login", () => {
  beforeEach(async () => {
    await createTestUsers();
  });

  test("Should log in given correct username and password", async () => {
    const data = {
      credential: "test",
      password: "testtest",
    };

    const client = getClient();
    let res = await client.post("/api/auth/login").send(data);

    expect(res.status).toBe(200);

    res = await client.get("/api/auth/user");
    expect(res.status).toBe(200);
    expect(res.body.username).toBe(data.credential);
  });

  test("Should log in given correct email and password", async () => {
    const data = {
      credential: "test@test.com",
      password: "testtest",
    };

    const client = getClient();
    let res = await client.post("/api/auth/login").send(data);

    expect(res.status).toBe(200);

    res = await client.get("/api/auth/user");
    expect(res.status).toBe(200);
    expect(res.body.email).toBe(data.credential);
  });

  test("Should not log in given wrong username", async () => {
    const data = {
      credential: "testt",
      password: "testtest",
    };

    const client = getClient();
    let res = await client.post("/api/auth/login").send(data);

    expect(res.status).toBe(401);

    res = await client.get("/api/auth/user");
    expect(res.status).toBe(401);
  });

  test("Should not log in given wrong email", async () => {
    const data = {
      credential: "test@test.co",
      password: "testtest",
    };

    const client = getClient();
    let res = await client.post("/api/auth/login").send(data);

    expect(res.status).toBe(401);

    res = await client.get("/api/auth/user");
    expect(res.status).toBe(401);
  });

  test("Should not log in given wrong password", async () => {
    const data = {
      credential: "test",
      password: "testtestt",
    };

    const client = getClient();
    let res = await client.post("/api/auth/login").send(data);

    expect(res.status).toBe(401);

    res = await client.get("/api/auth/user");
    expect(res.status).toBe(401);
  });

  test("Should not log in when user is authenticated", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    const data = {
      credential: "admin",
      password: "adminadmin",
    };

    let res = await client.post("/api/auth/login").send(data);
    expect(res.status).toBe(403);

    res = await client.get("/api/auth/user");
    expect(res.status).toBe(200);
    expect(res.body.username).not.toEqual(data.credential);
  });
});

describe("POST /api/auth/logout", () => {
  beforeEach(async () => {
    await createTestUsers();
  });

  test("Should log out when user is authenticated", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    let res = await client.post("/api/auth/logout");
    expect(res.status).toBe(200);

    res = await client.get("/api/auth/user");
    expect(res.status).toBe(401);
  });

  test("Should not log out when user is unauthenticated", async () => {
    const client = getClient();

    let res = await client.post("/api/auth/logout");
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/user", () => {
  beforeEach(async () => {
    await createTestUsers();
  });

  test("Should return user info when user is authenticated", async () => {
    const client = getClient();
    await loginAsTestUser(client);

    const res = await client.get("/api/auth/user");
    expect(res.status).toBe(200);

    const user = await User.findOne({ username: "test" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      _id: user._id.toString(),
      username: user.username,
      email: user.email,
      admin: user.admin,
    });
  });

  test("Should return user info with admin details when user is authenticated", async () => {
    const client = getClient();
    await loginAsTestUser(client, { asAdmin: true });

    const res = await client.get("/api/auth/user");
    expect(res.status).toBe(200);

    const adminUser = await User.findOne({ username: "admin" });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      _id: adminUser._id.toString(),
      username: adminUser.username,
      email: adminUser.email,
      admin: adminUser.admin,
    });
  });

  test("Should return null when user is unauthenticated", async () => {
    const client = getClient();

    const res = await client.get("/api/auth/user");
    expect(res.status).toBe(401);
  });
});
