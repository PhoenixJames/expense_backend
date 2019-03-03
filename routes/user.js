var express = require('express');
var router = express.Router();
var connection = require('../database/connection');

var getLatest = function (req, res) {
  let year = req.params.year;
  let data=req.params.class;
  const query = `SELECT * FROM assignment WHERE academicYear=${year} AND class='${data}'  
                 ORDER BY assignmentDate DESC,id DESC`;

  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }

    return res.status(200).send(result);
  });
};

var getAssignmentById = function (req, res) {
  let id = req.params.id;

  const query = `SELECT * FROM assignment WHERE id=${id}`;

  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }

    return res.status(200).send(result);
  });
};

var updateAssignmentById = function (req, res) {
  let id = req.params.id;
  const { assignmentDate, period, subject, description,classData } = req.body;

  const query = `UPDATE assignment SET assignmentDate='${assignmentDate}', period=${period}, 
                 subject='${subject}', description='${description}',class='${classData}' WHERE id=${id}`;

  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }

    return res.status(200).send(result);
  });
}

var insertAssignment = function (req, res) {

  const { assignmentDate, period, subject, description,academicYear,classData } = req.body;
  const query = `INSERT INTO assignment (assignmentDate,period,subject,description,academicYear,class) 
                 VALUES ('${assignmentDate}',${period},'${subject}','${description}',${academicYear},'${classData}')`;
  
  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }

    return res.status(200).send(result);
  });
}

var deleteAssignment = function (req, res) {
  let id = req.params.id;

  const query = `DELETE FROM assignment WHERE id=${id}`;

  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }

    return res.status(200).send(result);
  });
}

router.get('/latest/:year/:class', getLatest);
router.get('/:id', getAssignmentById);
router.put('/:id', updateAssignmentById);
router.post('/insert',insertAssignment);
router.post('/delete/:id',deleteAssignment);



module.exports = router;