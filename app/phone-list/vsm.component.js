angular.module('phoneList').
  component('vsm', {
    template: `

	<omleidings-routes omleidings-routes="vsmController.vsm.omleidingsroute"><omleidings-routes>
	`,
    controller: ['Vsm',
      function VsmController(Vsm) {
		this.vsm = Vsm.query();
		this.vsm.omleidingsroute;
      }
    ],
	controllerAs:'vsmController'
  });
// {{vsmController.vsm.omleidingsroute}}