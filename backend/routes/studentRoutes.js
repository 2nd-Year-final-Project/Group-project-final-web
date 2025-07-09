const express = require("express");
const { submitCommonData, submitSubjectData } = require("../controllers/studentController");

const router = express.Router();

router.post("/common", submitCommonData);
router.post("/subject", submitSubjectData);

module.exports = router;
