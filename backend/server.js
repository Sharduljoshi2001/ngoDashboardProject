const app = require("./src/app");
const config = require("./src/config");

module.exports = app;

if (require.main === module) {
  app.listen(config.PORT, () => {
    console.log(`🚀 Server running on http://localhost:${config.PORT}`);
  });
}