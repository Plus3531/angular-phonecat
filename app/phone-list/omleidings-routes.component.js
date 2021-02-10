angular.module('phoneList').
	component('omleidingsRoutes', {
		templateUrl: 'phone-list/omleidings-routes.template.html',

		//value="$parent.$index" ng-change="omleidingsRoutesController.routeSelected(args)"  ng-model="omleidingsRoutesController.route.index"
		controller: function OmleidingsRoutesController() {
			this.checkBupTijd = (value, elementName) => {
				const validityMsg =  'Tijd is niet in minuten tussen 0 en 59.';
				let valid = true;
				const integer = parseInt(value, 10);
				if (!integer && integer !== 0) {
					valid = false;
				} else if (integer < 0 || integer > 59) {
					valid = false;
				}
				this.omleidingsRouteForm[elementName].$setValidity(validityMsg, valid);
			}
			this.routeSelected = (args) => {
				console.log(`changed: ${args}, this.route.index: ${this.route.index}`);
			};
			this.checkIt = () => {
				console.log(JSON.stringify(this.goederenTreinRoutes));
			};
			this.$onInit = () => {
				this.route = {index: 0};
			};
			this.$onChanges = (changes) => {
				if (changes.omleidingsRoutes.currentValue) {
					this.goederenTreinRoutes = changes.omleidingsRoutes.currentValue.filter(r => r.treinType === 'G');

				};
			};
			this.addRoute = () => {
				this.goederenTreinRoutes.push({
					padindicator: true,
					treinType: 'G',
					extraRijtijd: 0,
					omleidactiviteiten: [{
						dienstregelpuntCode: '',
						activiteitSoort: 'V',
						bupTijd: '0',
						volgnummer: 1
					}]
				})
			}
		},
		bindings: {
			omleidingsRoutes: '<'
		},
		controllerAs: 'omleidingsRoutesController'
	});
