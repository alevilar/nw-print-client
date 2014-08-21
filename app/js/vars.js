// printer = require("printer");
// console.debug(printer);

function isNodeJs () {
	if ( typeof require === "undefined" ) {
		return false;
	}	

	os = require("os");
	tmp = require("tmp");
	fs = require("fs");
	exec = require("child_process").exec;

	return true;
}


(function(){
	
      if ( typeof process != 'undefined' && process.platform) {
        BINPATH = 'dist/' + process.platform; 
      }



    // Load native UI library
	var gui = require('nw.gui');


	var win = gui.Window.get();


	// debug mode
	win.showDevTools();


	// Create a tray icon
	var tray = new gui.Tray({ title: 'PaxaPOS', icon: 'icon.png' });

	// Give it a menu
	var menu = new gui.Menu();

	

	var loadMenu = function() 
	{
		console.debug("creando MENU. Esto deberia pasar solo 1 vez en la vida");


		var urlHost = localStorage.getItem("urlHost");
		if ( urlHost ) {
			menu.append( new gui.MenuItem({
			  type: "normal", 
			  label: "Ingresar modo POS",
			  icon: "app/img/sys.png",
			  click: function(){
			  	var winnn = gui.Window.open( urlHost+"/adition/adicionar", {
					    "show": true,
					    "toolbar": false,
					    "always-on-top": false,
					    "frame": true,
					    "resizable": true
					  });
			  }
			}) );


			menu.append( new gui.MenuItem({
			  type: "normal",
			  label: "Fiscal",
			  icon: "app/img/fiscal_printer.png",
			  click: function(){
			  	gui.Window.open( urlHost + "/comanderas/fiscal_edit", {
					    "show": true,
					    "toolbar": true,
					    "always-on-top": false,
					    "frame": true,
					    "width": 600,
					    "height": 600,
					    "resizable": true
					  });
			  }
			}) );

			menu.append( new gui.MenuItem({
			  type: "normal", 
			  label: "Comanderas",
			  icon: "app/img/comandera.png",
			  click: function(){
			  	gui.Window.open( urlHost + "/comanderas/index", {
					    "show": true,
					    "toolbar": true,
					    "always-on-top": false,
					    "frame": true,
					    "width": 600,
					    "height": 600,
					    "resizable": true
					  });
			  }
			}) );


			
			var toggleVentanaPpal = function () {
					win.show();
			  		win.focus();	
			}

			menu.append( new gui.MenuItem({
			  type: "normal", 
			  label: "Configuración",
			  icon: "app/img/config.png",
			  click: toggleVentanaPpal
			}) );


			menu.append( new gui.MenuItem({
			  type: "normal", 
			  label: "Salir",
			  icon: "app/img/bye.png",
			  click: function(){
			  		gui.App.quit();		
			  }
			}) );

			tray.menu = menu;

			tray.on('click', toggleVentanaPpal);

			// luego de ejecutar, no ejecutar mas. Convertir esta funcion en una NOoP
			loadMenu = function() {}
		}
	}

	loadMenu();




})();
