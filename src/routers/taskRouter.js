const express = require("express");
const router = new express.Router();
const auth = require("../middleware/auth");
const Task = require("../models/task");

//Creating a task
router.post("/tasks", auth, async (req, res) => {
  //const task = new Task(req.body);
  const task = new Task({
    ...req.body,
    owner: req.user._id,
  });
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});
//Reading all the tasks
router.get("/tasks", auth, async (req, res) => {
  const match = {};
  const sort = {};
  //If query string is provided
  if (req.query.completed) {
    //If req.query is set to true then we are assigning the boolean to the match.completed
    match.completed = req.query.completed === "true";
  }
  if (req.query.sortBy) {
    const parts = req.query.sortBy.split(":");
    sort[parts[0]] = sort[parts[1]] === "desc" ? -1 : 1;
  }
  try {
    await req.user
      .populate({
        path: "tasks",
        match,
        //Match the required tasks
        options: {
          //Send only two tasks
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip),
          //sory by createdtime
          //Asc == 1
          //desc == -1
          sort,
        },
      })
      .execPopulate();
    res.send(req.user.tasks);
  } catch (e) {
    res.status.send(e);
  }
});
//Reading a user
router.get("/tasks/:id", auth, async (req, res) => {
  const _id = req.params.id;
  try {
    // const task = await Task.findById(req.params.id);
    const task = await Task.findOne({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});
//Updating an user
router.patch("/tasks/:id", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["description", "completed"];
  const isAllowed = updates.every((update) => allowedUpdates.includes(update));
  if (!isAllowed) {
    return res.status(404).send({ error: "Invalid task update" });
  }
  const _id = req.params.id;
  try {
    // const updateTask = await Task.findByIdAndUpdate(req.params.id, req.body, {
    //   new: true,
    //   runValidators: true,
    // });

    const updateTask = await Task.findById({ _id, owner: req.user._id });
    if (!updateTask) {
      return res.status(404).send();
    }
    updates.forEach((update) => (updateTask[update] = req.body[update]));
    await updateTask.save();
    res.send(updateTask);
  } catch (e) {
    res.status(500).send(e);
  }
});
//Delete an user
router.delete("/tasks/:id", auth, async (req, res) => {
  try {
    const deleteTask = await Task.findByIdAndDelete({
      _id: req.params.id,
      owner: req.user._id,
    });
    if (!deleteTask) {
      return res.status(404).send();
    }
    res.send(deleteTask);
  } catch (e) {
    res.status(500).send(e);
  }
});
module.exports = router;
