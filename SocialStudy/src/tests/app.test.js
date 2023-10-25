const setupTest = require("./setupTest");
const { authorize, Authenticator } = require("passport/lib");
const getClient = setupTest();

//When get api successfully
test("GET /api", async () => {
  const client = getClient();
  return client.get("/api").expect(200);
});
