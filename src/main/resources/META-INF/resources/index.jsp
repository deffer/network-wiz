<%@ taglib uri="http://jawr.net/tags" prefix="jawr" %>
<!DOCTYPE html>
<html>
<head>
	<title>A website</title>
    <jawr:script src="/bundles/core-libs.js"/>
    <meta charset=utf-8 />
    <style type="text/css">
        body {
            font: 14px helvetica neue, helvetica, arial, sans-serif;
        }


        .square-box{
            position: relative;
            width: 50%;
            overflow: hidden;
            /*background: #4679BD;*/
        }
        .square-box:before{
            content: "";
            display: block;
            padding-top: 50%;
        }
        .square-content{
            position:  absolute;
            top: 0;
            left: 0;
            bottom: 0;
            right: 0;
            color: white;
        }
        .square-content div {
            display: table;
            width: 100%;
            height: 100%;
        }
        .square-content span {
            display: table-cell;
            text-align: center;
            vertical-align: middle;
            color: white
        }

        #ccy {
            height: 100%;
            width: 100%;
            position: absolute;
            left: 0;
            top: 0;
            /*background-color: green;*/
        }
    </style>

</head>

<body ng-app="nwizApp" ng-controller="nwizController">

<div><a id = "thelink" ng-click="toggleStatus()">Toggle</a> </div>

<div id="cys" class="square-box">
    <div id="hcy" class='square-content'>
        <div id="cy"> </div>
    </div>

</div>

</body>

</html>
