const express = require("express");
const redis = require("redis");
const morgan = require("morgan");
const ejs = require("ejs");
const bodyParser = require("body-parser");

const app = express();

//? Create client
var client = redis.createClient();
client.on('connect', function () {
    console.log("Redis Server connected");
});

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
// app.use(express.static("public"));

app.get("/", function (req, res) {
    var title = 'Task List';

    client.lrange("tasks", 0, -1, function (err, reply) {
        client.hgetall("call", function (err, call) {
            res.render("index", {
                title: title,
                tasks: reply,
                call: call
            });
        });
    });
});

app.post("/task/add", function (req, res) {
    var task = req.body.task;
    client.rpush("tasks", task, function (err, reply) {
        if (err) {
            console.log("Error!");
        }
        else {
            // console.log("Task Added...");
            res.redirect("/");
        }
    });
});

app.post("/task/delete", function (req, res) {
    let taskToDelete = req.body.tasks;

    client.lrange("tasks", 0, -1, function (err, tasks) {
        for (var i = 0; i < tasks.length; i++) {
            if (taskToDelete.indexOf(tasks[i]) > -1) {
                client.lrem('tasks', 0, tasks[i], function () {
                    if (err) {
                        console.log(err);
                    }
                });
            }
        }
        res.redirect("/");
    });
});

app.post("/call/add", function (req, res) {
    var newCall = {};

    newCall.name = req.body.name;
    newCall.location = req.body.location;
    newCall.phone = req.body.phone;
    newCall.time = req.body.time;

    client.hmset("call", ['name', newCall.name, 'location', newCall.location, 'phone', newCall.phone, 'time', newCall.time], function (err, reply) {
        if (err) {
            console.log(err);
        }
        console.log(reply);
        res.redirect("/");
    });
});

app.listen(3000, function () {
    console.log("Server running on port 3000");
});
