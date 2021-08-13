let mongoose;
try {
    mongoose = require("mongoose");
} catch (e) {
    console.log(e);
}
const moment = require('moment');
const UserModule = require('../model/user-dto.js');

// 1. Create Schema
const UserSchema = mongoose.Schema({
    username: {
        type: String,
        require: true,
    }
    , count: Number
    , log: [{
        description: String
        , duration: Number
        , date: Date
    }]
});

// 2. Create a instance from schema
const UserModel = mongoose.model("Users", UserSchema);

/**
 * Create a user
 * 
 * @param {*} username 
 * @param {*} handle 
 */
const saveUser = (username, handler) => {
    // 3. Create collection from model
    // 3.1 Create object contain data user
    const userDto = new UserModule.UserDto(username);
    // 3.2 Assign user into database as a collection
    const userModel = new UserModel(userDto);

    console.log(userModel);

    // 4. Insert user and handle error exception
    userModel.save((err, data) => {
        if (err) {
            handler(err);
        } else {
            handler(null, {
                _id: data._id
                , username: data.username
            });
        }
    });
}

/**
 * Get all users registered
 */
const getAllUsers = (handler) => {
    UserModel.find({}, '_id, username', (err, data) => {
        if (err) {
            handler(err);
        } else {
            handler(null, data);
        }
    });
}

/**
 * Update exercise by userId
 * 
 * @param {*} id User id
 * @param {*} exercise {description, duration, date}
 * @param {*} handler error exception
 */
const saveExercise = (id, exercise, handler) => {
    // find by Id
    UserModel.findById(id)
        .then((user) => {
            console.log("user by id: " + user);
            console.log("exercise: " + JSON.stringify(exercise));

            // update data
            user.log.push(exercise);
            user.count = user.log.length;
            console.log(user);

            // insert user into database
            const updatedUserModel = new UserModel(user);
            return updatedUserModel.save();
        })
        .then((updatedUser) => {
            console.log(updatedUser);
            const count = updatedUser.count;

            // format date
            updatedUser.log.forEach(iLog => {
                iLog._doc.date = moment(iLog._doc.date).format("ddd MMM DD YYYY");
            });

            const addedExercise = updatedUser.log[count - 1];
            let result = {
                _id: updatedUser._id
                , username: updatedUser.username
                , date: addedExercise.date
                , duration: addedExercise.duration
                , description: addedExercise.description
            };

            console.log("updated User: " + result);
            handler(null, result);
        })
        .catch((err) => {
            handler(err);
        });
};

/**
 * Get all exercise by id
 * 
 * @param {*} id 
 * @param {*} handler 
 */
const getExerciseById = (id, condition, handler) => {
    UserModel.findById(id, '-__v -log._id')
        .then((data) => {
            console.log(data.log);

            data.log.forEach(iLog => {
                iLog._doc.date = new Date(iLog._doc.date).toUTCString();
            });

            // get limit session
            if (condition.limit) {
                data.log = data.log.slice(0, condition.limit);
            }

            // filter by date between from...to
            if (condition.from || condition.to) {
                let fromDate = new Date(0);
                let toDate = new Date();

                if (condition.from) {
                    fromDate = new Date(condition.from);
                }

                if (condition.to) {
                    toDate = new Date(condition.to);
                }

                // get time to compare
                fromDate = fromDate.getTime();
                toDate = toDate.getTime();

                data.log = data.log.filter(session => {
                    let sessionDate = new Date(session.date).getTime();

                    return sessionDate >= fromDate && sessionDate <= toDate;
                });
            }

            console.log(data.log);
            handler(null, data);
        })
        .catch((err) => {
            handler(err);
        });
};

module.exports = {
    saveUser
    , getAllUsers
    , saveExercise
    , getExerciseById
}