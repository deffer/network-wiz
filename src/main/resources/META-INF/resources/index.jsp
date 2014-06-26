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

        .cy {
	        /*margin-top: 100px;*/
            min-height: 900px;
	        /*margin-left: 100px;*/
            height: 100%;
            width: 90%;
            position: absolute;
            left: 150px;
            top: 100px;
            background-color: lightgrey;

        }
        .layersNav{
            margin-top: 300px;
            width: 120px;
        }
        .layersNav a {
            display: block;
            padding: 5px;
            border: black solid 1px;
            border-top: none;
        }
        .layersNav a:first-child {border-top: black solid 1px;}
        .layersNav a:nth-child(even) {background-color: beige;}
        .layersNav a:nth-child(odd) {background-color: aliceblue;}
        .layersNav a.current {background-color: darkgrey;}
        .layersNav a.hasError {color: red;}
        .layersNav a.disabled {color: grey;}

        .dialog .title {
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
    <a ng-click="toggleLayer(0)" ng-disabled="suppressEvents" ng-class="{current: layer == 0 ,disabled: suppressEvents}">Summary
        <span ng-show="hasErrorsOnLayer[0]" style="color: red;">*</span>
    </a>
    <a ng-repeat="i in servernames" ng-click="toggleLayer($index+1)" ng-disabled="suppressEvents"
       ng-class="{current: layer == $index+1, disabled: suppressEvents}">
        {{servernames[$index]}}
        <span ng-show="hasErrorsOnLayer[$index+1]" style="color: red;">*</span>
    </a>
</div>


<div class = "controls">
    <div><label for="bender">Randomize</label>
        <input ng-disabled="suppressEvents" id="bender" type="checkbox" ng-model="randomCoordinates"/>
    </div>
    <div><label for="locked">Locked</label>
        <input ng-disabled="suppressEvents" id="locked" type="checkbox" ng-model="lockedNodes"/>
    </div>
    <button ng-click="dumpCoordinates()" style="display: block;">Dump coordinates</button>
</div>


<div id="hcy">
    <div class="dialog" ng-show="dialogShow">
        <div>
            <span class="title">{{currentNode.name}}:</span>
            <span>{{currentNode.status}}</span>
        </div>
        <span ng-show="currentNode.version">Version: {{currentNode.version}}</span>
        <span ng-show="currentNode.endpoint">{{currentNode.endpoint}}</span>
        <span ng-show="currentNode.context">Context: {{currentNode.endpoint}}</span>
        <span ng-show="currentNode.topic">Topic: {{currentNode.endpoint}}</span>
    </div>

    <div id="maincy" class="cy" ng-show="maincy"> </div>
    <div id="hiddency" class="cy" ng-show="!maincy"> </div>
</div>


</body>

</html>
