//var pppp = require("printer");
console.debug("iniciando Appp");

App = Ember.Application.create({

	start: function () {	

		console.debug("Iniciando Ember App");
		
		App.printerJobsController = Ember.ArrayController.create({
			content: [],

			init: function () {
				this.jobs = new BBApp.Jobs;
				var self = this;

				// al agregar un job, debo agregarlo tambien a este controller
				this.jobs.on('add', function(job) {
					console.info("App.printerJobsController:: Hay un nuevo trabajo por imprimir %o", self);
					self.unshiftObject( job.toJSON() );
					if ( self.length > 5 ) {
						self.popObject();
					}
				});


				// al eliminar eun job, tambien devo quitar del controller
				this.jobs.on('remove', function(job) {
					//self.popObject( );
				});




				// verificar si estoy usando un browser "normal"
				if ( isNodeJs() ) {
					// si aun no configure el Host, que me muestre la pantalla al comienzo
					// es un proceso de configuracion inicial
					var gui = require('nw.gui');
					if ( !localStorage.getItem('urlHost') ) {
						gui.Window.get().show();	
					}	
				}
				

				// chequeo que no se corte nunca. y si se corta, lo vuelvo a arrancar
				setInterval( function () {
					if ( !App.printerJobsController.jobs.fetching ) {
						App.printerJobsController.jobs.startFetch();
					}
				}, 13000 );


				// comenzar a traer: fetch from server
				this.jobs.startFetch();
			}

		});
	}
});





App.Router.map( function() {

} );




App.ApplicationController = Ember.Controller.extend({
  online: "red",
  //urlHost: "",
  siteName: "",
  reloadInterval: 3000,
  minInterval: 800,

  	init: function () {
  		this._super();
  		this.set('siteName', localStorage.getItem("siteName") );
  		this.set('reloadInterval', localStorage.getItem("reloadInterval") );


  		var self = this;
  		// sincronizo e intercepto errores para GUI
  		App.printerJobsController.jobs.on('sync', function () {
  			self.set("online", 'green');
  		});
  		App.printerJobsController.jobs.on('error', function () {  	
  			App.printerJobsController.jobs.stopFetch();
  			self.set("online", 'yellow');
  			self.checkOnline();
  		});

  		// finalmente chequeo que haya conexion
  		self.checkOnline();
  	},

  	actions: {
  		ocultarVentana: function () {
	  		require("nw.gui").Window.get().hide();
	  	},
	  	cerrarVentana: function () {	  		
	  		require("nw.gui").App.quit();
	  	}
  	},

  	onlineImg: function () {
  		return "img/"+ this.get('online') + "_ball.png";
  	}.property('online'),


  	onlineClass: function () {  		
  		if ( this.get('online') == 'red') {
  			return 'text text-danger';
  		}
  		if ( this.get('online') == 'yellow') {
  			return 'text text-warning';
  		}
  		return '';
  	}.property('online'),

  	onlineMessage: function () {
  		if ( this.get('online') == 'green') {
  			return '';
  		}
  		if ( this.get('online') == 'red') {
  			return 'No hay conexión al servidor.';
  		}
  		if ( this.get('online') == 'yellow') {
  			return 'Hay conexión al servidor, pero no se estan trayendo los datos. Esta bien la URL?';
  		}
  		return '';
  	}.property('online'),

  	updateReloadInterval: function(){	

  			var interval = parseInt( this.get("reloadInterval") );
  			if ( _.isNumber( interval ) && interval > this.get("minInterval") ) {	  			
  				localStorage.setItem("reloadInterval", interval);
  				$("#g-reload-interval").addClass('has-success');
  				$("#g-reload-interval").removeClass('has-error');
  				$('.error', "#g-reload-interval").hide();
  			} else {
  				$("#g-reload-interval").addClass('has-error');
  				$("#g-reload-interval").removeClass('has-success');
  				$('.error', "#g-reload-interval").show();
  			}
	  		
	  		
	  }.observes('reloadInterval'),


	retryFetch: function () {
		var online = this.get("online");
		if ( online != "red" ) {
			App.printerJobsController.jobs.startFetch();
		}
	}.observes('online'),

	completeUrlHostWithSiteName: function ( siteName ) {

		//return "http://"+siteName+".paxapos.com";
		return "http://localhost/"+siteName;
	},

  	updateUrlHost: function(){	
  			var siteName = this.get('siteName');
  			var url = this.completeUrlHostWithSiteName( siteName );
  			var urlHost = require("url").parse( url );

  			if ( urlHost.host && urlHost.protocol ) {
  				// esta ok
  				localStorage.setItem("siteName", siteName );
	  			localStorage.setItem("urlHost", urlHost.href );
	  			$("#g-url-host").addClass("has-success");
	  			$("#g-url-host").removeClass("has-error");
	  			$('.error', "#g-url-host").hide();
  			} else {
  				// hay error
  				localStorage.setItem("urlHost", '' );
  				$("#g-url-host").removeClass("has-success");
	  			$("#g-url-host").addClass("has-error");
  				$('.error', "#g-url-host").show();
  			}  			

	  		this.checkOnline();
	  }.observes('siteName'),
	
	  checkOnline: function() {
		var self = this;
		var urlHost = localStorage.getItem('urlHost');
		if ( navigator.onLine && isNodeJs() && urlHost ) {
			var url = require('url').parse( urlHost );
			if ( url && url.hostname ) {
				require('dns').resolve( url.hostname , function(err) {
					var online = self.get('online');
				  if ( !err &&  online != 'yellow' ) {
				  	self.set('online', "green");
				  }
				});		
			}
		} else {
			// si no es node o no tiene un urlHost definido
			this.set('online', "red");	
		}
	  }
});



App.Printer = Em.Object.extend({
  	name: "printername"
});




App.PrinterJob = Ember.Object.extend();

