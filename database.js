const mysql = require("mysql2");
const dotenv = require("dotenv");
dotenv.config();

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 3306,
});

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
db.on('error', (err) => {
  console.error("Database error:", err);
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    connect(); // Reconnect on lost connection
  }
});

// Initial connection
connect();

module.exports = db;
