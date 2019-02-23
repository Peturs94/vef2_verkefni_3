require('dotenv').config();

const path = require('path');
const express = require('express');

const sessionSecret = require('express-session');
const passport = require('passport');
const { Strategy } = require('passport-local');
const apply = require('./apply');
const register = require('./register');
const admin = require('./admin');
const applications = require('./applications');
const login = require('./login');





/* todo sækja stillingar úr env */

if (!sessionSecret) {
  console.error('Add SESSION_SECRET to .env');
  process.exit(1);
}

const app = express();

/* todo stilla session og passport */

app.use(express.urlencoded({ extended: true }));

//passport
app.use(sessionSecret({
  secret: sessionSecret,
  resave: false,
  saveUninitialized: false,
  maxAge: 20 * 1000,
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));

/**
 * Hjálparfall til að athuga hvort reitur sé gildur eða ekki.
 *
 * @param {string} field Middleware sem grípa á villur fyrir
 * @param {array} errors Fylki af villum frá express-validator pakkanum
 * @returns {boolean} `true` ef `field` er í `errors`, `false` annars
 */
function isInvalid(field, errors) {
  return Boolean(errors.find(i => i.param === field));
}

app.locals.isInvalid = isInvalid;

/* todo setja upp login og logout virkni */

app.use('/', apply);
app.use('/register', register);
app.use('/applications', applications);
app.use('/admin', admin);

function notFoundHandler(req, res, next) { // eslint-disable-line
  res.status(404).render('error', { page: 'error', title: '404', error: '404 fannst ekki' });
}

function errorHandler(error, req, res, next) { // eslint-disable-line
  console.error(error);
  res.status(500).render('error', { page: 'error', title: 'Villa', error });
}

app.use(notFoundHandler);
app.use(errorHandler);

const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, hostname, () => {
  console.info(`Server running at http://${hostname}:${port}/`);
});
