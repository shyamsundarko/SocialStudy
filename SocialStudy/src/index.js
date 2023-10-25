const setupApp = require("./app");

const main = async () => {
  const app = await setupApp();
  const PORT = process.env.PORT || 8080;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

main();
