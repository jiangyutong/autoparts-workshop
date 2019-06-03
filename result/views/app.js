var app = angular.module('catsvsdogs', []);
var socket = io.connect({transports:['polling']});

var bg1 = document.getElementById('background-stats-1');
var bg2 = document.getElementById('background-stats-2');
var products=[];
var productLike=[];


//Get the context of the Chart canvas element we want to select
var ctx = $("#column-chart");

// Chart Options
var chartOptions = {
    // Elements options apply to all of the options unless overridden in a dataset
    // In this case, we are setting the border of each bar to be 2px wide and green
    elements: {
        rectangle: {
            // 条的轮廓描边宽度（以像素为单位）
            borderWidth: 2,
            // 条形图轮廓描边的颜色
            borderColor: 'rgb(0, 255, 0)',
            // 哪个边缘跳过绘制边框
            borderSkipped: 'bottom'
        }
    },
    // 长宽，100%。如果要单设长和宽的话，要将responsive 设为false
    responsive: true,
    // 设置不做动画
    animation: false,
    // 缩放时保持长宽比
    maintainAspectRatio: false,
    // 缩放时绘制图标时间
    responsiveAnimationDuration:500,
    legend: {//title下面的 小标题 和 小图的配置
        display: false, //不显示
        position: 'top', //显示的位置
    },
    scales: {//对x，y轴进行个人配置及对 网格等进行个性化配置都写在此处
        xAxes: [{//对X轴进行配置
            display: true,
            gridLines: {//Y轴网格配置
                color: "#f3f3f3",
                drawTicks: false,//如果为true，则在图表旁边的轴区域中线旁绘制线条
            },
            scaleLabel: {//标签显示
                display: true,
            },
            ticks: {//对Y轴开始配置
                fontSize: 14,
                padding: 8
            }
        }],
        yAxes: [{//对Y轴进行配置
            display: true,
            gridLines: {
                color: "#f3f3f3",
                drawTicks: false,
            },
            scaleLabel: {
                display: true,
            },
            ticks: {
                beginAtZero: true,
                stepSize: 1
            }
        }]
    },
    title: {
        display: false,
        text: 'Chart.js Bar Chart'
    }
};

// Chart Data
var chartData = {
    labels: products,
    datasets: [{
        label: "Like",
        data: productLike,
        backgroundColor: "#28D094",
        hoverBackgroundColor: "rgba(22,211,154,.9)",//鼠标悬停背景色
        borderColor: "transparent"
    }]
};

var config = {
    // 图表类型：bar-柱状图，line-折线图，radar-雷达图...
    type: 'bar',
    // 图表样式设置
    options : chartOptions,
    // 数据结构
    data : chartData
};

// Create the chart创建图表（参数1：创建图表变量，参数2：数据集）
var lineChart = new Chart(ctx, config);

// AngularJS指令，用于定义一个控制器
app.controller('statsCtrl', function($scope){

    var updateScores = function(){
    //接收server.js发送的action命令和data数据
    socket.on('scores', function (json) {
       data = JSON.parse(json);
       // parseInt(string,radix)，当radix省略或为0，会根据string来判断数字基数
       var a = parseInt(data.a || 0);
       var b = parseInt(data.b || 0);
       var c = parseInt(data.c || 0);
       var d = parseInt(data.d || 0);
       var e = parseInt(data.e || 0);
       var f = parseInt(data.f || 0);

        $scope.a=a;
        $scope.b=b;
        $scope.c=c;
        $scope.d=d;
        $scope.e=e;
        $scope.f=f;

        var products=["空气滤芯","汽车电瓶","刹车片","汽油滤芯","电瓶搭火线","刹车钳"];
        var productLike=[a,b,c,d,e,f];
        products=products;
        productLike=productLike;

        lineChart.data={
            labels: products,
            datasets: [{
                label: "Like",
                data: productLike,
                backgroundColor:[
                    "rgba(255, 99, 132, 0.7)",
                    "rgba(255, 159, 64, 0.7)",
                    "rgba(255, 205, 86, 0.7)",
                    "rgba(75, 192, 192, 0.7)",
                    "rgba(54, 162, 235, 0.7)",
                    "rgba(153, 102, 255, 0.7)"
                ],
                borderColor:[
                    "rgb(255, 99, 132)",
                    "rgb(255, 159, 64)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(54, 162, 235)",
                    "rgb(153, 102, 255)"
                ],
                hoverBackgroundColor: "rgba(22,211,154,.9)",
                borderColor: "transparent"
            }]
        };
        lineChart.update();

        $scope.$apply(function () {
         $scope.total = a + b + c + d +e + f;
       });
    });
  };

  var init = function(){
    document.body.style.opacity=1;
    updateScores();
  };
  socket.on('message',function(data){
    init();
  });
});

function getPercentages(a, b) {
  var result = {};

  if (a + b > 0) {
    result.a = Math.round(a / (a + b) * 100);
    result.b = 100 - result.a;
  } else {
    result.a = result.b = 50;
  }

  return result;
}