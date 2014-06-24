<%@ taglib uri="http://jawr.net/tags" prefix="jawr" %>
<!DOCTYPE html>
<html>
<head>
	<title>A website</title>
    <jawr:script src="/bundles/thirdparty-libs.js"/>
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

        #cy {
	        /*margin-top: 100px;*/
            min-height: 900px;
	        /*margin-left: 100px;*/
            height: 100%;
            width: 90%;
            position: absolute;
            left: 100px;
            top: 100px;
            background-color: lightgrey;

        }
        .layersNav a {
            display: block;
        }
        .layersNav a.hasError {
            color: red;
        }
        em {
            font-weight: bold;
        }

	    div.dialog {
		    border: 1px solid black;
		    font-size: 11px;
		    background: darkgray;
		    position: absolute;
		    display: block;
		    z-index:50;
		    /*opacity: 100;*/
	    }
    </style>

</head>

<body ng-app="nwizApp" ng-controller="nwizController">

<div class="layersNav">
    <a ng-click="toggleLayer(0)">overview</a>
    <a ng-repeat="i in [1, 2, 3, 4]" ng-click="toggleLayer(i)" ng-class="{hasError: true}">{{servernames[i-1]}}</a>
</div>

<div id="cys" class="square-box1">
    <div id="hcy" class='square-content1'>
	    <div class="dialog" ng-show="dialogShow">
            <div>
                <span><em>{{currentNode.name}}</em>:</span>
                <span>{{currentNode.status}}</span>
            </div>
		    <span ng-show="currentNode.endpoint">{{currentNode.endpoint}}</span>
	    </div>
        <div id="cy"> </div>
    </div>

</div>

</body>

</html>
