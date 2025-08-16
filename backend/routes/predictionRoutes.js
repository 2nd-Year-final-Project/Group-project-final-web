const express = require("express");
const { getPrediction } = require("../controllers/predictionController");

const router = express.Router();

router.get("/:student_id/:course_id", getPrediction);

module.exports = router;
