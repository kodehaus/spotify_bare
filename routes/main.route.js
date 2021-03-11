const express = require('express');
const router = express.Router();
var { config } = require('../config');



router.post('/', asyncHandler(async (req, res) => {
    console.log('up in here');
    res.json('hello');
  }));







  module.exports = router;











// function to wrap all routes in a try catch block
function asyncHandler (cb) {
    return async (req, res, next) => {
      try {
        await cb(req, res, next);
      } catch (err) {
        next(err);
      }
    };
  }

