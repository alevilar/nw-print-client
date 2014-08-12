var NW = new Backbone.Marionette.Application();


NW.addRegions({
  activityRegion: "#activity"
});

var NwPrintClient;

 var fs = require('fs'),
    	os = require('os'),
		sys = require('sys'),
		tmp = require('tmp'),		
		exec = require('child_process').exec;


var BINPATH = 'dist/'+os.platform();


var urlDomain = "http://localhost/chocha012";
var jsonUrlPrinterJobs = urlDomain + "/printer_jobs";



(function(){	

  
	var child;
	
	var $activity = $('#activity');


	var PrinterJob = Backbone.Model.extend({
		url: function() { 
			return jsonUrlPrinterJobs + "/" + this.get('id');
		},		
		getDriver: function () {
			var printer = this.get('Printer');
			var driver;
			if ( printer.hasOwnProperty('fiscal') && printer.fiscal == true ) {
				driver = LpFiscal;
			} else {
				driver = LpCommon;
			}
			return driver;
		},

		print: function () {					
			var job = this;
			try{
				this.getDriver().lp( this.attributes ).done(function(){
					console.info("se termino de imprimir el job");
					job.destroy();
				});
			} catch (e) {
				console.error(e);
			}
		}
	});

	var PrinterJobs = Backbone.Collection.extend({
					  url: jsonUrlPrinterJobs,
					  model: PrinterJob
					 });



	var PrinterJobView = Backbone.Marionette.ItemView.extend({

	  tagName: "li",

	  className: "job",

	  template: _.template("<p><%= Printer.name %> :::: Job <%= id %>"),

	  initialize: function() {
	    this.listenTo(this.model, "change", this.render);
	    this.render();
	  }

	});


	var JobsCollectionView = Backbone.Marionette.CollectionView.extend({
	  tagName: 'ul',
	  childView: PrinterJobView
	});




	var reloadInterval = 3000;

	NwPrintClient = Backbone.Model.extend({
		 defaults: {
		    "isPrinting":  false
		  },

		initialize: function () {
			this.printerJobs = new PrinterJobs;
			
			NW.activityRegion.show(new JobsCollectionView({collection:this.printerJobs }));

			var self = this;			

			this.printerJobs.on('add', function ( j ) {
				console.info("se agrego nuevo JOB");
				self.print();
			});
			
			this.startLoadingPrintJobs();
		},

		startLoadingPrintJobs: function () {
			this.printerJobs.fetch();
	  			
			var self = this;
			setInterval(function(){
				self.printerJobs.fetch();
			}, reloadInterval); // cada 3 segundos
		  
	  	},


		print: function () {
			if ( this.get('isPrinting') ) return false;
			if ( this.printerJobs.length == 0 ) return false;
			this.set('isPrinting', true);

			var job = this.printerJobs.shift();
			console.debug("voy a imprimir %o", job);

			job.print();

			this.set('isPrinting', false);
			return this.print();
		}

	});
	

	return new NwPrintClient;
})();



	