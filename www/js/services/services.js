/**
 * Minds::mobile
 * Services loader. All services must be set here. 
 * 
 * @author Mark Harding
 */

define(function(require) {

	'use strict';

	var angular = require('angular'), 
		config = require('config'), 
		services = angular.module('app.services', ['app.config']);

	services.factory('NewsfeedAPI', require('services/api/Newsfeed'));

	return services;

}); 