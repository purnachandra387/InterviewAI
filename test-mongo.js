const mongoose = require('mongoose');

const uri = "mongodb://2300033083_db_user:kg7SYmlBdPIm6ap6@ac-tyolsey-shard-00-00.qb9aq3a.mongodb.net:27017,ac-tyolsey-shard-00-01.qb9aq3a.mongodb.net:27017,ac-tyolsey-shard-00-02.qb9aq3a.mongodb.net:27017/aiInterviewDB?ssl=true&replicaSet=atlas-oozhja-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";

console.log('Connecting to Standard string...');
mongoose.connect(uri)
    .then(() => {
        console.log('DB SUCCESS');
        process.exit(0);
    })
    .catch(err => {
        console.error('DB ERROR:', err.message);
        process.exit(1);
    });
