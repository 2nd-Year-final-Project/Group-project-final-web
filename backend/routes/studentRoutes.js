const express = require("express");
const { submitCommonData, submitSubjectData } = require("../controllers/studentController");
const { getStudentName } = require("../controllers/studentController");

const router = express.Router();

router.get("/name/:username", getStudentName);
router.post("/common", submitCommonData);
router.post("/subject", submitSubjectData);

module.exports = router;
