const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const moment = require('moment');
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
    count: 0,
    log: [{
      description: String,
      duration: Number,
      date: String,
    }],
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
      })
    }
  });
});

app.post('/api/users/:_id/exercises', (req, res) => {
  let id = req.params._id;
  let des = req.body.description;
  let duration = req.body.duration;
  let date = new Date(req.body.date).toDateString();
  user.findById(id, (err, data) => {
    if (err) {
      res.string('ERROR: User doesnt exist!')
    }
    
    else  {  data.log.push({
      description: des,
      duration: duration,
      date: date,
    });
    
    data.save((err, updated)=> {
      if (err) return console.log(err);
      if(updated) {
        res.json({
          _id: updated._id,
          username: updated.username,
          date: date,
          duration: duration,
          description: des,
         
       });
      }
    });
     }
  });
  });

app.get('/api/users/:_id/logs', (req, res)=> {
  const {from, to, limit} = req.query;
  let id = req.params._id;
  const startDate = moment(from)
  const endDate = moment(to)
  let d = startDate
  user.findById(id, (err, data) => {
    if(err) return console.log(err);
    let log = data.log;
      if(from === undefined || to === undefined){
        let array = [];
        for(let i in log){
          if(array >= limit){break;}
          let info = {description: log[i]['description'],
                      duration: log[i]['duration'], 
                      date: log[i]['date']}
        array.push(info);
      }
    res.json({
    _id: data._id,
    username: data.username,
    count:  array.length,
    log: array
  });
  }
    
else {    let matches = [];
  while (+d.toDate() < +endDate.toDate()) {
    let next_date = (new Date(d).toDateString());
    d = d.add(1, 'days')
    for(let i in log){
      if(log[i]['date'] === next_date){
        if(matches >= limit){break;}
        let info = {description: log[i]['description'],
                      duration: log[i]['duration'], 
                      date: log[i]['date']}
        matches.push(info);
      }
    }
  }
  res.json({
    _id: data._id,
    username: data.username,
    count:  matches.length,
    log: matches
  });}
  })
});

app.get('/api/users', (req, res) => {
  user.find({}, (err, data) => {
    if (err) {
      res.send('NO Users in database');
    }
    else{
      res.json(data);
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
