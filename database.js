const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectTimeout: 10000,  // Increase timeout in milliseconds
  pool: true,
  queueLimit: 0,
  port: 3306,
});

// const db =  mysql.createPool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   waitForConnections: true,
//   connectionLimit: 10,
//   queueLimit: 0
// });

// Connect to the database
function connect() {
  db.connect((err) => {
    if (err) {
      console.error("Error connecting to MySQL:", err);
      setTimeout(connect, 2000); // Retry connection after 2 seconds
    } else {
      console.log("Connected to MySQL");
    }
  });
}

// Keep the connection alive
db.on("error", (err) => {
  console.error("Database error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    connect(); // Reconnect on lost connection
  }
});

// Initial connection
connect();

module.exports = db;
