const express = require('express');
const cors = require('cors');
const multer = require('multer');
const dotenv = require('dotenv');
let mongoose;
try {
  mongoose = require("mongoose");
} catch (e) {
  console.log(e);
}
const UserController = require("./controller/user-controller.js");
const ExerciseDto = require("./model/exercise-dto.js");
dotenv.config();
const app = express();
const multerMid = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

app.use(express.json());
app.use(cors());
app.disable('x-powered-by');
app.use(express.static('public'));
app.use(multerMid.array('files'));
app.use(express.urlencoded({ extended: false }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

const TIMEOUT = 10000;

app.get('/', (req, res, next) => {
  let t = setTimeout(() => {
    next({ message: "timeout" });
  }, TIMEOUT);

  res.sendFile(__dirname + '/views/index.html')
});

// API User
app.route('/api/users')
  .get((req, res, next) => {
    console.log("GET all users");

    // const results = UserController.getAllUsers(handler);
    UserController.getAllUsers((err, data) => {
      if (err) {
        return next(err);
      }

      if (!data) {
        console.log("Missing `done()` argument");
        return next({ message: "Missing callback argument" });
      }

      res.send(data);
    })

  })
  .post(express.urlencoded({ extended: false }), (req, res) => {
    // Get username from req
    const username = req.body.username;

    // save database
    // const result = UserController.saveUser(username, handler);
    UserController.saveUser(username, (err, data) => {
      if (err) {
        if (err.name === "MongoError" && err.code === 11000) {
          res.status(422).send({ success: false, message: 'User already exist!' });
        } else {
          return;
        }
      }

      if (!data) {
        console.log("Missing `done()` argument");
        return;
      }

      // respond
      res.send(data);
    });
  });

// get by ID
app.route('/api/users/:_id/logs')
  .get((req, res, next) => {
    // Get user id required
    const userId = req.params._id;
    // Get from, to, limit
    const condition = {
      from: req.query.from
      , to: req.query.to
      , limit: Number(req.query.limit)
    }

    console.log('condition: ' + JSON.stringify(condition));

    UserController.getExerciseById(userId, condition, (err, data) => {
      if (err) {
        if (err.name === "CastError") {
          res.status(422).send({ success: false, message: 'User ID not found!' });
          return;
        }

        return next(err);
      }

      if (!data) {
        console.log("Missing `done()` argument");
        return next({ message: "Missing callback argument" });
      }

      // respond
      res.send(data);
    })
  });
app.route('/api/users/:_id/exercises')
  .post((req, res, next) => {
    // Get user id
    const userId = req.params._id;

    // Get exercise data
    const exercise = new ExerciseDto.ExerciseDto(req.body.description
      , req.body.duration
      , req.body.date);

    console.log('----');
    console.log('body: ' + JSON.stringify(exercise));
    console.log('----');

    UserController.saveExercise(userId, exercise, (err, data) => {
      if (err) {
        if (err.name === "CastError") {
          res.status(422).send({ success: false, message: 'User ID not found!' });
          return;
        }

        return next(err);
      }

      if (!data) {
        console.log("Missing `done()` argument");
        return next({ message: "Missing callback argument" });
      }

      // respond
      res.send(data);
    });
  });

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
