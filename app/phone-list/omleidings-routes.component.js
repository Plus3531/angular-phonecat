
function moveArrayItemToNewIndex(arr, old_index, new_index) {
	if (new_index >= arr.length) {
		var k = new_index - arr.length + 1;
		while (k--) {
			arr.push(undefined);
		}
	}
	arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
	return arr;
};

function setSequenceNos(omleidactiviteiten) {
	return omleidactiviteiten.reduce((acc, cur, idx) => {
		cur.volgnummer = idx + 1;
		acc.push(cur);
		return acc;
	}, []);
}

angular.module('phoneList').
	component('omleidingsRoutes', {
		templateUrl: 'phone-list/omleidings-routes.template.html',

		//value="$parent.$index" ng-change="omleidingsRoutesController.routeSelected(args)"  ng-model="omleidingsRoutesController.route.index"
		controller: function OmleidingsRoutesController() {
			this.save = () => {
				console.log(JSON.stringify(this.goederenTreinRoutes));
			};

			this.moveUp = (idx1, idx2) => {
				if (idx2 === 0) {
					return;
				}
				const reOrdered = moveArrayItemToNewIndex(this.goederenTreinRoutes[idx1].omleidactiviteiten, idx2, idx2 - 1);
				this.goederenTreinRoutes[idx1].omleidactiviteiten = setSequenceNos(reOrdered);
			};
			this.moveDown = (idx1, idx2) => {
				if (this.goederenTreinRoutes[idx1].omleidactiviteiten.length - 1 <= idx2) {
					return;
				}
				const reOrdered = moveArrayItemToNewIndex(this.goederenTreinRoutes[idx1].omleidactiviteiten, idx2, idx2 + 1);
				this.goederenTreinRoutes[idx1].omleidactiviteiten = setSequenceNos(reOrdered);
			};
			this.deleteDRPG = (idx1, idx2) => {
				if (this.goederenTreinRoutes[idx1].omleidactiviteiten.length === 1) {
					//remove the whole route
					this.goederenTreinRoutes = this.goederenTreinRoutes.reduce((acc, cur, idx) => {
						if (idx !== idx1) {
							acc.push(cur);
						}
						return acc;
					}, []);
					if (this.goederenTreinRoutes.length === 0) {
						this.route.index = -1;
					} else {
						this.route.index = 0;
					}
				} else {
					const deletedOne = this.goederenTreinRoutes[idx1].omleidactiviteiten.reduce((acc, cur, idx) => {
						if (idx !== idx2) {
							acc.push(cur);
						}
						return acc;
					}, []);
					this.goederenTreinRoutes[idx1].omleidactiviteiten = setSequenceNos(deletedOne);
				}
			};

			this.checkBupTijd = (value, elementName) => {
				const validityMsg = 'Tijd is niet in minuten tussen 0 en 59.';
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
			this.addRoute = (index) => {
				const l = this.goederenTreinRoutes.push({
					padindicator: true,
					treinType: 'G',
					extraRijtijd: 0,
					omleidactiviteiten: [{
						dienstregelpuntCode: '',
						activiteitSoort: 'V',
						bupTijd: '0',
						volgnummer: 1
					}]
				});
				this.route.index = l - 1;
			};
			
			this.addDRPT = (index) => {
				const maxNo = this.goederenTreinRoutes[index].omleidactiviteiten.reduce((acc, cur) => {
					acc = cur.volgnummer > acc ? cur.volgnummer : acc;
					return acc;
				}, 0);
				this.goederenTreinRoutes[index].omleidactiviteiten.push({
					dienstregelpuntCode: '',
					activiteitSoort: 'V',
					bupTijd: '0',
					volgnummer: maxNo + 1
				});
			}
		},
		bindings: {
			omleidingsRoutes: '<'
		},
		controllerAs: 'omleidingsRoutesController'
	});
