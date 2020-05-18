const express = require("express");
const app = express();
const configRoutes = require("./routes");
const path = require('path');


app.use(express.static(__dirname + '/public'));
app.use('/img',express.static(path.join(__dirname, 'public/img')));
app.use('/js',express.static(path.join(__dirname, 'public/js')));
app.use('/css',express.static(path.join(__dirname, 'public/css')));

configRoutes(app);


app.listen(3000, function() {
    console.log('Site is up at on port 3000! Navigate to http://localhost:3000 to access it');
});
