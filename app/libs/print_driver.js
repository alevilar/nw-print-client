
console.debug("iniciando print driver");

(function () {

	var os = require('os');
	var tmpFolder = os.tmpdir();
	console.info("la carpeta temporal del sistema es "+tmpFolder);
	var tmp = require("tmp");
	var fs = require("fs");
	var path = require("path");
	var spawn = require("child_process").spawn;
	var exec = require("child_process").exec;
	var execFile = require("child_process").execFile;

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
					var fullPath = fs.realpathSync('bin');
					
					//return  fullPath + path.sep +"spooler -p"+printerName+ " -f "+fpath+" -b"+tmpFolder;

					var comando = {
						cm: fullPath + path.sep +"wspooler",
						args: [
							"-p"+printerName,
							"-f",
							fpath,
							"-b",
							tmpFolder
						]
					}
					return comando;
				},

				linux: function ( printerName, fpath) {	
					var fullPath = fs.realpathSync('bin');	

					var comando = {
						cm: fullPath + path.sep + "spooler",
						args: [
							"-p"+printerName,
							"-f",
							fpath,
							"-b",
							tmpFolder
						]
					}
					return comando;			
					//return fullPath + path.sep +"spooler -p"+printerName+ " -f "+fpath+" -b"+tmpFolder;
				}
			},


				

			print: {
				get: function () {
					if ( mainOb.comando.print.hasOwnProperty( process.platform )) {
						return mainOb.comando.print[process.platform].apply( this , arguments );
					}
					throw "El SO "+process.platform+" no esta soportado";
				},

				linux: function (printerName, filePath) {
					var comando = {
						cm: "lp",
						args: [
							"-d",
							printerName,
							filePath
						]
					}
					return comando;
					//return  "lp -d "+printerName+" "+filePath;
				},

				win32: function  (printerName, filePath) {

					var comando = {
						cm: "PRINT",
						args: [
							"/D:"+printerName,
							filePath
						]
					}
					return comando;

					//return  "PRINT /D:"+printerName+" "+filePath;
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

			mainOb.createTmpFile( job, function(pathName){
				console.info("se creo archivo temporal "+pathName);
		    	// imprimir con spooler
		    	var comando = mainOb.comando[comandoName].get.call(this, job.Printer.name, pathName)    		    
		    	
		    	console.info( " OOO-  - - - - - - - IMPRIMIENDOOOOOOOOOOOO");
		    	console.log( comando);

		    	try{

		    		var sp = execFile( comando.cm, comando.args);

		    		console.info("se ejecuto");
		    		
		    		sp.stdout.on('data', function (data) {
					  console.log('stdout: ' + data);
					  def.resolve(data);
					});

					sp.stderr.on('data', function (data) {
					  def.reject(data);
					  console.error('stderr: ' + data);
					});

					sp.on('close', function (code) {
						def.resolve(code);
					    console.log('child process exited with code ' + code);
					});

		    	} catch(e) {
		    		def.reject(e);
		    		console.error("Fallo al imprimir");
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
