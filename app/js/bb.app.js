	
	var print_driver = require('./libs/print_driver');
	
	BBApp = {};


  	BBApp.Job = Backbone.Model.extend({		
		url: function() { 
			var url = localStorage.getItem("urlHost");
			if ( !url ) {
		  		return 'http://localhost';
		  	}
		  	url = url + "printer_jobs/" + this.get('id');
		  	return url;
		},		
		getDriver: function () {			
			var printer = this.get('Printer');
			var dvrName = 'LpCommon';
			if ( printer ) {
				if ( printer.hasOwnProperty('fiscal') && printer.fiscal == true ) {
					dvrName = "LpFiscal";
				}
			}
			return print_driver.getDriver( dvrName );
		},

		print: function () {					
			var job = this;
			
			var prom = this.getDriver().lp( this.attributes )
					.then(function(){
						console.info("DESTRUCTORRR");
						job.destroy();
					}, function () {
						console.error("DESTRUCTORRR, pero con error %o", arguments);
						job.destroy();
					});

			return prom;
		}
	});

	BBApp.Jobs = Backbone.Collection.extend({
		  fetching: false,
		  url: function () { 
		  	var url = localStorage.getItem("urlHost");
		  	if ( !url ) {
		  		return 'http://localhost';
		  	}
		  	return url +"printer_jobs";
		  },
		  model: BBApp.Job,
		  interval: null,

		  initialize: function () {
		  	this.on('add', function ( j ) {
		  		console.info("se agrego nuevo job al collection");
		  		return j.print();
		  	});
		  },
		  
		 
		  startFetch: function () {
		  		var reloadInterval = localStorage.getItem("reloadInterval");
		  		if ( this.fetching ) {
		  			this.stopFetch();
		  		}
		  		if ( this.url() ) {		  			
		  			this.__doFetch();			  			
		  			this.interval = setInterval( this.__doFetch.bind(this), reloadInterval );
		  		}
		  },

		  
		  stopFetch: function () {
		  		this.fetching = false;
		  		clearInterval( this.interval );
		  },

		  __doFetch: function() {
		  		this.fetching = true;
		  		var self = this;
		  		return this.fetch().error(function( data ) {
		  			self.stopFetch();
		  		});
		  }

	 });

