const express = require("express");
const User = require("../models/User");

const router = express.Router();

router.post("/test-user", async (req, res) => {
    try {
      const user = await User.create(req.body);
  
      res.status(201).json(user);
    } catch (error) {
      res.status(500).json({
        message: error.message,
      });
    }
  });

module.exports = router;