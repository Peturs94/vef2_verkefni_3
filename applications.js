const express = require('express');

const { select, update, deleteRow } = require('./db');

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
 * Ósamstilltur route handler fyrir umsóknarlista.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns {string} Lista af umsóknum
 */
async function applications(req, res) {
  const list = await select();

  const data = {
    title: 'Umsóknir',
    list,
  };

  return res.render('applications', data);
}

/**
 * Ósamstilltur route handler sem vinnur úr umsókn.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns Redirect á `/applications`
 */
async function processApplication(req, res) {
  const { id } = req.body;

  await update(id);

  return res.redirect('/applications');
}

/**
 * Ósamstilltur route handler sem hendir umsókn.
 *
 * @param {object} req Request hlutur
 * @param {object} res Response hlutur
 * @returns Redirect á `/applications`
 */
async function deleteApplication(req, res) {
  const { id } = req.body;

  await deleteRow(id);

  return res.redirect('/applications');
}

router.get('/', catchErrors(applications));
router.post('/process', catchErrors(processApplication));
router.post('/delete', catchErrors(deleteApplication));

module.exports = router;
