const express = require('express');

const Joi = require('joi');

const router = express.Router();

const db = require('../db');

// Mongodb will create collection if it doesnt exit
const messages = db.get('messages');

// Schema Validation
const schema = Joi.object()
  .keys({
    name: Joi.string()
      .alphanum()
      .regex(/^[A-Za-zÀ-ÿ]{1,100}$/),
    message: Joi.string()
      .min(1)
      .max(500)
      .required(),
    latitude: Joi.number()
      .min(-90)
      .max(90)
      .required(),
    longitude: Joi.number()
      .min(-180)
      .max(180)
      .required(),
    date: Joi.date()
  })
  .with('username', 'birthyear')
  .without('password', 'access_token');

router.get('/', (req, res) => {
  messages.find().then((allMessages) => {
    res.json(allMessages);
  });
});

router.post('/', (req, res, next) => {
  const result = Joi.validate(req.body, schema);
  if (result.error === null) {
    const { name, message, latitude, longitude } = req.body;
    const userMessage = {
      name,
      message,
      latitude,
      longitude,
      date: new Date()
    };

    // Insert into messages collection
    messages.insert(userMessage).then((insertedMessage) => {
      res.json(insertedMessage);
    });
  } else {
    next(result.error);
  }
});
module.exports = router;
