
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
const getDefaultRouteIndex = (routes) => routes && routes.length > 0 ? 0 : -1;

angular.module('phoneList').
	component('omleidingsRoutes', {
		templateUrl: 'phone-list/omleidings-routes.template.html',

		//value="$parent.$index" ng-change="omleidingsRoutesController.routeSelected(args)"  ng-model="omleidingsRoutesController.route.index"
		controller: function OmleidingsRoutesController($timeout) {
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
					this.route.index = getDefaultRouteIndex(this.goederenTreinRoutes);

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
				const isInvalid = () => false;
				const checkValidity = (input) => {
					const parts = value.split('/');
					return parts.reduce((acc, cur) => {
						//const w = /^[1-5]?[0-9]$/.test(cur);
						const w = /^[1-5]?[0-9]$|^0[0-9]?$/.test(cur);

						const valid = (!w && cur !== '00') ? false : true;
						acc = acc ? valid : false;
						return acc;
					}, true);
				};

				const func = value ? checkValidity : isInvalid;
				this.omleidingsRouteForm[elementName].$setValidity(validityMsg, func(value));
				if (this.isValidBinding) {
					this.isValidBinding()({valid: !this.omleidingsRouteForm.$invalid});
				}
			}
			this.routeSelected = (args) => {
				console.log(`changed: ${args}, this.route.index: ${this.route.index}`);
			};
			this.checkIt = () => {
				console.log(JSON.stringify(this.goederenTreinRoutes));
			};
			this.mycars = [];
			const fill = () => {

				this.mycars = drgps.map(drgp => ({name: drgp.naam, value: drgp.verkorting}));
				this.mycars.sort((a, b) => (a.name > b.name) ? 1 : -1)
				// for (var i = 0; i < 300; i++) {
				// 	const rand = Math.random().toString(36).substring(2, 15);
				// 	this.mycars.push(
				// 	  {name: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15), value: `${i}_${rand}`}
				// 	);
				//   }
			}
			this.$onInit = () => {
				//	$timeout(() => fill());
				fill();
			};
			this.testChanged = (activiteitSoort, elementName) => {
				const drgp = activiteitSoort.split(' (').shift();
				const result = this.mycars.findIndex(
					item => drgp.toLowerCase() === item.value.toLowerCase()
				);
				const isValid = result > -1;
				this.omleidingsRouteForm[elementName].$setValidity('act is not found', isValid);
				//set the model
				if (isValid) {
					const idxs = elementName.split('_').pop();
					this.omleidingsRoutes[idxs.split('-')[0]].omleidactiviteiten[idxs.split('-')[1]].activiteitSoort = this.mycars[result].value;
					this.myValue = this.mycars[result].value;
				} else {

					this.myValue = activiteitSoort;
				}
			}
			this.$onChanges = (changes) => {
				if (changes.omleidingsRoutes.currentValue) {
					this.goederenTreinRoutes = changes.omleidingsRoutes.currentValue;//.filter(r => r.treinType === 'G');
					this.route = {index: getDefaultRouteIndex(this.goederenTreinRoutes)};
				};
			};
			this.addRoute = () => {
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
			this.test = index => console.log(index);
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
			omleidingsRoutes: '<',
			isValidBinding: '&'
		},
		controllerAs: 'omleidingsRoutesController'
	});
