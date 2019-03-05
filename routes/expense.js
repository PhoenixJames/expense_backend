var express = require('express');
var router = express.Router();
var connection = require('../database/connection');

function lastDay(y,m){
  return  new Date(y, m +1, 0).getDate();
}

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
      perc = ((fav/possible) * 100).toFixed(2);
    }

    return perc;
}

var getMonthlyExpense = function (req, res) {
  let messengerId = req.query["messenger user id"];
  console.log(messengerId);
  // var mm = today.getMonth() + 1; //January is 0!
  // var yyyy = today.getFullYear();
  // var startDate = yyyy + '-' + mm + '01';
  // var lastDay = lastDay(yyyy,mm)
  // var lastDate = yyyy + '-' + mm + lastDay;

  const query = `SELECT SUM(amount) AS amount , category , 
                (SELECT SUM(amount) FROM expense WHERE user=${messengerId} and 
                date BETWEEN '2019-03-01' AND '2019-03-30') AS total 
                FROM expense 
                WHERE user=${messengerId} AND date BETWEEN '2019-03-01' AND '2019-03-30'
                GROUP BY category
                ORDER BY amount DESC`;

  connection.query(query, function (err, result) {
    if (err) {
      console.error(err);
      return res.status(400).send(err);
    }
    var resultArray = [];
    var messageArray = [];
    var chartParamArray = [];
    var resultObject;
    var chartParamObject;
    var messageObject;
    var totalAmount;

    result.forEach(function(data) {
      var percent = calculate(data.total,data.amount);
      console.log(percent);
      chartParamObject = {
          percent : percent,
          amount : data.amount,
          category : data.category
      };
      resultObject = {
          "text": `${data.category}:${data.amount} Ks(${percent}%)`
      };
      chartParamArray.push(chartParamObject);
      resultArray.push(resultObject);
      totalAmount = data.total;
    }, this);
    resultArray.push({"text": `TotalAmount:${totalAmount} Ks`});
    var chartString = GenerateImageChart(chartParamArray);
    messageObject = {
        "messages": [
            {
              "attachment": {
                "type": "image",
                "payload": {
                  "url": chartString
                }
              }
            },
            ...resultArray
          ]
    };
    
    return res.status(200).send(messageObject);
  });
};

function GenerateImageChart(dataArray){
  var chartData="";
  var chartLable="";
  var chartDataLable="";
  dataArray.forEach(function(data) {
    chartData+=parseInt(data.percent)+',';
    chartLable+=data.category+'|';
    chartDataLable+=parseInt(data.percent)+'%'+'|';
  }, this);

  var cData = chartData.substring(0,chartData.length-1);
  var cLable = chartLable.substring(0,chartLable.length-1);
  var cDLable = chartDataLable.substring(0,chartDataLable.length-1);
  
  console.log(cData);
  console.log(cLable);

  var baseUrl="https://image-charts.com/chart";
  var chartType = "?cht=p";
  var chartSize = "&chs=400x300";
  var chartDLable=`&chdl=${cLable}`;
  var chartData = `&chd=t:${cData}`;
  var chartLable = `&chl=${cDLable}`;
  var chartColor = '&chco=00FF00|ffff00|66ffff';
  var chf="&chf=ps0-0,lg,45,ffeb3b,0.2,f44336,1|ps0-1,lg,45,8bc34a,0.2,009688,1"

  var chartString = baseUrl+chartType+chartSize+chartData+chartLable+chartColor+chartDLable;
  return chartString;
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

router.get('/monthly/', getMonthlyExpense);
router.post('/insert',insertExpense);

module.exports = router;