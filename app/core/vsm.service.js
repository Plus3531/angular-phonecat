'use strict';

angular.
	module('core.vsm').
	factory('Vsm', ['$resource',
		function($resource) {
			return $resource('vsm/vsm.json', {}, {
				query: {
					method: 'GET'
				}
			});
		}
	]);
