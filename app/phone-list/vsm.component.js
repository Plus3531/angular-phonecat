angular.module('phoneList').
  component('vsm', {
    template: `
	<omleidings-routes omleidings-routes="vsmController.vsm.omleidingsroute" is-valid-binding="vsmController.omleidingsRoutesAreValid"><omleidings-routes>
	`,
    controller: ['Vsm',
      function VsmController(Vsm) {
		this.vsm = Vsm.query();
		this.vsm.omleidingsroute;

		this.omleidingsRoutesAreValid = function(areValid) {
			console.log(areValid);
		};
      }
    ],
	controllerAs:'vsmController'
  });
// {{vsmController.vsm.omleidingsroute}}