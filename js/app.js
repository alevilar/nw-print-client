

App = Ember.Application.create();

BINPATH = 'dist/' + process.platform;
DOMAIN = "localhost";
URLDOMAIN = "http://"+DOMAIN+"/chocha012";
URLPRINTJOBS = URLDOMAIN + "/printer_jobs";



App.Router.map(function() {
  // put your routes here
});







App.ApplicationController = Ember.Controller.extend({
  online: false,
  logged: false,

  onlineLoggedClassName: function () {
  	if (this.isLoggedOnline())
  		return 'online'
  	else
  		return 'offline'
  }.observes('isLoggedOnline'),

  checkOnline: function() {
	var self = this;
  	require('dns').resolve( DOMAIN, function(err) {
		  if (err) {
		  	self.set('online', false);
		  } else {
		  	self.set('online', true);
		  }
		});

  },

  checkLogged: function () {
  	var self = this;
  	var LoginUser = {
		'data[User][username]': 'admin',
		'data[User][password]': 'admin'
	};
  	$.ajax({
			type: "POST",
			url: URLDOMAIN+"/users/login",
			data: LoginUser
		}).done(function( ){
			$.ajax({
				type: "GET",
				url: URLDOMAIN+"/printer_jobs/monitor",
				data: LoginUser
			}).done(function(data){
				self.set('logged', true);
			});
			
		}).error(function(){
			self.set('logged', false);
		});

  },

  init: function () {
  	this.checkOnline();
  	this.checkLogged();
  },

  isLoggedOnline: function() {
    var o = this.get('online'),
    	l = this.get('logged');
    	return (o && l);

  }.property('online', 'logged')
});

