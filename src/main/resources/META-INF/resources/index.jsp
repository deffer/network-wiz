<!DOCTYPE html>
<html>
<head>
	<title>A website</title>

    <script data-main="main.js" src="libs/require.js"></script>


    <!--
    <script src="libs/jquery.min.js"></script>
    <script src="libs/angular.min.js"></script>
    <script src="libs/underscore-min.js"></script>
    <script src="libs/arbor.js"></script>
    <script src="libs/cytoscape.js"></script>

    <script src="js/my.js"></script>
    <script src="js/myDataSource.js"></script>
    <script src="js/graphManipulationService.js"></script>
    <script src="js/dataManipulationService.js"></script>
    <script src="js/layoutsFactory.js"></script>
    -->
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

        div.divLegend{
            margin-top: 100px;
        }
        .legendcy {
            min-height: 250px;
            max-height: 250px;
            min-width: 140px;
            max-width: 140px;
            display: block;
            border: black solid 1px;
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
            cursor: default;
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

<body ng-controller="nwizController">

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

<div class="divLegend">
    <label>Status</label>
    <div id="legendcy" class="legendcy"></div>
</div>


<div id="hcy">
    <div class="dialog" ng-show="dialogShow">
        <div>
            <span class="title">{{currentNode.name}}:</span>
            <span>{{currentNode.status}}</span>
        </div>
        <div><span ng-show="currentNode.version">Version: {{currentNode.version}}</span></div>
        <div><span ng-show="currentNode.endpoint">{{currentNode.endpoint}}</span></div>
        <div><span ng-show="currentNode.context">Context: {{currentNode.context}}</span></div>
        <div><span ng-show="currentNode.topic">Topic: {{currentNode.topic}}</span></div>
        <div><span ng-show="currentNode.logs">Logs: <a href="{{currentNode.logs}}" target="_blank">open</a></span></div>
    </div>

    <div id="maincy" class="cy" ng-show="maincy"> </div>
    <div id="hiddency" class="cy" ng-show="!maincy"> </div>
</div>


</body>

</html>
