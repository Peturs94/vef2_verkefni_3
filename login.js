const xss = require('xss');
const express = require('express');
const { check, validationResult } = require('express-validator/check');
const { sanitize } = require('express-validator/filter');

const { insert } = require('./db');

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

const router = express.Router();

// Fylki af öllum validations fyrir umsókn
const validations = [
  check('username')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),

  check('password')
    .withMessage('Rangt lykilorð'),
];

// Fylki af öllum hreinsunum fyrir umsókn
const sanitazions = [
  sanitize('username').trim().escape(),
  sanitizeXss('username'),

  sanitizeXss('password'),
  sanitize('password').trim().normalizeEmail(),
];

/**
 * Route handler fyrir form umsóknar.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {string} Formi fyrir umsókn
 */
function login(req, res) {
  const data = {
    title: 'Innskráning',
    username: '',
    password: '',
    errors: [],
    page: 'login',
  };
  res.render('login', data);
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
        body:{
            username = '',
            password = '',
        } = {},
    } = req;

    const data = {
        username,
        password,
    };

    const validation = validationResult(req);

    if(!validation.isEmpty()) {
        const errors = validation.array();
        data.errors = errors;
        data.title = 'Innskráning - vandræði';

        return res.render('login', data);
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
        body:{
            username = '',
            password = '',
        } = {},
    } = req;

    const data = {
        username,
        password,
    };
    
    await insert(data);

    return res.redirect('/thanks');
}

function thanks(req, res) {
    return res.render('thanks', { title: 'Takk fyrir umsókn, skráðu þig inn'});
}

router.get('/', login);

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
