<h1><a href="http://vibida.unizar.es/">Proyecto VIBIDA:</a> <span>Visualización multimedia de big data</span></h1>
=======================================================
<p align='justify'>La presente herramienta para la visualización de datos de Administraciones locales ha sido desarrollada en el marco del proyecto <i>Visualización multimedia de big data</i> (VIBIDA), perteneciente a la convocatoria del año 2013 de Proyectos de investigación en el ámbito de las tecnologías de la información y las comunicaciones, del Gobierno de Aragón. El proyecto está siendo desarrollado por el Laboratorio Avanzado de Aplicaciones Jurídicas y Empresarial en la Sociedad de la Información de la Universidad de Zaragoza, situado en el Parque Tecnológico Walqa, de Huesca (labje.unizar.es).</p>

<p align='justify'>La herramienta, que se considera desarrollada a nivel de prototipo, permite la visualización de datos de las Administraciones locales españolas, a partir de ficheros en formato XBRL proporcionados por el Ministerio de Economía y Hacienda. Se pueden visualizar los datos disponibles hasta la fecha, que corresponden a 2010, 2011 y 2012, pero como se utiliza un formato estándar es posible incorporar nueva información de forma sencilla. El software es de uso libre y está licenciado bajo licencia Creative Commons reconocimiento v.3. Para ponerse en contacto con los desarrolladores del proyecto puede enviar un correo electrónico a jfm@unizar.es.</p>

<p align='justify'>En la herramienta se reflejan los tres ejes en torno a los cuales se ha articulado el proyecto VIBIDA y que son los siguientes:</p>
<ul>
<li><h4>Utilización de estándares basados en XBRL</h4></li>
<li><h4>Visualización de los datos</h4></li>
<li><h4>Utilización de herramientas para datos masivos (<i>big data</i>)</h4></li>
</ul>
=======================================================
<h2>Instalacion de aplicación web</h2>
<h4>Requisitos máquina donde se hospeda la aplicación:</h4>
<ul>
<li><b>SO:</b> Windows 7 Enterprise, Service Pack 1</li>
<li><b>Procesador:</b> Intel(R) Xeon(R) CPU  E5606 @ 2.13GHz</li>
<li><b>RAM:</b> 1GB</li>
<li><b>Tipo de sistema:</b> 32 bits</li>
<li><b>Servidor Apache 2.2 con modulo PHP 5.3.8</b></li>
</ul>
<p align='justify'>Para poder instalar la aplicación web solo es necesario un <b>servidor Apache</b> con el módulo de <b>PHP</b> correspondiente habilitado. Descargando la carpeta <b>Web</b> del proyecto y colocandola en el directorio <b>htdocs</b> del servidor, se tendra un duplicado de la aplicación <a href="http://vibida.unizar.es/">VIBIDA</a>, salvo por la carpeta <b>data</b>, que solo posee ficheros de configuración e información general.</p>

<p align='justify'>Para poder acceder a los datos de administraciones locales desde 2010 hasta el último año con información que ha servido el <a href="http://www.minhap.gob.es/">Ministerio de Hacienda y Adminstraciones Públicas del Gobierno de España<a>, por el momento <b>2012</b>, se ha habilitado una URL donde poder <b>descargar</b> dicha información comprimida en un fichero <i>zip</i>. El enlace es el siguiente: <a href="http://vibida.unizar.es/datos_acum_periodo/">http://vibida.unizar.es/datos_acum_periodo/</a>. Dentro del fichero <i>zip</i> hay un carpeta <b>data</b>, al volcar su contenido en la homónima del servidor la aplicación será funcional.</p>

<p align='justify'>De momento en la web de VIBIDA (<a href="http://vibida.unizar.es/">http://vibida.unizar.es/</a>) existen datos de administraciones locales hasta el periodo 2012, a la espera de que salgan los datos de liquidación definitivos de 2013. Se seguirá alimentando con datos la página, con la limitación del tiempo que tarde el ministerio en publicar las cuentas, en consecuencia, la <a href="http://vibida.unizar.es/datos_acum_periodo/">URL</a> con ficheros <i>zip</i> también actualizará su contenido (utilizar siempre el más reciente).</p>
=======================================================
<h2>Datos de entrada la aplicación web</h2>

<p align='justify'>Para que la aplicación web funcione correctamente y pueda desplegar los gráficos de cada una de las secciones que la componen, debe estar alimentada por una serie de entradas de datos:</p>
<ul>
	<li>Ficheros <i>CSV</i> y <i>JSON</i> con información de las administraciones, generados a partir de ficheros <b>XBRL.</b></li>
	<li>Tablas <i>Google Fusion Tables</i> para alimentar <i>Google Maps</i>.</li>
	<li>Tablas <i>Google BigQuery</i> que poder consultar.</li>
</ul>
<p align='justify'>En la siguiente figura puede observarse un esquema simplificado de la estructura descrita:</p>
<div><img width="629" height="380" src="http://vibida.unizar.es/figures/inputs-web-vibida.png" alt="Inputs web VIBIDA"></div>
=======================================================
<h2>Procesado de datos XBRL</h2>
<p align='justify'>Para generar los <i>CSVs</i> y <i>JSONs</i> que alimentan la aplicación web del <a href="http://vibida.unizar.es/">proyecto VIBIDA</a>
, se ha partido de ficheros en formato <b>XBRL</b> (<i>eXtensible Business Reporting Language</i>), estándar XML para intercambio de información financiera.</p>

<p align='justify'>Los ficheros utilizados siguen dos taxonomías <b>PENLOC</b> y <b>LENLOC</b>, con información de presupuestos y liquidación de 
presupuestos de entidades locales respectivamente, ambas implementadas por el Ministerio de Hacienda y Adminstraciones Públicas del Gobierno de España. Los datos están accesibles en la siguiente URL:</p> 
<ul><li><a href="http://serviciostelematicos.sgcal.minhap.gob.es/DescargaPresLiqXBRL/">http://serviciostelematicos.sgcal.minhap.gob.es/DescargaPresLiqXBRL/</a>.</li></ul>

<p align='justify'>Para transformar estos datos se ha utilizado una serie de scripts en lenguaje de programación <b>Python</b>, que estan disponibles en el directorio
 <b>Python_Scripts</b> del repositorio. Los scripts funcionan sobre la versión de <b>Python 2.7.5</b>, por lo que será necesario tener instalada dicha versión en 
 la máquina destinada al procesado. La información pasará por una serie de estados intermedios antes de llegar a los datos utilizados en la aplicación web, en el
 siguiente esquema de caja negra se puede observar las salidas que se quieren generar:</p>
<div><img src="http://vibida.unizar.es/figures/outputs-scripts-vibida.png" alt="Outputs scripts VIBIDA"></div>

<p align='justify'>Los pasos seguidos para, a partir de los <b>XBRL</b> del ministerio, llegar a la información deseada, quedan documentados dentro del 
directorio <b>Python_Scripts</b> para facilitar la reutilización de los scripts.</p>


<a href="http://labje.unizar.es/"> <img align="right" src="http://labje.unizar.es/sites/default/files/LabJE.png" id="logo" /></a>
