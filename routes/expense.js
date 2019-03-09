var express = require('express');
var router = express.Router();
var connection = require('../database/connection');
function lastDay(y,m){
  return  new Date(y, m, 0).getDate();
};

function currentDate(){
  var today = new Date();
  var dd = today.getDate();
  var mm = today.getMonth() + 1; //January is 0!
  var yyyy = today.getFullYear();
      if (dd < 10) {
        dd = '0' + dd;
      }

      if (mm < 10) {
        mm = '0' + mm;
      }

      //today = mm + '-' + dd + '-' + yyyy;
      today = yyyy + '-' + mm + '-' + dd;
  return today;
};

function getDateRange(range){
  var dateRange = {};
  var today = new Date();
  var mm = today.getMonth() + 1; //January is 0!
  if (mm < 10) { mm = '0' + mm; };
  var yyyy = today.getFullYear();

  if(range=='today')
  {
    var date = yyyy + '-' + mm + '-' + today.getDate() ;
    var range = {
      startDate : date,
      endDate : date
    }
    dateRange = range;
  }
  else if(range=='week')
  {
    var first = today.getDate() - today.getDay(); // First day is the day of the month - the day of the week
    var last = first + 6; // last day is the first day + 6

    var firstday = new Date(today.setDate(first));
    var lastday = new Date(today.setDate(last));

    var startWeekDate = yyyy + '-' + mm + '-' + firstday.getDate() ;
    var lastWeekDate = yyyy + '-' + mm + '-' + lastday.getDate() ;

    var range = {
      startDate : startWeekDate,
      endDate : lastWeekDate
    }
    dateRange = range;
    
  }
  else
  {
    var startDate = yyyy + '-' + mm + '-' + '01';
    var lDay = lastDay(yyyy,mm)
    var lastDate = yyyy + '-' + mm + '-' + lDay;
    var range = {
      startDate:startDate,
      endDate:lastDate
    };
    dateRange = range;
  }
  return dateRange;
}


var getExpense = function (req, res) {
  let messengerId = req.params.mid;
  var rangeStr = req.query["time"];


  var range = getDateRange(rangeStr);
  console.log(range);
  var startDate = range.startDate;
  var endDate = range.endDate;

  const query = `SELECT * FROM expense 
                 WHERE user=${messengerId} AND date BETWEEN '${startDate}' AND '${endDate}'
                 ORDER BY date`;

  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }
    
    //return res.status(200).send(result);
    res.render('expense', {result: result})

  });
};

var insertExpense = function (req, res) {
  const { amount, category , item} = req.body;
  var user_id = req.params.mid;
  var date=currentDate();
  console.log(date);
  const query = `INSERT INTO expense (amount,category,user,date,item)
                 VALUES (${amount},'${category}',${user_id},'${date}','${item}')`;
  
  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }

    return res.status(200).send(result);
  });
}

router.get('/expense/:mid', getExpense);
router.post('/expense/:mid',insertExpense);

module.exports = router;