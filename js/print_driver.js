function createTmpFile( job, callback) {
	var tmpFolder = os.tmpdir();

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
}




function __comando_fiscal_win32 ( printerName, fpath) {
	var comando = "wspooler -p"+printerName+" -f "+fpath;
	return comando;
	
}

function __comando_fiscal_linux ( printerName, fpath) {
	var comando = "./spooler -p"+printerName+" -f "+fpath;
	return comando;
	
}

function comando_fiscal(){
	var fname = "__comando_fiscal_"+os.platform();
	if ( window.hasOwnProperty( fname )) {
		return window[fname].apply(this,arguments);
	}
	// throw "El SO "+os.platform()+" no esta soportado";
}


function __comando_print_linux (printerName, path) {
	return  "lp -d "+printerName+" "+path;
}

function __comando_print_win32 (printerName, path) {
	return  "PRINT /D "+printerName+" "+path;
}


function comando_print(){
	var fname = "__comando_print_"+os.platform();
	if (window.hasOwnProperty( fname )) {
		return window[fname].apply(this, arguments);
	}
	throw "El SO "+os.platform()+"no esta soportado";
}

var LpFiscal = {
	busy: false,
	lp: function ( job ) {
			var ref = $.Deferred();
			busy = true;
			createTmpFile(job,function(path){
		    	// imprimir con spooler		    	
		    	var comando = comando_fiscal(job.Printer.name, path);
			    var proccess = exec(comando, function (error, stdout, stderr) {
					

					if (stderr){
						console.error(stderr);
						ref.rejected();
						return;
					}	

					busy = false;
					ref.resolve();
				});	
		    });

			return ref.promise();
	}
}


var LpCommon = {
	lp: function ( job ) {
			var ref = jQuery.Deferred();
			createTmpFile(job,function(path){
		    	// imprimir con spooler
		    	var comando = comando_print(job.Printer.name, path);
	    	
	    		var proccess = exec(comando, function (error, stdout, stderr) {
					console.info("Comando "+comando);

					if (stderr){
						console.error(stderr);
						ref.rejected();
					}					
					busy = false;
					ref.resolve();
				});	
		    	

		    });
		    
		    return ref.promise();
	}
}