angular.module('phoneList').
	component('omleidDetails', {
		template: `
		<table>
			<thead>
				<tr>
					<th>Drglp</th>
					<th>Act</th>
					<th>+Tijd</th>
				</tr>
			</thead>
			<tbody>
				<tr ng-repeat="activiteit in omleidDetailsController.omleidactiviteiten">
					<td>
					{{activiteit.dienstregelpuntCode}}
					</td>
					<td>
					{{activiteit.activiteitSoort}}
					</td>
					<td>
					{{activiteit.bupTijd}}
					</td>
				</tr>
			</tbody>
		</table>

		`,
		controller:
			function OmleidDetailsController() {
				this.$onInit = function() {

				};
			}
		,
		bindings: {
			omleidactiviteiten: '<'
		},
		controllerAs: 'omleidDetailsController'
	});