const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config()


mongoose.connect(process.env.URI, { useNewUrlParser: true, useUnifiedTopology: true }).then(
  () => console.log("Connection Successfull\n","Connection Status: ",mongoose.connection.readyState)).catch(
    console.log("Database Error\n","Connection Status: ",mongoose.connection.readyState));


app.use(cors());
app.use(express.static('public'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//user Schema
const userSchema = new mongoose.Schema(
  {
    username: { type : String, required: [true, "User Name is required!"] },
    count: Number,
    log: [{
      description: String,
      duration: Number,
      date: String,
    }]
  }
);

//user model
let user = new mongoose.model('user', userSchema);

app.post('/api/users', (req, res) => {
  let name = req.body.username;
  user.findOne({username: name}, (err, data) => {
    if(data){
      res.json({username: data.username, _id: data._id});
    }
    else{
      user.create({username: name}, (err, data) => {
        if (err) return console.error(err);
        res.json({username: data.username, _id: data._id});
      });
    }
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let id = req.params._id;
  let des = req.body.description;
  let duration = req.body.duration;
  let date = new Date(req.body.date).toDateString();
  user.findById(id, (err, data) => {
    if (err) return console.error(err);

    data.log.push({
      description: des,
      duration: duration,
      date: date,
    });
    data.__v++;
    data.save((err, updated)=> {
      if (err) return console.error(err);
    });
    res.json({
      _id: data._id,
      username: data.username,
      date: date,
      duration: duration,
      description: description,
    });
  });
});

app.get('/api/users/:_id/logs?', (req, res)=> {
  let id = req.params._id;
  user.findById(id, (err, data) => {
    if (err) return console.error(err);
    res.json({
      _id: data._id,
      username: data.username,
      count: data.__v,
      log: data.log
    });
  });
});


app.get('/api/users', (req, res) => {
  res.json([]);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
