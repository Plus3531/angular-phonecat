'use strict';

// Register `phoneList` component, along with its associated controller and template
angular.
  module('phoneList').
  component('phoneList', {
    templateUrl: 'phone-list/phone-list.template.html',
    controller: ['Phone', 'Vsm',
      function PhoneListController(Phone, Vsm) {
        this.phones = Phone.query();
		this.vsm = Vsm.query();
      }
    ]
  });
