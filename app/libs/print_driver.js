
console.debug("iniciando print driver");

(function () {

	var os = require('os');
	var tmpFolder = os.tmpdir();
	console.info("la carpeta temporal del sistema es "+tmpFolder);
	var tmp = require("tmp");
	var fs = require("fs");
	var path = require("path");
	var spawn = require("child_process").spawn;

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
					throw "El SO "+process.platform+" no nesta soportado";
				},

				win32: function ( printerName, fpath) {
					//var comando = fs.realpathSync("bin") + path.sep + "spooler.exe -p"+printerName+" -f "+fpath+" -b "+tmpFolder;
					var comando = {
						cm: "spooler.exe",
						args: [ 
							"-p"+printerName,
						 	"-f "+fpath,
						 	"-b "+tmpFolder
						]
					}

					return comando;
				},

				linux: function ( printerName, fpath) {
					var comando = {
						cm: "./spooler",
						args: [ 
							"-p"+printerName,
						 	"-f "+fpath,
						 	"-b "+tmpFolder
						]
					};
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


		    	console.log(comando.cm);
		    	try{
		    		var ops = {
		    			cwd: 'bin/'
					}
					console.info( " - - - - - - - - - -- -- -  - - - - - - - " + fs.realpathSync(ops.cwd) );
					/*
		    		var sp = spawn( comando.cm, comando.args, ops );


		    		sp.stdout.on('data', function (data) {
					  console.log('stdout: ' + data);
					  def.resolve(data);
					});

					sp.stderr.on('data', function (data) {
					  def.reject(data);
					  console.error('stderr: ' + data);
					});

					sp.on('close', function (code) {
					  console.log('child process exited with code ' + code);
					});
					*/
		    	} catch(e) {
		    		console.error("Fallo manolo");
		    		console.error(e);

		    	}
					

				

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
