const app = require('./app');
require('dotenv').config(); 
const setupDb = require('./config/setupDb'); 


const PORT = process.env.PORT || 3000;


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});