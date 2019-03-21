const express = require('express');
const morgan = require('morgan');
const helmet = require('helmet');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const middlewares = require('./middlewares');
const api = require('./api');

const app = express();

app.use(morgan('dev'));
app.use(helmet());
app.use(express.json());
app.use(cors());

let dev = process.env.NODE_ENV !== 'production';

app.use('/api/v1', api);

if (!dev) {
  console.log('Production');
  console.log(path.join(__dirname, '../../client', 'build', 'index.html'));
  app.use(express.static(path.join(__dirname, '../../client', 'build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../client', 'build', 'index.html'));
  });
}

if (dev) {
  app.get('/', (req, res) => {
    res.json({
      message: '🦄🌈✨👋🌎🌍🌏✨🌈🦄'
    });
  });
}

app.use(middlewares.notFound);
app.use(middlewares.errorHandler);

module.exports = app;
