angular.module('phoneList').
	component('omleidRoute', {
		template: `


		<table>
			<thead>
				<tr>
					<th>VG pad</th>
					<th>+Tijd</th>
					<th>Drpg</th>
				</tr>
			</thead>
			<tbody>
				<tr >
					<td>
					{{omleidRouteController.omleidRoute.padindicator}}
					</td>
					<td>
					{{omleidRouteController.omleidRoute.extraRijtijd}}
					</td>
					<td>
					 <omleid-details omleidactiviteiten="omleidRouteController.omleidRoute.omleidactiviteiten"></omleid-details>
					</td>

				</tr>
			</tbody>
		</table>

		`,
		controller: ['Vsm',
			function OmleidrouteController() {
				this.$onInit = function() {
					console.log(this.omleidRoute);
				};
			}
		],
		bindings: {
			omleidRoute: '<'
		},
		controllerAs: 'omleidRouteController'
	});


// 	<div class="omleidroute-row">
// 	<div class="omleidroute-meta">
// 		{{omleidRouteController.omleidRoute.treinType}}
// 	</div>
// 	<div>
// 		<div class="omleidroute-details">
// 			<div>Drglpt</div>
// 			<div>Act</div>
// 			<div>Tijd</div>
// 		</div>
// 		<div class="omleidroute-details" ng-repeat="activiteit in omleidRouteController.omleidRoute.omleidactiviteiten">
// 			<div>{{activiteit.dienstregelpuntCode}}</div>
// 			<div>{{activiteit.activiteitSoort}}</div>
// 			<div>{{activiteit.bupTijd}}</div>
// 		</div>
// 	</div>
// </div>

{/* <table>
<thead>
	<tr>
		<th>VG pad</th>
		<th>+Tijd</th>
		<th></th>
	</tr>
</thead>
<tbody>
	<tr>
		<td>
		{{omleidRouteController.omleidRoute.padindicator}}
		</td>
		<td>
		{{omleidRouteController.omleidRoute.extraRijtijd}}
		</td>
		<td>
		 <omleid-details omleidactiviteiten="omleidRouteController.omleidRoute.omleidactiviteiten"></omleid-details>
		</td>

	</tr>
</tbody>
</table> */}

// 	<div class="flex-grid">
// 	<div class="col omleidroute-drgp">
// 		<div>Serie</div><div>5684</div><div>&nbsp;</div><div>&nbsp;</div><div>79100</div>
// 	</div>
// 	<div class="col omleidroute-drgp">
// 		<div>+Tijd</div><div>56</div><div>&nbsp;</div><div>&nbsp;</div><div>70</div>
// 	</div>
// 	<div class="col omleidroute-drgp">
// 		<div>Toelichting</div><div>Toelichting is niet nodig maar hoe lang kan deze worden?</div><div>&nbsp;</div><div>&nbsp;</div><div>wordt dit u</div>
// 	</div>
// 	<div class="col omleidroute-drgp">
// 		<div>Nr</div><div>wordt dit?</div><div>wordt dit u</div>
// 	</div>
// 	<div class="col omleidroute-drgp">
// 		<div>Drgp</div><div>wordt dit?</div><div>wordt dit u</div><div>wordt dit?</div><div>wordt dit u</div>
// 	</div>
// 	<div class="col omleidroute-drgp">
// 		<div>Act</div><div>wordt dit?</div><div>wordt dit u</div><div>wordt dit?</div><div>wordt dit u</div>
// 	</div>
// 	<div class="col omleidroute-drgp">
// 		<div>Tijd</div><div>wordt dit?</div><div>wordt dit u</div><div>wordt dit?</div><div>wordt dit u</div>
// 	</div>
// 	<div class="col omleidroute-drgp">
// 		<div>Spoor</div><div>wordt dit?</div><div>wordt dit u</div><div>wordt dit?</div><div>wordt dit u</div>
// 	</div>
// 	<div class="col omleidroute-drgp">
// 		<div>Via</div><div>wordt dit?</div><div>wordt dit u</div><div>wordt dit?</div><div></div>
// 	</div>
//   </div>