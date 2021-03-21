const express = require('express');
const Task = require('../models/tasks');
const auth = require('../middlewares/auth');

const router = express.Router();

//Handle Tasks Route
router.post('/tasks', auth, async (req, res) => {
  try {
    const task = new Task({
      ...req.body,
      owner: req.user._id
    });
    await task.save();
    res.status(201).send('Done');
  } catch (error) {
    console.log(error);
    res.status(400).send('error');
  }
});

//get all tasks
router.get('/tasks', auth, async (req, res) => {
  const match = {};
  if (req.query.completed) {
    match.completed = req.query.completed === 'true';
  }

  try {
    await req.user
      .populate({
        path: 'myTasks',
        match,
        options: {
          limit: parseInt(req.query.limit),
          skip: parseInt(req.query.skip)
        }
      })
      .execPopulate();
    console.log(req.user);
    if (req.user.myTasks.length === 0) {
      return res.send('there is no tasks Here');
    }

    res.send(req.user.myTasks);
  } catch (error) {
    console.log(error);
    res.status(500).send();
  }
});
// get task by id
router.get('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOne({ _id, owner: req.user._id });

    if (!task) {
      return res.status(404).send();
    }

    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

router.patch('/tasks/:id', auth, async (req, res) => {
  const ubdates = Object.keys(req.body);
  const allowdUbdate = ['description', 'completed'];
  const isValid = ubdates.every((ubdate) => allowdUbdate.includes(ubdate));

  if (!isValid) {
    return res.status(400).send({ error: 'invalid Ubdate' });
  }

  const _id = req.params.id;
  try {
    const result = await Task.findOne({ _id, owner: req.user._id });
    if (!result) {
      return res.status(404).send('NOT Found');
    }

    ubdates.forEach((ubdate) => {
      result[ubdate] = req.body[ubdate];
    });

    result.save();
    res.send(result);
  } catch (error) {
    console.log(error);
    res.status(400).send(error);
  }
});
// make delete route for tasks
router.delete('/tasks/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const task = await Task.findOneAndDelete({ _id, owner: req.user._id });
    if (!task) {
      return res.status(404).send('Not Found');
    }
    res.send(task);
  } catch (error) {
    res.status(500).send(error);
  }
});

module.exports = router;
