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
  check('name')
    .isLength({ min: 1 })
    .withMessage('Nafn má ekki vera tómt'),

  check('email')
    .isLength({ min: 1 })
    .withMessage('Netfang má ekki vera tómt'),

  check('email')
    .isEmail()
    .withMessage('Netfang verður að vera netfang'),

  check('phone')
    .matches(/^[0-9]{3}( |-)?[0-9]{4}$/)
    .withMessage('Símanúmer verður að vera sjö tölustafir'),

  check('text')
    .isLength({ min: 100 })
    .withMessage('Kynning verður að vera að minnsta kosti 100 stafir'),

  check('job')
    .custom(value => ['forritari', 'hönnuður', 'verkefnastjóri'].indexOf(value) >= 0)
    .withMessage('Velja verður starf'),
];

// Fylki af öllum hreinsunum fyrir umsókn
const sanitazions = [
  sanitize('name').trim().escape(),
  sanitizeXss('name'),

  sanitizeXss('email'),
  sanitize('email').trim().normalizeEmail(),

  sanitizeXss('phone'),
  sanitize('phone')
    .trim().blacklist(' ').escape()
    .toInt(),

  sanitizeXss('text'),
  sanitize('text').trim().escape(),

  sanitizeXss('job'),
  sanitize('job').trim().escape(),
];

/**
 * Route handler fyrir form umsóknar.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {string} Formi fyrir umsókn
 */
function form(req, res) {
  const data = {
    name: '',
    email: '',
    phone: '',
    text: '',
    job: '',
    errors: [],
  };
  res.render('form', {
    title: 'Atvinnuumsókn',
    data,
    page: 'apply',
  });
}

/**
 * Route handler sem athugar stöðu á umsókn og birtir villur ef einhverjar,
 * sendir annars áfram í næsta middleware.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @param {function} next Næsta middleware
 * @returns Næsta middleware ef í lagi, annars síðu með villum
 */
function showErrors(req, res, next) {
  const {
    body: {
      name = '',
      email = '',
      phone = '',
      text = '',
      job = '',
    } = {},
  } = req;

  const data = {
    name,
    email,
    phone,
    text,
    job,
  };

  const validation = validationResult(req);

  if (!validation.isEmpty()) {
    const errors = validation.array();
    data.errors = errors;
    const title = 'Avinnuumsókn – vandræði';

    return res.render('form', {
      title,
      data,
      page: 'apply',
      errors: []
    });
  }

  return next();
}

/**
 * Ósamstilltur route handler sem vistar gögn í gagnagrunn og sendir
 * á þakkarsíðu
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
async function formPost(req, res) {
  const {
    body: {
      name = '',
      email = '',
      phone = '',
      text = '',
      job = '',
    } = {},
  } = req;

  const data = {
    name,
    email,
    phone,
    text,
    job,
  };

  await insert(data);

  return res.redirect('/thanks');
}

/**
 * Route handler fyrir þakkarsíðu.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 */
function thanks(req, res) {
  return res.render('thanks', { title: 'Takk fyrir umsóknina', thanksTitle: 'Takk fyrir umsóknina', thanksText: 'Við munum hafa samban innan skamms', page: 'thanks' });  // eslint-disable-line
}

router.get('/', form);
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