const drgps = [
	{
		verkorting: "Zpta",
		naam: "Zutphen Twentekanaal Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dron",
		naam: "Dronten",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wv",
		naam: "Wolvega",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dvnk",
		naam: "De Vink",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zvo",
		naam: "Zevenaar Oost",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Stb",
		naam: "Swifterbant",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Mvt",
		naam: "Rotterdam, Emplacement Maasvlakte",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Hrmk",
		naam: "Harinxmakanaal (brug o/h - tussen Lw en Grou = Jirnsum)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Slfw",
		naam: "Sloe-Frankrijkweg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zspl",
		naam: "Haarlem Zuidelijke Splitsing",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mdb",
		naam: "Middelburg",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hr",
		naam: "Heerenveen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Otw",
		naam: "Oosterhout Weststad",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dhsa",
		naam: "Delfshavense Schie Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hry",
		naam: "Heerenveen IJsstadion",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hrlw",
		naam: "Heerlen Woonboulevard",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dtc",
		naam: "Doetinchem",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mrn",
		naam: "Maarn",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Obpa",
		naam: "Overbrakerpolder Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Kn",
		naam: "Kaldenkirchen (D)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Crao",
		naam: "Crailoo Aansl. Oost",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Zdk",
		naam: "Zaandam Kogerveld",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Asra",
		naam: "Amsterdam Riekerpolder Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ddm",
		naam: "De Diem Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Asdar",
		naam: "Amsterdam ArenA",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Apdo",
		naam: "Apeldoorn Osseveld",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wadt",
		naam: "Waddinxveen Triangel",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "St",
		naam: "Soest",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Odw",
		naam: "Oudewater Wachtspoor",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Esk",
		naam: "Enschede Kennispark",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gw",
		naam: "Grou = Jirnsum",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wd",
		naam: "Woerden",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bsmz",
		naam: "Bussum Zuid",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Stbdro",
		naam: "Swifterbant - Dronten",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Asdta",
		naam: "Amsterdam Transformatoweg Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Almmo",
		naam: "Almere Muziekwijk Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hsrtdv",
		naam: "HSL - Rotterdam Viaduct",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Utln",
		naam: "Utrecht Lunetten",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vsv",
		naam: "Varsseveld",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mmlh",
		naam: "Mook Molenhoek",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Brech",
		naam: "Betuweroute Echteld",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Brv",
		naam: "Bareveld",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rscw",
		naam: "Rail Service Center Waalhaven",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Ahwa",
		naam: "Arnhem West Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Svg",
		naam: "Sas van Gent",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Ese",
		naam: "Enschede De Eschmarke",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gz",
		naam: "Gilze = Rijen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Zd",
		naam: "Zaandam",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dln",
		naam: "Dalen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bbg",
		naam: "Beekbergen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zlptta",
		naam: "Zwolle PTT Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kfhn",
		naam: "Kijfhoek Noord",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Nsch",
		naam: "Bad Nieuweschans",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nvp",
		naam: "Nieuw Vennep",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bkd",
		naam: "Amersfoort Bokkeduinen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hde",
		naam: "'t Harde",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bsk",
		naam: "Boskoop",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gdr",
		naam: "Gaanderen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gnn",
		naam: "Groningen Noord",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ktr",
		naam: "Kesteren",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Llsoa",
		naam: "Lelystad Opstelterrein Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Amfpon",
		naam: "Amersfoort Racc. PON",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kfhan",
		naam: "Kijfhoek Aansl. Noord",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Stv",
		naam: "Stavoren",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Spm",
		naam: "Sappemeer Oost",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Za",
		naam: "Zetten - Andelst",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zvbi",
		naam: "Zevenbergen Inhaalspoor",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Tli",
		naam: "Tiel Industrieterrein",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rtz",
		naam: "Rotterdam Zuid",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Pt",
		naam: "Putten",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Kma",
		naam: "Krommenie = Assendelft",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Edng",
		naam: "Eijsden Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Pmw",
		naam: "Purmerend Weidevenne",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Esta",
		naam: "Elst Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ost",
		naam: "Olst",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Htda",
		naam: "'s Hertogenbosch Diezebrug Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "IJbww",
		naam: "IJsselbrugaansl. Westervoort Westzijde",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Blz",
		naam: "Blauwkapel Zuid",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Bkg",
		naam: "Bovenkarspel = Grootebroek",
		codeLogistiekeFunctionaliteit: "BUV"
	},
	{
		verkorting: "Luta",
		naam: "Lutterade Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Almb",
		naam: "Almere Buiten",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zb",
		naam: "Zuidbroek",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Kmw",
		naam: "Koudum = Molkwerum",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "El",
		naam: "Elten (D)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Odb",
		naam: "Oudenbosch",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nbn",
		naam: "Nieuw Buinen",
		codeLogistiekeFunctionaliteit: "OPSBF"
	},
	{
		verkorting: "Hdg",
		naam: "Hurdegaryp",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nmgo",
		naam: "Nijmegen Goffert",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hstdk",
		naam: "HSL - Tunnel DordtseKil",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sm",
		naam: "Swalmen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Almp",
		naam: "Almere Parkwijk",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gp",
		naam: "Geldrop",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hfd",
		naam: "Hoofddorp",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hkb",
		naam: "Herkenbosch",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hsbda",
		naam: "HSL - Breda Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kpn",
		naam: "Kampen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Tbi",
		naam: "Tilburg Indstrieterrein",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Tbge",
		naam: "Tilburg Goederenenmplacement",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Wgmhsa",
		naam: "Watergraafsmeer HSA Onderhoudsloods",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dgok",
		naam: "Amsterdam Dijksgracht Kattenburg Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Zha",
		naam: "Zevenbergschen Hoek Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vndc",
		naam: "Veenendaal Centrum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hgl",
		naam: "Hengelo",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Tgra",
		naam: "Tongelre Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hszha",
		naam: "HSL - Zevenbergschen Hoek Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Vdgvch",
		naam: "Vlaardingen Vulcaanhaven",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Eemia",
		naam: "Eemshaven Industrie Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bropo",
		naam: "Betuweroute Opheusden Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hz",
		naam: "Herzogenrath (D)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Cog",
		naam: "Coevorden Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Nspl",
		naam: "Haarlem Noordelijke Splitsing",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Edn",
		naam: "Eijsden",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Skn",
		naam: "Stadskanaal Hoofdstation",
		codeLogistiekeFunctionaliteit: "ICOKP"
	},
	{
		verkorting: "Ddzd",
		naam: "Dordrecht Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Krg",
		naam: "Kruiningen = Yerseke",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Kfhaz",
		naam: "Kijfhoek Aansl. Zuid",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "G",
		naam: "Gronau (D)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wl",
		naam: "Wehl",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rsw",
		naam: "Rijswijk",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Blo",
		naam: "Blauwkapel Oost",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Bot",
		naam: "Rotterdam, Botlek",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Hsbrdo",
		naam: "HSL - Barendrecht Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hln",
		naam: "Haelen",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hto",
		naam: "'s Hertogenbosch Oost",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Gdma",
		naam: "Geldermalsen Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Brect",
		naam: "Blerick ECT",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sdtb",
		naam: "Sliedrecht Baanhoek",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hdp",
		naam: "Hoendiep (brug o/h - bij Groningen)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Nmh",
		naam: "Nijmegen Heyendaal",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sto",
		naam: "Stroe",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Esn",
		naam: "Essen (B)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Tb",
		naam: "Tilburg",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rs",
		naam: "Rosmalen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hglg",
		naam: "Hengelo Gezondheidspark",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Twl",
		naam: "Twello",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ngsf",
		naam: "Nederlandse Gist Fabriek - bij Delft",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mvtez",
		naam: "Maasvlakte Europahaven zuid",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dta",
		naam: "Delft Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Laa",
		naam: "Den Haag Laan van NOI",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ampo",
		naam: "Almere Poort",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sd",
		naam: "Soestdijk",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hvsp",
		naam: "Hilversum Sportpark",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Btl",
		naam: "Boxtel",
		codeLogistiekeFunctionaliteit: "BUV"
	},
	{
		verkorting: "Dr",
		naam: "Dieren",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hvvb",
		naam: "Hoogeveens Vaartbrug",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hrpa",
		naam: "Amsterdam Houtrakpolder Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Whz",
		naam: "Rotterdam, Emplacement Waalhaven Zuid",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Asb",
		naam: "Amsterdam Bijlmer ArenA ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Apdvam",
		naam: "Apeldoorn Racc. VAM",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Co",
		naam: "Coevorden",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Kpnzoo",
		naam: "Kampen Zuid Overloopw. Oost",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ozbm",
		naam: "Oud Zaltbommel",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Vhp",
		naam: "Vroomshoop",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gpda",
		naam: "Gaasperdammerweg Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Bdm",
		naam: "Bedum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Apn",
		naam: "Alphen a/d Rijn",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vem",
		naam: "Voorst - Empe",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mk",
		naam: "Markelo",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Fsz",
		naam: "Zelzate (B)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sludow",
		naam: "Sluiskil Racc. DOW CHEMICAL",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Otb",
		naam: "Oosterbeek",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Op",
		naam: "Opheusden",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Asdz",
		naam: "Amsterdam Zuid ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rtst",
		naam: "Rotterdam Stadion",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Bk",
		naam: "Beek = Elsloo",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vl",
		naam: "Venlo",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hor",
		naam: "Hollandsche Rading",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Brvalw",
		naam: "Betuweroute Valburg West",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Bsks",
		naam: "Boskoop Snijdelwijk",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Drokpz",
		naam: "Dronten - Kampen Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mas",
		naam: "Maarssen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ahg",
		naam: "Arnhem Goederenstation",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ana",
		naam: "Anna Paulowna",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Amf",
		naam: "Amersfoort",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hmlva",
		naam: "Harmelen - Vleuten Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vz",
		naam: "Vriezenveen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hfdo",
		naam: "Hoofddorp Opstelterrein ",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bdlg",
		naam: "Budel Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Brgro",
		naam: "Betuweroute Gorinchem",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Utt",
		naam: "Utrecht Terwijde",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "O",
		naam: "Oss",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wadn",
		naam: "Waddinxveen Noord",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ldd",
		naam: "Leidschendam Werkplaats",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wsm",
		naam: "Winsum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rdp",
		naam: "Reitdiep (brug o/h - bij Groningen)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dt",
		naam: "Delft",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Kpnzow",
		naam: "Kampen Zuid Overloopw. West",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hrla",
		naam: "Heerlen Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Amri",
		naam: "Almelo de Riet",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hlms",
		naam: "Haarlem Spaarnwoude",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Abr",
		naam: "Brug o/d Arne",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wnn",
		naam: "Wadenoijen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Grs",
		naam: "Greuns (brug o/d - bij Leeuwarden)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Spbr",
		naam: "Spaarne (brug o/h - bij Haarlem)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "IJbz",
		naam: "IJssel (brug o/d - bij Zutphen)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dei",
		naam: "Deinum",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ust",
		naam: "Usquert",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bottha",
		naam: "Botlek Theemsweg Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sdm",
		naam: "Schiedam Centrum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Akl",
		naam: "Arkel",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zl",
		naam: "Zwolle",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ztwo",
		naam: "Zoeterwoude Oost",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ovn",
		naam: "Overveen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ama",
		naam: "Amersfoort Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Gn",
		naam: "Groningen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ndkp",
		naam: "Noorderkempen (B)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Tnzz",
		naam: "Terneuzen Zuidzijde (Racc.)",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Gln",
		naam: "Geleen Oost",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sgn",
		naam: "Schagen ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sgra",
		naam: "Amsterdam Singelgracht Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hbzm",
		naam: "Hardinxveld Blauwe Zoom",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hshmdo",
		naam: "HSL - Hoogmade Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ow",
		naam: "Oss West",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Llsow",
		naam: "Lelystad Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hrl",
		naam: "Heerlen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gvmw",
		naam: "Den Haag Moerwijk",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Aswplm",
		naam: "Amsterdam Lijnwerkplaats Midden",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Lpe",
		naam: "Liempde",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Kgs",
		naam: "Koegras (brug o/h Noord - Hollandsch kanaal)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dld",
		naam: "Den Dolder",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "At",
		naam: "Acht",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Apda",
		naam: "Apeldoorn Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hb",
		naam: "Hoensbroek",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Lek",
		naam: "Lekbrug Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Vd",
		naam: "Vorden",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dzw",
		naam: "Delfzijl West",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Onz",
		naam: "Onnen Zuid",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hmta",
		naam: "Hemtunnel Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Erp",
		naam: "Rotterdam, Emplacement Europoort",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hwd",
		naam: "Heerhugowaard",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hsrtdt",
		naam: "HSL - Rotterdam Tunnel",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Tbg",
		naam: "Terborg",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hks",
		naam: "Hoogkarspel",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bmn",
		naam: "Brummen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gv",
		naam: "Den Haag HS",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Asdma",
		naam: "Amsterdam Muiderpoort Aansl. ",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Kpnz",
		naam: "Kampen Zuid",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vrk",
		naam: "Vork",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Klp",
		naam: "Veenendaal = De Klomp",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Utctw",
		naam: "Utrecht Cartesiusweg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Em",
		naam: "Emmerich (D)",
		codeLogistiekeFunctionaliteit: "KST"
	},
	{
		verkorting: "Wmb",
		naam: "Wijmerts (brug o/d - tussen IJlst en Workum)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hlmvam",
		naam: "Haarlem Racc. VAM",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sloe",
		naam: "Sloehaven Emplacement",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Avat",
		naam: "Amersfoort Vathorst",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Swd",
		naam: "Sauwerd",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Arn",
		naam: "Arnemuiden",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Emn",
		naam: "Emmen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ztm",
		naam: "Zoetermeer",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Brdl",
		naam: "Brug o/h Deel - tussen Akkrum en Heerenveen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ddnser",
		naam: "Delden Racc. SERVO",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hvsm",
		naam: "Hilversum Media Park",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rhn",
		naam: "Rhenen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hsghtz",
		naam: "HSL - Groene Hart Tunnel Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mdaz",
		naam: "Moordrecht Aansl. Zuid",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Rat",
		naam: "Raalte",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Han",
		naam: "Haanrade",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wdn",
		naam: "Wierden",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hea",
		naam: "Herfte Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ot",
		naam: "Oisterwijk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ed",
		naam: "Ede = Wageningen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rl",
		naam: "Ruurlo",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Pmo",
		naam: "Purmerend Overwhere",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Edc",
		naam: "Ede Centrum",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kmr",
		naam: "Klimmen = Ransdaal",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mvtaho",
		naam: "Maasvlakte Prinses Amaliahaven oost",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Wz",
		naam: "Wezep",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bet",
		naam: "Best",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Pmk",
		naam: "Prinses Margrietkanaal (brug o/h - bij Grou = Jirnsum)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hna",
		naam: "Hoorn Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ebtwa",
		naam: "Elst Betuweroute Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mvtww",
		naam: "Maasvlakte empl West west",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Hwzb",
		naam: "Halfweg = Zwanenburg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Awhvw",
		naam: "Amsterdam Westhaven West",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Fwd",
		naam: "Feanwalden",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Beto",
		naam: "Best Overloopw.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Asn",
		naam: "Assen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Almo",
		naam: "Almere Oostvaarders",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Tnz",
		naam: "Terneuzen",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Lwc",
		naam: "Leeuwarden Camminghaburen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Aswpln",
		naam: "Amsterdam Lijnwerkplaats Noord",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wh",
		naam: "Wijhe",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Brppd",
		naam: "Betuweroute Papendrecht",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hn",
		naam: "Hoorn",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mvtahz",
		naam: "Maasvlakte Prinses Amaliahaven zuid",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Oelz",
		naam: "Oss Racc. Elzenburg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hsbdgo",
		naam: "HSL - Breda Grens Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Brdv",
		naam: "Rotterdam Barendrecht Vork",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dvc",
		naam: "Deventer Colmschate",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hsvhd",
		naam: "HSL - Viaduct Hollands Diep",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zst",
		naam: "Amsterdam Zaanstraat",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Az",
		naam: "Rotterdam Aansl. ZHES",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hlmwph",
		naam: "Haarlem Hoofdwerkplaats",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wdo",
		naam: "Woerden Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Rtngw",
		naam: "Rotterdam Noord Goederenstation West",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Rskbl",
		naam: "Rijn - Schiekanaal (brug o/h - bij Leiden Lammenschans)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wtv",
		naam: "Westervoort",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wld",
		naam: "Willemsdorp",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mvtyn",
		naam: "Maasvlakte Yangtzehaven Noord",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Ac",
		naam: "Abcoude",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hang",
		naam: "Haanrade Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Esg",
		naam: "Enschede Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rsa",
		naam: "Ressen Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mz",
		naam: "Maarheeze",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mtwpl",
		naam: "MaastrichtLijnwerkplaats",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Apd",
		naam: "Apeldoorn",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sn",
		naam: "Schinnen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bvhca",
		naam: "Beverwijk Hoogovens Centraal Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kbd",
		naam: "Krabbendijke",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ahp",
		naam: "Arnhem Velperpoort",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Odz",
		naam: "Oldenzaal",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bdpb",
		naam: "Breda = Prinsenbeek",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Lis",
		naam: "Lisse",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Gbg",
		naam: "Gramsbergen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nwk",
		naam: "Niewerkerk a/d IJssel",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hdb",
		naam: "Hardenberg",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Erpw",
		naam: "Europoort West",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mg",
		naam: "Mantgum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bzl",
		naam: "Kapelle = Biezelinge",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gvc",
		naam: "Den Haag Centraal",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vlb",
		naam: "Vierlingsbeek",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sgl",
		naam: "Houthem = St. Gerlach",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mvtyz",
		naam: "Maasvlakte Yangtzehaven Zuid",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Eem",
		naam: "Eemshaven",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hsghtn",
		naam: "HSL - Groene Hart Tunnel Noord",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zvbtwa",
		naam: "Zevenaar Betuweroute Aansl.",
		codeLogistiekeFunctionaliteit: "INTKN"
	},
	{
		verkorting: "Cas",
		naam: "Castricum",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sptn",
		naam: "Santpoort Noord",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wdv",
		naam: "Wildervank",
		codeLogistiekeFunctionaliteit: "SPROP"
	},
	{
		verkorting: "Nwki",
		naam: "Nieuwerkerk IVO",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dhs",
		naam: "Delfshavense Schie (brug o/d - bij Schiedam)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zvt",
		naam: "Zandvoort aan Zee",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "aa",
		naam: "Dummy code RD Blijft Rijden ",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Nhk",
		naam: "Noordhollandsch kanaal (brug o/h - bij Purmerend)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vs",
		naam: "Vlissingen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Lar",
		naam: "Laarwald (D)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rhsla",
		naam: "Rotterdam HSL Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Tbr",
		naam: "Tilburg Reeshof",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mdsa",
		naam: "Muiderstraatweg Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Brd",
		naam: "Barendrecht",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wr",
		naam: "Weener (D)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mlo",
		naam: "Meerlo = Tienraij",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Lwd",
		naam: "Lewedorp",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mvtahn",
		naam: "Maasvlakte Prinses Amaliahaven Noord",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Apg",
		naam: "Appingedam",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bl",
		naam: "Beilen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vtn",
		naam: "Vleuten",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Slcf",
		naam: "Sloe-Cobalfret",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Tg",
		naam: "Tegelen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "IJt",
		naam: "IJlst",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gwbr",
		naam: "Gouwe (brug o/d - bij Gouda)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zlgea",
		naam: "Zwolle Goederenemplacement Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dvd",
		naam: "Duivendrecht",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hlba",
		naam: "Hillegersberg Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Skp",
		naam: "Stadskanaal Pekelderweg",
		codeLogistiekeFunctionaliteit: "OPSBF"
	},
	{
		verkorting: "Ass",
		naam: "Amsterdam Sloterdijk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Amfs",
		naam: "Amersfoort Schothorst",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hmbv",
		naam: "Helmond Brandevoort",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vtbr",
		naam: "Vecht (brug o/d - bij Weesp)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vdl",
		naam: "Voerendaal",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hnk",
		naam: "Hoorn Kersenboogerd",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gvm",
		naam: "Den Haag Mariahoeve",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gd",
		naam: "Gouda",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hil",
		naam: "Hillegom",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ha",
		naam: "'s Heer Arendskerke",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ld",
		naam: "Leiden Goederenstation",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vvl",
		naam: "Hoogkerk - Vierverlaten",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Nhkbr",
		naam: "Noordhollandsch kanaal (brug o/h - bij Alkmaar)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Cps",
		naam: "Capelle Schollevaar",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Emnz",
		naam: "Emmen Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hno",
		naam: "Heino",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hdr",
		naam: "Den Helder",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rsl",
		naam: "Rensel (brug o/d - tussen Winschoten en Nieuweschans)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ldm",
		naam: "Leerdam",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hlm",
		naam: "Haarlem",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bhv",
		naam: "Bilthoven",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vb",
		naam: "Voorburg",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Eml",
		naam: "Ermelo",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mpa",
		naam: "Meppel Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dv",
		naam: "Deventer",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mbrvo",
		naam: "Maasbrug Ravenstein Oostzijde",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Htnc",
		naam: "Houten Castellum ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Da",
		naam: "Daarlerveen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Amfva",
		naam: "Amersfoort Vlasakkers Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hfdm",
		naam: "Hoofddorp Middenspoor",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kw",
		naam: "Kropswolde",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hmlba",
		naam: "Harmelen - Breukelen Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Grbr",
		naam: "Oude Maas  (brug o/d - bij Dordrecht)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hmla",
		naam: "Harmelen Aansl.",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Dtz",
		naam: "Delft Zuid",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Odzg",
		naam: "Oldenzaal Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hmbh",
		naam: "Helmond Brouwhuis",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ps",
		naam: "Rotterdan, Emplacement Pernis",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Kv",
		naam: "Keverdijk",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ahbo",
		naam: "Arnhem Berg Opstel",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rdwa",
		naam: "Radarweg Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hrn",
		naam: "Haren",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hd",
		naam: "Harderwijk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vry",
		naam: "Venray",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Lw",
		naam: "Leeuwarden",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Amr",
		naam: "Alkmaar",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vga",
		naam: "Vught Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hlg",
		naam: "Harlingen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Almm",
		naam: "Almere Muziekwijk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wp",
		naam: "Weesp",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Lls",
		naam: "Lelystad Centrum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Botth",
		naam: "Botlek Racc. Theemsweg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Brdvno",
		naam: "Betuweroute Duiven Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Lutdsm",
		naam: "Lutterade Racc. DSM",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vp",
		naam: "Velp",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Nkk",
		naam: "Nijkerk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Utza",
		naam: "Utrecht Zuid aansluiting",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vdma",
		naam: "Veendam Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bvhc",
		naam: "Beverwijk Hoogovens Centraal",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Brdva",
		naam: "Barendrecht Vork Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hm",
		naam: "Helmond",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vndwo",
		naam: "Veenendaal West Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Vlk",
		naam: "Vlakebrug o/h Kanaal door Zuid - Beverland",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mrg",
		naam: "Maarn Goederenemplacement",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Ltv",
		naam: "Lichtenvoorde = Groenlo",
		codeLogistiekeFunctionaliteit: "BUV"
	},
	{
		verkorting: "Amlbp",
		naam: "Almelo Racc. Bedrijvenpark N.W. Twente",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Lnp",
		naam: "Neerpelt (B)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Slua",
		naam: "Sluiskil Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sbk",
		naam: "Spaubeek",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mvtw",
		naam: "Rotterdam, Emplacement Maasvlakte West",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Bnc",
		naam: "Barneveld Centrum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Spa",
		naam: "Snippeling Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Wijb",
		naam: "Wantij (brug o/h - bij Dordrecht)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ut",
		naam: "Utrecht Centraal",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mvten",
		naam: "Maasvlakte Europahaven noord",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Mdo",
		naam: "Moordrecht Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Lr",
		naam: "Laren = Almen",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Tpsw",
		naam: "Tiel Passewaaij",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Drh",
		naam: "Driehuis",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ngsfa",
		naam: "Nederlandse Gist Fabriek Aansl. - bij Delft",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Clb",
		naam: "Rotterdam, Calandbrug",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Onn",
		naam: "Onnen Noord",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ashd",
		naam: "Amsterdam Holendrecht ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mtg",
		naam: "Maastricht Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Lp",
		naam: "Loppersum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ddn",
		naam: "Delden",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Obd",
		naam: "Obdam",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hnp",
		naam: "Hindeloopen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rh",
		naam: "Rheden",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Asdm",
		naam: "Amsterdam Muiderpoort ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nscg",
		naam: "Nieuweschans Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vg",
		naam: "Vught",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Llso",
		naam: "Lelystad Opstel.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hlo",
		naam: "Heiloo",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rd",
		naam: "Roodeschool",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ohze",
		naam: "Oud Heeze",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Bha",
		naam: "Beatrixhaven Aansl. (Maastricht)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zv",
		naam: "Zevenaar",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sldw",
		naam: "Sloe-Denemarkenweg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Htn",
		naam: "Houten",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bgn",
		naam: "Bergen op Zoom",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sdt",
		naam: "Sliedrecht",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Cmb",
		naam: "Crailoo Centraal Magazijn Bovenbouw",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rdac",
		naam: "Roodeschool Aardgascondensaat verlaadstation",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Fvs",
		naam: "Vis頨B)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Svgca",
		naam: "Sas van Gent CERSTAR Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hshfdo",
		naam: "HSL - Hoofddorp Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ec",
		naam: "Echt",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nml",
		naam: "Nijmegen Lent",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bf",
		naam: "Baflo",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hlgh",
		naam: "Harlingen Haven",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ns",
		naam: "Nunspeet",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hrp",
		naam: "Amsterdam Houtrakpolder",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Wgm",
		naam: "Watergraafsmeer",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Wt",
		naam: "Weert",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sk",
		naam: "Sneek",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Kz",
		naam: "Koog aan de Zaan",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Whe",
		naam: "Where, brug o/d - bij Purmerend",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wdmv",
		naam: "Woerden Molenvliet",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Tla",
		naam: "Tiel Aansl. Industrieterrein",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mtbr",
		naam: "Maas (brug o/d - bij Maastricht)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bgk",
		naam: "Beugen Kruispunt",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Zvb",
		naam: "Zevenbergen",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Na",
		naam: "Nieuw Amsterdam",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Shl",
		naam: "Schiphol Airport",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hdl",
		naam: "Hedel",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Brvalo",
		naam: "Betuweroute Valburg Oost",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Smz",
		naam: "Swalmen Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Va",
		naam: "Velperbroek Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Utzl",
		naam: "Utrecht Zuilen ",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Svgg",
		naam: "Sas van Gent Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dz",
		naam: "Delfzijl",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Zlr",
		naam: "Zwolle Rangeerterrein",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Lg",
		naam: "Landgraaf",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mvtwn",
		naam: "Maasvlakte West terminal noord",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Mda",
		naam: "Moordrecht Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kpzhtb",
		naam: "Kampen Zuid - Hattemerbroek Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hw",
		naam: "Halfweg",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Egh",
		naam: "Eygelshoven",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "On",
		naam: "Onnen",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Mp",
		naam: "Meppel",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ht",
		naam: "ӳ Hertogenbosch ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Had",
		naam: "Heemstede =Aerdenhout",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sltf",
		naam: "Sloe-Thermfos",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Asd",
		naam: "Amsterdam Centraal",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Glk",
		naam: "Lanaken (B)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Apdm",
		naam: "Apeldoorn De Maten",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Llsstb",
		naam: "Lelystad - Swifterbant",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ztww",
		naam: "Zoeterwoude West",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rtngo",
		naam: "Rotterdam Noord Goederenstation Oost",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Vlgr",
		naam: "Venlo Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Lut",
		naam: "Geleen = Lutterade",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Sog",
		naam: "Schin op Geul",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ods",
		naam: "Oosterdoksdoorvaart",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bnk",
		naam: "Bunnik",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zpge",
		naam: "Zutphen Goederenemplacement",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Wfm",
		naam: "Warffum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Alm",
		naam: "Almere Centrum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wm",
		naam: "Wormerveer",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mbt",
		naam: "Maasbracht",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Mabr",
		naam: "Mark (brug o/d - tussen Zevenbergen en Oudenbosch)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gs",
		naam: "Goes",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nh",
		naam: "Nuth",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bkp",
		naam: "Blauwkapel",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Sknd",
		naam: "Sneek Noord",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Axa",
		naam: "Axel Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dwe",
		naam: "De Westereen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hglo",
		naam: "Hengelo Oost",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rv",
		naam: "Reuver",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Utm",
		naam: "Utrecht Maliebaan",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ddri",
		naam: "Dordrecht Aansl. Industrieterrein De Staart",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Srn",
		naam: "Susteren",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gdm",
		naam: "Geldermalsen",
		codeLogistiekeFunctionaliteit: "BUV"
	},
	{
		verkorting: "Bn",
		naam: "Borne",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Aswplz",
		naam: "Amsterdam Lijnwerkplaats Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ahz",
		naam: "Arnhem Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ssh",
		naam: "Sassenheim",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Amfga",
		naam: "Amersfoort Goederen Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hrm",
		naam: "Harinkmakanaal (brug o/h - tussen Lw en Dronrijp/Mantgum)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Btd",
		naam: "Boterdiep",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bdg",
		naam: "Bodegraven",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "IJsm",
		naam: "IJsselmonde",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hvl",
		naam: "Hoevelaken",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gr",
		naam: "Gorinchem",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Zlw",
		naam: "Lage Zwaluwe",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Omn",
		naam: "Ommen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Asdmw",
		naam: "Amsterdam Muiderpoort West",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Nwh",
		naam: "Noordwijkerhout",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ltn",
		naam: "Lunteren",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wdvb",
		naam: "Wildervanckkanaal (brug o/h)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Htba",
		naam: "Hattemerbroek Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gwt",
		naam: "Galgewater (brug o/h - bij Leiden)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hrt",
		naam: "Horst - Sevenum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mes",
		naam: "Meerssen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ltm",
		naam: "Lottum",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Nmd",
		naam: "Nijmegen Dukenburg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hvs",
		naam: "Hilversum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ck",
		naam: "Cuijk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mbga",
		naam: "Muiderberg Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Est",
		naam: "Elst",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Es",
		naam: "Enschede",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mtr",
		naam: "Maastricht Randwyck",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mbtwaz",
		naam: "Meteren Betuweroute Aansl. Zuid",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Ehs",
		naam: "Eindhoven Strijp-S",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wiltn",
		naam: "Willemstunnel Noord",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rai",
		naam: "Amsterdam RAI ",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wiltz",
		naam: "Willemstunnel Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hmn",
		naam: "Hemmen = Dodewaard",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rscwa",
		naam: "Rail Service Center Waalhaven Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hstom",
		naam: "HSL - Tunnel Oude Maas",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bhdv",
		naam: "Boven - Hardinxveld",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hsbdg",
		naam: "HSL - Breda Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bdl",
		naam: "Budel",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mttrix",
		naam: "Maastricht Racc. Beatrixhaven",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hgz",
		naam: "Hoogezand = Sappemeer",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ehv",
		naam: "Eindhoven",
		codeLogistiekeFunctionaliteit: "BUV"
	},
	{
		verkorting: "Zlptt",
		naam: "Zwolle PTT",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dgr",
		naam: "Amsterdam Dijksgracht",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wc",
		naam: "Wijchen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Stm",
		naam: "Stedum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Std",
		naam: "Sittard",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Tl",
		naam: "Tiel",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ndb",
		naam: "Naarden = Bussum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dtzo",
		naam: "Delft Zuid Overloopwissels",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mvtah",
		naam: "Maasvlakte Prinses Amaliahaven",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Hlmkr",
		naam: "Haarlemkruis",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rsn",
		naam: "Rijssen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mbtwan",
		naam: "Meteren Betuweroute Aansl. Noord",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Vk",
		naam: "Valkenburg",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vdm",
		naam: "Veendam",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rtb",
		naam: "Rotterdam Blaak",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nvbro",
		naam: "Nieuwe Veerbrug Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dmnz",
		naam: "Diemen Zuid",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dvaw",
		naam: "Duivendrecht Aansl. West",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wf",
		naam: "Wolfheze",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Amrn",
		naam: "Alkmaar Noord",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vkbr",
		naam: "Vinkbrug (o/d Rijn bij Leiden)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mvtena",
		naam: "Maasvlakte Europahaven noord aansluiting",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Zlra",
		naam: "Zwolle Rangeerterrein Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Sda",
		naam: "Scheemda",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Emnakz",
		naam: "Emmen AKZO Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bnva",
		naam: "Barneveld Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mrb",
		naam: "Mari쯢erg",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Zlsh",
		naam: "Zwolle Stadshagen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mvtwz",
		naam: "Maasvlakte West terminal zuid",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Cosb",
		naam: "Coevoerden Stadsgracht",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Pmr",
		naam: "Purmerend",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rvbr",
		naam: "Ringvaart(brug o/d - bij Sassenheim)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vss",
		naam: "Vlissingen Souburg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mt",
		naam: "Maastricht",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rsdg",
		naam: "Roosendaal Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bmr",
		naam: "Boxmeer",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Sgbr",
		naam: "Singelgrachtbrug",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wwab",
		naam: "Westerwoldse Aa (brug o/d)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Llsz",
		naam: "Lelystad Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gbr",
		naam: "Glanerbrug",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Lnn",
		naam: "Loenen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dl",
		naam: "Dalfsen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Utma",
		naam: "Utrecht Aansl. Maarssen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mtn",
		naam: "Maastricht Noord",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mkbr",
		naam: "Merwedekanaal (brug o/h - bij Arkel)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Nvd",
		naam: "Nijverdal",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ldl",
		naam: "Leiden Lammenschans",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wad",
		naam: "Waddinxveen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gdg",
		naam: "Gouda Goverwelle",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Db",
		naam: "Driebergen = Zeist ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rb",
		naam: "Rilland = Bath",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mdk",
		naam: "Moerdijk (Racc.)",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Brgnd",
		naam: "Betuweroute Giessendam",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Zwd",
		naam: "Zwijndrecht",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wgmo",
		naam: "Watergraafsmeer Oost Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rvs",
		naam: "Ravenstein",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bnn",
		naam: "Barneveld Noord",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Zh",
		naam: "Zuidhorn",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bmbr",
		naam: "Beneden - Merwede (Baanhoekbrug o/d - bij Sliedrecht)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rtd",
		naam: "Rotterdam Centraal ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Brda",
		naam: "Barendrecht Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Kr",
		naam: "Kliftrak (brug o/h - bij Workum)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hmh",
		naam: "Helmond 't Hout",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ddrs",
		naam: "Dordrecht Stadspolders",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Utvr",
		naam: "Utrecht Vaartse Rijn",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Tbu",
		naam: "Tilburg Universiteit",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Brmet",
		naam: "Betuweroute Meteren",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Rda",
		naam: "Roodeschool Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dwb",
		naam: "Dubbele Wiericke (brug o/d - tussen Woerden en Bodegraven)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bh",
		naam: "Bad Bentheim (D)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Zzs",
		naam: "Zaandijk Zaanse Schans",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zpgea",
		naam: "Zutphen Goederenemplacement Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Smvrt",
		naam: "Smildervaart ((brug o/d)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gnd",
		naam: "Hardinxveld = Giesendam",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mkv",
		naam: "Musselkanaal=Valthermond",
		codeLogistiekeFunctionaliteit: "KST"
	},
	{
		verkorting: "Skbr",
		naam: "Schinkel (brug o/d - bij Amsterdam Zuid)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bkh",
		naam: "Den Haag Binckhorst",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Mdbz",
		naam: "Moerdijkbrug Zuid Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dgro",
		naam: "Amsterdam Dijksgracht Oostzijde",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Wgmw",
		naam: "Watergraafsmeer West Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hon",
		naam: "Holten",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Odo",
		naam: "Oudewater Overloop.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Wha",
		naam: "Waterhuizen Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dvge",
		naam: "Deventer Goederenemplacement",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Wspl",
		naam: "Rotterdam Westelijke Splitsing",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Bott",
		naam: "Botlektunnel",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ww",
		naam: "Winterswijk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Gwb",
		naam: "Gouwe (brug o/d - bij Alphen aan den Rijn)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Awhv",
		naam: "Amsterdam Westhaven",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Bkla",
		naam: "Breukelen Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dgrw",
		naam: "Amsterdam Dijksgracht Westzijde",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Cvm",
		naam: "Chevremont",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dvgea",
		naam: "Deventer Goederenemplacement Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Go",
		naam: "Goor",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Llzm",
		naam: "Lansingerland-Zoetermeer",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Dvn",
		naam: "Duiven",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kbk",
		naam: "Klarenbeek",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hnko",
		naam: "Hoorn Kersenboogerd Opstelterrein",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bloa",
		naam: "Blauwkapel Oost Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Cl",
		naam: "Culemborg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zdb",
		naam: "Zaanbrug",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hsvbw",
		naam: "HSL - Viaduct bij Bleiswijk",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gka",
		naam: "Grijpskerk Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Fn",
		naam: "Franeker",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dvaz",
		naam: "Duivendrecht Aansl. Zuid",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hdrz",
		naam: "Den Helder Zuid",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bll",
		naam: "Bloemendaal",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bde",
		naam: "Bunde",
		codeLogistiekeFunctionaliteit: "KST"
	},
	{
		verkorting: "Eghm",
		naam: "Eygelshoven Markt",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mth",
		naam: "Maartenshoek",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hzl",
		naam: "Hooge Zwaluwe",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zvg",
		naam: "Zevenaar Grens",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hmt",
		naam: "Hamont (B)",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vh",
		naam: "Voorhout",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Swk",
		naam: "Steenwijk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Akm",
		naam: "Akkrum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rm",
		naam: "Roermond",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Krag",
		naam: "Krage",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hgv",
		naam: "Hoogeveen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Kg",
		naam: "Koekange",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ddv",
		naam: "Dedemsvaart",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Rmoa",
		naam: "Rotterdam Rechter Maasoever Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Uhz",
		naam: "Uithuizen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gnl",
		naam: "Groningen Losplaats",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Bkl",
		naam: "Breukelen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dmn",
		naam: "Diemen",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hgwbr",
		naam: "Hoge Gouwebrug - bij Gouda",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bln",
		naam: "Blauwkapel Noord",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Grvn",
		naam: "Griendtsveen Overloopw.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Har",
		naam: "De Haar Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Sptz",
		naam: "Santpoort Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Drp",
		naam: "Dronryp",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bv",
		naam: "Beverwijk",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Zbm",
		naam: "Zaltbommel",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rlb",
		naam: "Rotterdam Lombardijen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "IJbza",
		naam: "IJsselbrug Zutphen Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Wgmrba",
		naam: "Watergraafsmeer Ringbaan Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Hk",
		naam: "Heemskerk",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Brna",
		naam: "Baarn Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Wsba",
		naam: "Westelijke Splitsing Blijdrop Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ebk",
		naam: "Eerbeek",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Atn",
		naam: "Aalten",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hze",
		naam: "Heeze",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bobr",
		naam: "Boorn (brug o/d - bij Akkrum)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rta",
		naam: "Rotterdam Alexander",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Utlr",
		naam: "Utrecht Leidsche Rijn",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Utg",
		naam: "Uitgeest",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Mvta",
		naam: "Maasvlakte Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ztmo",
		naam: "Zoetermeer Oost",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Dn",
		naam: "Deurne",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bnz",
		naam: "Barneveld Zuid",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Brcup",
		naam: "Betuweroute Centraal Uitwissel Punt",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Bunde",
		naam: "B?? (D)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ahpr",
		naam: "Arnhem Presikhaaf",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Uto",
		naam: "Utrecht Overvecht",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rsd",
		naam: "Roosendaal",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Kfhz",
		naam: "Kijfhoek Zuid",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Etn",
		naam: "Etten = Leur",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Whzan",
		naam: "Rotterdam, Waalhaven Zuid Aansl.Noord",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Hg",
		naam: "Haarlem Goederen",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Mvtnwa",
		naam: "Maasvlakte Noordwesthoek Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Gerp",
		naam: "Groningen Europapark",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ahb",
		naam: "Arnhem Berg",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Kraga",
		naam: "Kragge Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bd",
		naam: "Breda",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vndw",
		naam: "Veenendaal West",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Did",
		naam: "Didam",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "IJsma",
		naam: "IJsselmonde Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ah",
		naam: "Arnhem Centraal ",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Nnvbr",
		naam: "Nauernasche Vaartbrug - bij Krommenie = Assendelft",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Tba",
		naam: "Tilburg Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Krd",
		naam: "Kerkrade Centrum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hrlk",
		naam: "Heerlen De Kissel",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Vst",
		naam: "Voorschoten",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Stz",
		naam: "Soest Zuid",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Mvtahw",
		naam: "Maasvlakte Prinses Amaliahaven west",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Nm",
		naam: "Nijmegen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ekz",
		naam: "Enkhuizen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Uhm",
		naam: "Uithuizermeeden",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Zlge",
		naam: "Zwolle Gooederenemlacement",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ws",
		naam: "Winschoten",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Www",
		naam: "Winterswijk West",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Hrna",
		naam: "Haren Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bol",
		naam: "Kanaal Alkmaar - Kolhorn (brug o/h - bij Broek op Langedijk)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Coeta",
		naam: "Coevorden Euroterminal Aansluiting",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Aco",
		naam: "Abcoude Overloopw. ",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Asdzo",
		naam: "Amsterdam Zuid Overloopwissels",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Amfv",
		naam: "Amersfoort Vlasakkers",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Eemi",
		naam: "Eemshaven Industrie",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Brn",
		naam: "Baarn",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bda",
		naam: "Breda Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Asdl",
		naam: "Amsterdam Lelylaan",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ehvwpl",
		naam: "Eindhoven Werkplaats",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Bkf",
		naam: "Bovenkarspel Flora",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Efd",
		naam: "Eefde",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Aml",
		naam: "Almelo",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Lc",
		naam: "Lochem",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Wk",
		naam: "Workum",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vam",
		naam: "VAM - terrein Wijster",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Assp",
		naam: "Amsterdam Science Park",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Coa",
		naam: "Coevorden Aansl.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Rtn",
		naam: "Rotterdam Noord",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bsd",
		naam: "Beesd",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Blw",
		naam: "Blauwkapel West",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Br",
		naam: "Blerick",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Aeg",
		naam: "Amsterdam Erasmusgracht Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Vama",
		naam: "VAM Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Oij",
		naam: "Oude IJssel (brug o/d - bij Doetinchem)",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Zp",
		naam: "Zutphen",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ehst",
		naam: "Eindhoven Stadion",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Asa",
		naam: "Amsterdam Amstel ",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Ddr",
		naam: "Dordrecht",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Rtng",
		naam: "Rotterdam Noord Goederenstation",
		codeLogistiekeFunctionaliteit: "WTBF"
	},
	{
		verkorting: "Vspa",
		naam: "Vensterpolder Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Bp",
		naam: "Buitenpost",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Ledn",
		naam: "Leiden Centraal",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Utwa",
		naam: "Utrecht - Woerden Aansl.",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Ypb",
		naam: "Den Haag Ypenburg",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Bon",
		naam: "Born",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Whzaz",
		naam: "Rotterdam, Waalhaven Zuid Aansl. Zuid",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Dtch",
		naam: "Doetinchem De Huet",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Craw",
		naam: "Crailoo Aansl. West",
		codeLogistiekeFunctionaliteit: "OLM"
	},
	{
		verkorting: "Bvge",
		naam: "Beverwijk Goed.",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Gk",
		naam: "Grijpskerk",
		codeLogistiekeFunctionaliteit: ""
	},
	{
		verkorting: "Txl",
		naam: "Texel",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Vlld",
		naam: "Vlieland",
		codeLogistiekeFunctionaliteit: "BGPT"
	},
	{
		verkorting: "Antw",
		naam: "Antwerpen",
		codeLogistiekeFunctionaliteit: "INTKN "
	}
];