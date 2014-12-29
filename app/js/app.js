//var pppp = require("printer");
console.debug("iniciando Appp");



function ValidURL(str) {
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;

  var pattern = new RegExp(expression); // fragment locater
  if(!pattern.test(str)) {
    alert("Please enter a valid URL.");
    return false;
  } else {
    return true;
  }
}





App = Ember.Application.create({

	start: function () {	

		console.debug("Iniciando Ember App");



		
		
	}
});





App.Router.map( function() {

} );




App.ApplicationController = Ember.Controller.extend({
  online: "red",
  //urlHost: "http://www.paxapos.com/site-name",
  hostName: "http://www.fray.alevilar.com",
  siteName: "",
  reloadInterval: 3000,
  minInterval: 800,
  logs: "",

  	init: function () {
  		this._super();

  		this.__initLocalStorage();
  		
  		this.__setLoginIframe();

  		this.__InitJobs();

  		// finalmente chequeo que haya conexion
  		this.checkOnline();
  	},

  	__setLoginIframe: function () {
  		var hostName = this.getFullUrlSiteName() + "printers/printer_jobs/login";
console.debug(hostName);
  		$( function(){
  			$("#login-iframe").html("<iframe src='" + hostName + "' width='100%' heigth='100px'></iframe>")
  		});
  		
  		return true;
  	},

  	__initLocalStorage: function () {
  		this.set('siteName', localStorage.getItem("siteName") );
  		this.set('reloadInterval', localStorage.getItem("reloadInterval") );

  		var hostName = localStorage.getItem("hostName");
  		if ( hostName ) {
  			this.set('hostName', localStorage.getItem("hostName") );
  		} else {
  			localStorage.setItem("hostName", this.get("hostName"));
  		}
  	},

  	__InitJobs: function () {
  		this.jobs = new BBApp.Jobs;
  		var self = this;


		// al agregar un job, debo agregarlo tambien a este controller
		this.jobs.on('add', function(job) {
			console.info("App.printerJobsController:: Hay un nuevo trabajo por imprimir %o, %o", self, job);
			self.logs = "Nuevo trabajo\n" + self.logs;
		});


		// al eliminar eun job, tambien devo quitar del controller
		this.jobs.on('remove', function(job) {
			console.info("Job remove:: se elimino un trabajo %o", job);
			self.logs = "Se borro un trabajo\n" + self.logs;
			//self.popObject( );
		});


		// verificar si estoy usando un browser "normal"
		if ( isNodeJs() ) {
			// si aun no configure el Host, que me muestre la pantalla al comienzo
			// es un proceso de configuracion inicial
			var gui = require('nw.gui');
			if ( !localStorage.getItem('urlHost') ) {
				alert("Falta configurar el HOST");
				gui.Window.get().show();	
			}	
		}


		// chequeo que no se corte nunca. y si se corta, lo vuelvo a arrancar
		var self = this;
		var interval = setInterval( function () {
			if ( !self.jobs.fetching ) {
				self.jobs.startFetch();
			}
		}, 13000 );
		


  		// sincronizo e intercepto errores para GUI
  		this.jobs.on('sync', function () {
  			self.set("online", 'green');
  		});
  		this.jobs.on('error', function () {  	
  			self.jobs.stopFetch();
  			self.set("online", 'yellow');
  			self.checkOnline();
  		});

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

  	

	retryFetch: function () {
		var online = this.get("online");
		if ( online != "red" ) {
			this.jobs.startFetch();
		}
	}.observes('online'),


	/**
	*
	* @return String Ej:"http://localhost/"+siteName;
	*
	**/
	getFullUrlSiteName: function () {
		return this.get("hostName") + "/" + this.get('siteName') + "/";
	},


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


	updateHostName: function () {
	  		localStorage.setItem("hostName", this.get("hostName"));
	  		this.updateUrlHost();
	  		this.__setLoginIframe();
  	}.observes('hostName'),

  	updateSiteName: function(){	
  			this.updateUrlHost();
  			this.__setLoginIframe();
	}.observes('siteName'),


	updateUrlHost: function(){	
  			var siteName = this.get('siteName');
  			var url = this.getFullUrlSiteName();
  			var urlHost = localStorage.getItem("urlHost");

  			if ( ValidURL( urlHost ) ) {
  				// esta ok
  				localStorage.setItem("siteName", siteName );
	  			localStorage.setItem("urlHost", urlHost );
	  			$("#g-url-host").removeClass("has-error");
	  			$("#g-url-host").addClass("has-success");
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
