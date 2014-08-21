
console.debug("iniciando print driver");

(function () {

	var os = require('os');
	var tmpFolder = os.tmpdir();
	console.info("la carpeta temporal del sistema es "+tmpFolder);
	var tmp = require("tmp");
	var fs = require("fs");
	var exec = require("child_process").exec;

	var mainOb = {
		createTmpFile: function ( job, callback) {
			var file;
			

			// generar archivo tenporal
			tmp.tmpName({ mode: 0644, prefix: 'printing-', postfix: '.job' }, function _tempNameGenerated(err, path) {
			    if (err) throw err;
			    // escribir job en archivo
			    fs.writeFile( path, job.text, {encoding:'ascii'}, function(){
			    	if ( typeof callback == 'function' ) {
			    		callback.call(this, path, job );
			    	} 
			    });	 
		    	  
			});
		},


		comando: {
			fiscal: {
				get: function(){			
					if ( mainOb.comando.fiscal.hasOwnProperty( process.platform )) {
						return mainOb.comando.fiscal[process.platform].apply( this , arguments );
					}
					throw "El SO "+process.platform+" no esta soportado";
				},

				win32: function ( printerName, fpath) {
					var comando = "spooler.exe -p"+printerName+" -f "+fpath+" -b "+tmpFolder;
					return comando;
				},

				linux: function ( printerName, fpath) {
					var comando = "spooler -p"+printerName+" -f "+fpath+" -b "+tmpFolder;
					return comando;
				}
			},


				

			print: {
				get: function () {
					if ( mainOb.comando.print.hasOwnProperty( process.platform )) {
						return mainOb.comando.print[process.platform].apply( this , arguments );
					}
					throw "El SO "+process.platform+" no esta soportado";
				},

				linux: function (printerName, path) {
					return  "lp -d "+printerName+" "+path;
				},

				win32: function  (printerName, path) {
					return  "PRINT /D:"+printerName+" "+path;
				}
			}
		},

		






		/**
		*  @param comandoName string puede ser: {"comando_print" o "comando_fiscal"}
		*	@job es el Job a imprimir
		**/
		temporalFilePrint: function ( comandoName, job ) {
			var $ = require("jquery");
			var def = $.Deferred();
			// si es browser normal salir sin imprimir

			mainOb.createTmpFile( job, function(path){
				console.info("se creo archivo temporal "+path);
		    	// imprimir con spooler
		    	var comando = mainOb.comando[comandoName].get.call(this, job.Printer.name, path)    	
			
				var proccess = exec(comando, function (error, stdout, stderr) {

					console.info("se mando a imprimir el comando "+comando);
					
					if (stderr){
						def.reject(stderr);
						console.error(stderr);
					}					
					console.debug(error);
					console.debug(stdout);
					busy = false;
					def.resolve(stdout);
				});
		    });
		    
		    return def.promise();
		},




		drivers: {
			LpFiscal: {
				busy: false,
				lp: function ( job ) {
						return mainOb.temporalFilePrint('fiscal', job);
				}
			},


			LpCommon: {
				lp: function ( job ) {
						return mainOb.temporalFilePrint('print', job);
				}
			}
		}
	}



	/**
	*	Muestra los drivers disponibles
	**/
	exports.listDriver = function ( driverName ) {
		return mainOb.drivers;
	}


	/**
	*
	*	Los posibles drivers estan listados en mainOb.drivers
	**/
	exports.getDriver = function ( driverName ) {
		if ( mainOb.drivers[driverName] ) {
			return mainOb.drivers[driverName];
		} else {
			throw "driver '" + driverName + "' not found";
		}
	}
	
})();
