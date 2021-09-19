const express = require("express");
const path = require("path");
const livereload = require("livereload");
const connectLivereload = require("connect-livereload");

const PORT = 7000;
const publicDirectory = path.join(__dirname, "../docs");

const liveReloadServer = livereload.createServer();
liveReloadServer.watch(publicDirectory);

const app = express();
app.use(connectLivereload());
app.use(express.static(publicDirectory));

// https://bytearcher.com/articles/refresh-changes-browser-express-livereload-nodemon/
liveReloadServer.server.once("connection", () => {
  setTimeout(() => {
    liveReloadServer.refresh("/");
  }, 100);
});

app.listen(PORT, () => {
  console.log(`
    🚀  Server is running!
    📭  Query at http://127.0.0.1:${PORT}/
  `);
});
