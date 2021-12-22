const http = require('http');
const app = require('./app');
const server =http.createServer(app);


app.set(process.env.PORT || 3000);

// app.use((req,res, next)=>{
//     res.json({message:'test réussie'});
// });


server.listen(process.env.PORT || 3000);