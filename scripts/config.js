angular.module('configuration', [])

	.constant('CONFIG_ENDPOINT','http://applogdev01.its.auckland.ac.nz:9200/integration/weathermap/')

	.constant('CONFIG_SERVERS',['ormesbdev01', 'ormesbdev02', 'ormesbdev98', 'ormesbdev99']);
