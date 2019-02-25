const express = require('express');
const { select, setAdmin, setAdminFalse } = require('./users');
const { ensureLoggedIn } = require('./utils');

const router = express.Router();

function catchErrors(fn) {
  return (req, res, next) => fn(req, res, next).catch(next);
}

async function admin(req, res) {
  const list = await select();

  res.render('admin', { title: 'Notendalisti', list, page: 'admin' });
}

async function adminUser(req, res) {
  await setAdminFalse();
  const usernames = req.body.admin;
  await setAdmin(usernames);

  const list = await select();
  res.render('admin', { title: 'Notendalisti', list, page: 'admin' });
}

router.get('/', ensureLoggedIn, catchErrors(admin));
router.post('/', adminUser);

module.exports = router;
