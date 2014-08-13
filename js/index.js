
Config = {
	"Config": {
		"Fiscal": {
			"port":""
		}
	},
	"LoginUser": {
		'data[User][username]': 'admin',
		'data[User][password]': 'admin'
	}
}


NWPCa = Ember.Application.create({
  hi: function() { console.log('Hi! Im an app!'); }
});


//var NWPCa = Ember.Application.create( Config );


console.debug(NWPCa);


return;



var NwPrintClient;


var BINPATH = 'dist/'+process.platform;


var DOMAIN = "localhost";
var urlDomain = "http://"+DOMAIN+"/chocha012";
var jsonUrlPrinterJobs = urlDomain + "/printer_jobs";






	var doLogin = function () {
		
	}



	var checkConnection = function () {
		require('dns').resolve(DOMAIN, function(err) {
		  if (err) {
		  	Cli.set('online', false);
		  } else {
		  	Cli.set('online', true);
		  }
		});
	}

	


	

  
	var child;
	
	var $activity = $('#activity');


	var PrinterJob = {
		defaults: {
			"printed": false
		},
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
					job.set("printed", true);
				});
			} catch (e) {
				console.error(e);
			}
		}
	};

	var PrinterJobs = {
						  url: jsonUrlPrinterJobs,
						  model: PrinterJob,
						  initialize: function () {
						  	console.debug(arguments);
							this.on('add', function ( job ) {
								job.print();
								if ( this.collection.length > 5 ) {
									var firstJob = this.collection.shift();
									firstJob.destroy();
								}
							});
						  }
					 };




	var reloadInterval = 3000;

	NwPrintClient = {
		 defaults: {
		    "isPrinting":  false
		  },
		  interval: null,

		initialize: function () {
			this.printerJobs = new PrinterJobs;
			
			NW.activityRegion.show(new JobsCollectionView({collection:this.printerJobs }));

			this.startLoadingPrintJobs();
		},

		stopLoadingJobs: function () {
			clearInterval(this.interval);
		},

		startLoadingPrintJobs: function () {
			var self = this;
			this.printerJobs.fetch()
					.error( function() {
						console.error("ERRRROOOOOORR jobs %o", arguments);	
						self.stopLoadingJobs();
					});
	  			
			var self = this;
			this.interval = setInterval(function(){
				self.printerJobs.fetch()
					.error( function() {
						console.error("ERRRROOOOOORR jobs %o", arguments);	
						self.stopLoadingJobs();
					});
			}, reloadInterval); 
		  
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

	};
	
