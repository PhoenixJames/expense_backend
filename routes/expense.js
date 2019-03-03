var express = require('express');
var router = express.Router();
var connection = require('../database/connection');

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
function calculate(possible,fav){
    var perc="";
    if(isNaN(possible) || isNaN(fav)){
      perc=" ";
    }
    else{
      perc = ((fav/possible) * 100).toFixed(2)+" %";
    }

    return perc;
}

var getMonthlyExpense = function (req, res) {
  let id = req.params.id;

  const query = `select Sum(amount) as amount , category , 
                (select sum(amount) from expense where date between '2019-03-01' and '2019-03-30') as total 
                from expense 
                where date between '2019-03-01' and '2019-03-30' 
                group by category`;

  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }
    var resultObject;
    var resultArray=[];
    result.forEach(function(data) {
      var percent = calculate(data.total,data.amount);
      console.log(percent);
      resultObject = {
                          amount:data.amount,
                          percent:percent, 
                          category:data.category

                      };
      resultArray.push(resultObject);
    }, this);
    
    return res.status(200).send(resultArray);
  });
};



var insertExpense = function (req, res) {
  const { expense_amount, category } = req.body;
  var string = JSON.stringify(req.body);
  var objectValue = JSON.parse(string);
  var user_id = objectValue['messenger user id'];
  var date=currentDate();
  console.log(date);
  const query = `INSERT INTO expense (amount,category,user,date)
                 VALUES (${expense_amount},'${category}',${user_id},'${date}')`;
  
  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }

    return res.status(200).send(result);
  });
}

router.get('/monthly', getMonthlyExpense);
router.post('/insert',insertExpense);

module.exports = router;