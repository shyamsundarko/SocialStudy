const setupTest = require("./setupTest");
const { createTestSchools } = require("./util");
const getClient = setupTest();

let client;

beforeEach(async () => {
  ({ school1, school2 } = await createTestSchools());
  client = getClient();
});

describe("GET /api/schools", () => {
  test("Should receive all schools", async () => {
    const res = await client.get(`/api/schools`);
    expect(res.status).toBe(200);

    expect(res.body).toHaveLength(2);
    res.body.forEach((school) => {
      expect(school).toHaveProperty("name");
      expect(school).toHaveProperty("fullName");
    });
  });
});
