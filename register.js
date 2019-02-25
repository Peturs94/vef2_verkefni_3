const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const { insert, query } = require('./users');

const router = express.Router();
/**
 * Higher-order fall sem umlykur async middleware með villumeðhöndlun.
 *
 * @param {function} fn Middleware sem grípa á villur fyrir
 * @returns {function} Middleware með villumeðhöndlun
 */
function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

/**
 * Hjálparfall sem XSS hreinsar reit í formi eftir heiti.
 *
 * @param {string} fieldName Heiti á reit
 * @returns {function} Middleware sem hreinsar reit ef hann finnst
 */
function sanitizeXss(fieldName) {
  return (req, res, next) => {
    if (!req.body) {
      next();
    }

    const field = req.body[fieldName];

    if (field) {
      req.body[fieldName] = xss(field);
    }

    next();
  };
}


function findUser(user) {
  const q = 'SELECT * FROM users WHERE username = $1';
  return query(q, [user]);
}



// Fylki af öllum validations fyrir umsókn
const validations = [
  check('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),
  check('email')
    .isLength({ min: 1 })
    .withMessage('Netfang má ekki vera tómt'),
  check('email')
    .isEmail()
    .withMessage('Netfang verður að vera netfang'),
  check('username')
    .isLength({ min: 1 })
    .withMessage('Notendanafn má ekki vera tómt'),
  check('username')
    .custom(async (val) => {
      const result = await findUser(val);
      return result.rowCount === 0;
    }).withMessage('Notendanafn núþegar til'),
  check('password1')
    .isLength({ min: 8 })
    .withMessage('lykilorð þarf að vera minnst 8 stafir'),
  check('password2')
    .isLength({ min: 8 })
    .withMessage('lykilorð þarf að vera minnst 8 stafir'),
  check('password1')
    .custom((val, { req }) => val === req.body.password2)
    .withMessage('lykilorð verða að vera eins'),
];

const sanitazions = [
  sanitize('name').trim().escape(),
  sanitizeXss('name'),

  sanitizeXss('email'),
  sanitize('email').trim().normalizeEmail(),

  sanitizeXss('username'),
  sanitize('username').trim().escape(),
];
  // Fylki af öllum hreinsunum fyrir umsókn
/**
 * Route handler fyrir form umsóknar.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {string} Formi fyrir umsókn
 */
function register(req, res) {
  const data = {
    username: '',
    password1: '',
    password2: '',
    name: '',
    email: '',
    admin: false,
    errors: [],
  };
  res.render('register', { title: 'Nýskráning', data, page: 'register' });
}

/**
 * Route handler fyrir form umsóknar.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 * @returns Næsta middleware í lagi annars villa
 */

function showErrors(req, res, next) {
  const {
    body: {
      name = '',
      email = '',
      username = '',
      password1 = '',
      password2 = '',
      admin = false,
    } = {},
  } = req;

  const data = {
    username,
    password1,
    password2,
    name,
    email,
    admin,
  };

  const validation = validationResult(req);
  if (!validation.isEmpty()) {
    const errors = validation.array();
    data.errors = errors;
    const title = 'Nýskráning - vandræði';

    return res.render('register', { title, data, page: 'register' });
  }
  return next();
}

/**
 * Ósamstilltur route handler sem vistar gögn
 * í gagnagrunn og sendir á þakkarsíðu
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */


async function formPost(req, res) {
  const {
    body: {
      name = '',
      email = '',
      username = '',
      password1 = '',
      password2 = '',
      admin = false,
    } = {},
  } = req;

  const data = {
    name,
    email,
    username,
    admin,
  };
  data.password = password1;
  await insert(data);
  return res.redirect('/register/thanks');
}

function thanks(req, res) {
  return res.render('thanks', { title: 'Takk fyrir umsókn, skráðu þig inn' });
}

router.get('/', register);

router.get('/thanks', thanks);

router.post(
  '/',
  // Athugar hvort form sé í lagi
  validations,
  // Ef form er ekki í lagi, birtir upplýsingar um það
  showErrors,
  // Öll gögn í lagi, hreinsa þau
  sanitazions,
  // Senda gögn í gagnagrunn
  catchErrors(formPost),
);

module.exports = router;
