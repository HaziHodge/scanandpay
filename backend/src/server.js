require('dotenv').config();
const http = require('http');
const app = require('./app');
const socketConfig = require('./config/socket');

const PORT = process.env.PORT || 3000;

const server = http.createServer(app);

// Initialize Socket.io
socketConfig.init(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
