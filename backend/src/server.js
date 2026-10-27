require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const port = Number(process.env.PORT || 5000);
connectDB()
  .then(() => app.listen(port, () => console.log(`API listening at http://localhost:${port}`)))
  .catch((error) => {
    console.error('Không thể kết nối MongoDB:', error.message);
    process.exit(1);
  });
