nw-print-client
===============

Servidor de impresión para el Ristorantino basado en Node-webkit 

Se trata de un sistema que busca por nuevas impresionas dada una determinada cantidad de tiempo. El servidor entregará un json con todas las impresiones pendientes. Pueden ser de impresora fiscal o impresora común.

La idea es que sea ejecutado como un proceso background y que se mantenga minimizado como Tray Icon.
La pagina principal debera mostrar la actividad, y deberá tener otra página donde se pueda configurar las impresoras.



Protocolo JSON de jobs a ser enviados
[	{
	"id":1, // ID del job
  	"printer":"nombreImpresora1",
  	"fiscal":true,
  	"text":"TEXTO A IMPRIMIR TEXTO A IMPRIMIR TEXTO A IMPRIMIR TEXTO A IMPRIMIR"
  	},

  	{
  	"id":2, // ID del job
  	"printer":"nombreImpresora2",
  	"fiscal":false,
  	"text":"OTRO TEXTO A IMPRIMIR TEXTO A IMPRIMIR TEXTO A IMPRIMIR TEXTO A IMPRIMIR"
  	}
]


Cuando se termina la impresión se debera enviar un DELETE del job al servidor