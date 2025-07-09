const express = require("express");
const { submitMarks } = require("../controllers/lecturerController");

const router = express.Router();

router.post("/marks", submitMarks);

module.exports = router;
