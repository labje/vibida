/********************************************************************/
/* Fichero: 	manageGraphics.js                                   */
/* Autor: 		David Gracia Larrodé   dagrala@gmail.com            */
/* Descripción: Script con funciones que adecuan los diferentes     */
/*              gráficos a la estructura de la página, necesario    */
/*              "chartsScript.js"                                   */
/********************************************************************/


/***************************************************************/
/*       Funciones relacionadas con los Gauge chart            */
/***************************************************************/
var gauges = []; //array que contendra los diferentes gráficos Gauge
gauges.len = 0;

//Función que crea un gráfico de Gauge y lo añade al array gauges
function createGauge(name, label, typeData, size, min, max, q1, q3, med){
	var config = {
		size: undefined != size ? size : 300,
		label: label,
		typeData: undefined != typeData ? typeData : "",
		min: undefined != min ? min : 0,
		max: undefined != max ? max : 100,
		q1: undefined != q1 ? q1 : 25,
		q3: undefined != q3 ? q3 : 75,
		med: undefined != med ? med : 50,
		minorTicks: 5
	}
	
	var range = config.max - config.min;
	config.greenColor = "#98DF8A";
	config.redColor = "#FF9896";
	config.greenZones = [{ from: config.q3, to: config.max}];
	config.redZones = [{ from: config.min, to: config.q1}];
	
	gauges[name] = new Gauge(name + "GaugeContainer", config);
	gauges.len++;
	gauges[name].draw();
}

//Función que crea todos los Gauges necesarios para la página, uno por indicador
function createGauges(){
	//Indicador "Déficit/Superávit per cápita"
	if(display_config["section1"]["slides"][0].indexOf("indicador1") >= 0)
		createGauge("ratio1", "", "€", ratioDashboardWidth, currentIndicatorLimits[1].p5, currentIndicatorLimits[1].p95, currentIndicatorLimits[1].q1, currentIndicatorLimits[1].q3, currentIndicatorLimits[1].med);
	//Indicador "Ahorro neto per cápita"
	if(display_config["section1"]["slides"][0].indexOf("indicador2") >= 0)
		createGauge("ratio2", "", "€", ratioDashboardWidth, currentIndicatorLimits[2].p5, currentIndicatorLimits[2].p95, currentIndicatorLimits[2].q1, currentIndicatorLimits[2].q3, currentIndicatorLimits[2].med);
	//Indicador "Ahorro bruto per cápita"
	if(display_config["section1"]["slides"][0].indexOf("indicador3") >= 0)
		createGauge("ratio3", "", "€", ratioDashboardWidth, currentIndicatorLimits[3].p5, currentIndicatorLimits[3].p95, currentIndicatorLimits[3].q1, currentIndicatorLimits[3].q3, currentIndicatorLimits[3].med);
	//Indicador "Estabilidad presupuestaria"
	if(display_config["section1"]["slides"][1].indexOf("indicador4") >= 0)
		createGauge("ratio4", "", "€", ratioDashboardWidth, currentIndicatorLimits[4].p5, currentIndicatorLimits[4].p95, currentIndicatorLimits[4].q1, currentIndicatorLimits[4].q3, currentIndicatorLimits[4].med);
	//Indicador "Gasto público por habitante"
	if(display_config["section1"]["slides"][1].indexOf("indicador5") >= 0)
		createGauge("ratio5", "", "€", ratioDashboardWidth, currentIndicatorLimits[5].p5, currentIndicatorLimits[5].p95, currentIndicatorLimits[5].q1, currentIndicatorLimits[5].q3, currentIndicatorLimits[5].med);
	//Indicador "Gasto de inversión por habitante"
	if(display_config["section1"]["slides"][1].indexOf("indicador6") >= 0)
		createGauge("ratio6", "", "€", ratioDashboardWidth, currentIndicatorLimits[6].p5, currentIndicatorLimits[6].p95, currentIndicatorLimits[6].q1, currentIndicatorLimits[6].q3, currentIndicatorLimits[6].med);
	//Indicador "Gasto de inversión directo por habitante"
	if(display_config["section1"]["slides"][2].indexOf("indicador7") >= 0)
		createGauge("ratio7", "", "€", ratioDashboardWidth, currentIndicatorLimits[7].p5, currentIndicatorLimits[7].p95, currentIndicatorLimits[7].q1, currentIndicatorLimits[7].q3, currentIndicatorLimits[7].med);
	//Indicador "Ingresos fiscales por habitante"
	if(display_config["section1"]["slides"][2].indexOf("indicador8") >= 0)
		createGauge("ratio8", "", "€", ratioDashboardWidth, currentIndicatorLimits[8].p5, currentIndicatorLimits[8].p95, currentIndicatorLimits[8].q1, currentIndicatorLimits[8].q3, currentIndicatorLimits[8].med);
	//Indicador "Autonomía fiscal"
	if(display_config["section1"]["slides"][2].indexOf("indicador9") >= 0)
		createGauge("ratio9", "", "%", ratioDashboardWidth, 0, 1, currentIndicatorLimits[9].q1, currentIndicatorLimits[9].q3, currentIndicatorLimits[9].med);
	//Indicador "Incremento de deuda per cápita"
	if(display_config["section1"]["slides"][2].indexOf("indicador10") >= 0)
		createGauge("ratio10", "", "€", ratioDashboardWidth, currentIndicatorLimits[10].p5, currentIndicatorLimits[10].p95, currentIndicatorLimits[10].q1, currentIndicatorLimits[10].q3, currentIndicatorLimits[10].med);
}

//Función que actualiza los Gauges
function updateGauges(value){
	var indicators = display_config["section1"]["slides"].map(function(e){return e.map(function(n){return n.slice(9)}).join();}).join().split(",").map(function(v){return parseInt(v)});
	
	indicators.forEach(function(i){
		if(i == 9){ //indicador "Autonomía fiscal" en tanto por 1 que hay que pasar a tanto por 100
			var obj = new Object({min:0, max:1, q1:currentIndicatorLimits[i].q1, 
						q3:currentIndicatorLimits[i].q3, med:currentIndicatorLimits[i].med, value:value[i-1]});

			gauges["ratio"+i].redraw(obj);
			
		} else {
			var obj = new Object({min: currentIndicatorLimits[i].p5, max:currentIndicatorLimits[i].p95, 
				 q1:currentIndicatorLimits[i].q1, q3:currentIndicatorLimits[i].q3, med:currentIndicatorLimits[i].med, value:value[i-1]});
			
			gauges["ratio"+i].redraw(obj);
		}
	});

	if(eventos[0].dispatch){
		eventos[0].dispatch = false;
		document.dispatchEvent(eventos[0].evt);
	}
}

/***************************************************************/
/*     Funciones relacionadas con los line chart               */
/***************************************************************/
var lines = []; //array que contendra los diferentes gráficos line chart

//Función que crea un gráfico line chart o de línea y lo añade al array lines
function createLine(name, label, data, width, height,color){
	var config = {
		label: label,
		margin: {top: 20, right: 20, bottom: 30, left: 50},
		width: undefined != width ? width : 300,
		height: undefined != height ? height : 100,
		color: undefined != color ? color : "steelblue",
		data: data,
		ticks: 4
	}
	
	lines[name] = new Line(name + "LineContainer", config);
	lines[name].draw();
}

//Función que crea todos los Gauges necesarios para la página, uno por indicador
function createLines(){
	var dataInfo = [
		{"fecha": "2011", "valor": "0.0"},
		{"fecha": "2010", "valor": "0.0"}
	];
	
	//Muestra la evolución del indicador "Déficit/Superávit per cápita"
	if(display_config["section1"]["slides"][0].indexOf("indicador1") >= 0)
		createLine("line1", "Line1", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Ahorro neto per cápita"
	if(display_config["section1"]["slides"][0].indexOf("indicador2") >= 0)
		createLine("line2", "Line2", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Ahorro bruto per cápita"
	if(display_config["section1"]["slides"][0].indexOf("indicador3") >= 0)
		createLine("line3", "Line3", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Estabilidad presupuestaria"
	if(display_config["section1"]["slides"][1].indexOf("indicador4") >= 0)
		createLine("line4", "Line4", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Gasto público por habitante"
	if(display_config["section1"]["slides"][1].indexOf("indicador5") >= 0)
		createLine("line5", "Line5", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Gasto de inversión por habitante"
	if(display_config["section1"]["slides"][1].indexOf("indicador6") >= 0)
		createLine("line6", "Line6", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Gasto de inversión directo por habitante"
	if(display_config["section1"]["slides"][2].indexOf("indicador7") >= 0)
		createLine("line7", "Line7", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Ingresos fiscales por habitante"
	if(display_config["section1"]["slides"][2].indexOf("indicador8") >= 0)
		createLine("line8", "Line8", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Autonomía fiscal"
	if(display_config["section1"]["slides"][2].indexOf("indicador9") >= 0)
		createLine("line9", "Line9", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
	//Muestra la evolución del indicador "Incremento de deuda per cápita"
	if(display_config["section1"]["slides"][2].indexOf("indicador10") >= 0)
		createLine("line10", "Line10", dataInfo, ratioDashboardWidth, ratioDashboardWidth*0.75);
}

//Función que actualiza los gráficos de línea
function updateLines(data){

	var indicators = display_config["section1"]["slides"].map(function(e){return e.map(function(n){return n.slice(9)}).join();}).join().split(",").map(function(v){return parseInt(v)});
	indicators.forEach(function(i){
		if(i == 9){//indicador "Autonomía fiscal" en tanto por 1 que hay que pasar a tanto por 100
			var arr = new Array();
			for(var j = 0; j < data[i-1].length; j++){
				arr.push({"fecha":data[i-1][j].fecha, "valor": data[i-1][j].valor*100});
			}
			lines["line"+i].redraw(arr);
		} else {
			lines["line"+i].redraw(data[i-1]);
		}
	});
}

/***************************************************************/
/*       Funciones relacionadas con el componente legend       */
/***************************************************************/

// var legendHBar = null;
var legends = []; //array que contendra las diferentes leyendas

//Función que crea un gráfico leyenda y lo añade al array legends
function createLegend(name, data, width, height, orientation, colors){
	var config = {
		margin: {top: 20, right:20, bottom:20, left:20},
		width: undefined != width ? width : 340,
		height: undefined != height ? height : 90,
		orientation: undefined != orientation ? orientation : "vertical",
		colors: undefined != colors ? colors : ["#AEC7E8","#FFBB78"],
		data: data
	}
	
	legends[name] = new Legend(name + "LegendContainer", config)
	legends[name].draw();
}

/***************************************************************/
/* Funciones relacionadas con los horizontal grouped bar chart */
/***************************************************************/

var hBars = []; //array que contendra los diferentes gráficos horizontal grouped bar chart

//Función que crea un gráfico de barras horizontales agrupadas y lo añade al array hBars
function createHBar(name, data, typeData, dec, width, height, title, colors, zeroNull){
	var config = {
		typeData: undefined != typeData ? typeData : "", //f -> fixed, % -> percentage
		dec: undefined != dec ? dec : 2,
		margin: {top: 30, right:30, bottom:50, left:20},
		width: undefined != width ? width : 300,
		height: undefined != height ? height : 300,
		title: undefined != title ? title : null,
		legend: "none",
		colors: undefined != colors ? colors : ["#AEC7E8","#FFBB78"],
		data: data,
		ticks: name.slice(0,-1) == "ratio" ? 4 : 2,
		zeroNull: undefined != zeroNull ? zeroNull : false
	}
	
	
	hBars[name] = new HBar(name + "HBarContainer", config);
	hBars[name].draw();
}


//Función que crea todos los HBAR necesarios de la sección "Comparar dos administraciones" y la leyenda correspondiente
function createHBars(){
	var dataInfo = [
		{name: "A", value: -10.0, label: "labelA"},
		{name: "B", value: 10.0, label: "labelB"},
		{name: "C", value: 5.0, label: "labelC"}
	];

	var dataLegend = [
		{name: "A", label: "labelA"},
		{name: "B", label: "labelB"},
		{name: "C", label: "Promedio nacional"}
	];
	
	//Comparación del indicador "Déficit/Superávit per cápita"
	if(display_config["section3"]["slides"][0].indexOf("indicador1") >= 0)
		createHBar("ratio1", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Ahorro neto per cápita"
	if(display_config["section3"]["slides"][0].indexOf("indicador2") >= 0)
		createHBar("ratio2", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Ahorro bruto per cápita"
	if(display_config["section3"]["slides"][0].indexOf("indicador3") >= 0)
		createHBar("ratio3", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Estabilidad presupuestaria"
	if(display_config["section3"]["slides"][1].indexOf("indicador4") >= 0)
		createHBar("ratio4", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Gasto público por habitante"
	if(display_config["section3"]["slides"][1].indexOf("indicador5") >= 0)
		createHBar("ratio5", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Gasto de inversión por habitante"
	if(display_config["section3"]["slides"][1].indexOf("indicador6") >= 0)
		createHBar("ratio6", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Gasto de inversión directo por habitante"
	if(display_config["section3"]["slides"][2].indexOf("indicador7") >= 0)
		createHBar("ratio7", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Ingresos fiscales por habitante"
	if(display_config["section3"]["slides"][2].indexOf("indicador8") >= 0)
		createHBar("ratio8", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Autonomía fiscal"
	if(display_config["section3"]["slides"][2].indexOf("indicador9") >= 0)
		createHBar("ratio9", dataInfo, "%", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	//Comparación del indicador "Incremento de deuda per cápita"
	if(display_config["section3"]["slides"][2].indexOf("indicador10") >= 0)
		createHBar("ratio10", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#FFBB78","#CCC"]);
	
	//Leyenda con las administraciones a comparar
	createLegend("indiComp", dataLegend, 750, 60, "horizontal", ["#AEC7E8","#FFBB78","#CCC"]);
	
}

//Función que actualiza los gráficos HBar de la sección "Comparar dos administraciones" y su leyenda
function updateHBars(data1, data2, names){
	var indicators = display_config["section3"]["slides"].map(function(e){return e.map(function(n){return n.slice(9)}).join();}).join().split(",").map(function(v){return parseInt(v)});
	
	indicators.forEach(function(i){
		var data = [
			{name:"A", value:data1[i-1], label:names[0]},
			{name:"B", value:data2[i-1], label:names[1]},
			{name:"C", value:currentIndicatorLimits[i].med, label:"Promedio nacional"}
		];
		hBars["ratio"+i].redraw(data);
	});

	legends["indiComp"].redraw([{name: "A", label: names[0]},{name: "B", label: names[1]},{name: "C", label: "Promedio nacional"}]);

	if(eventos[2].dispatch){
		eventos[2].dispatch = false;
		document.dispatchEvent(eventos[2].evt);
	}
}

/***************************************************************/
/*     Funciones relacionadas con los treemap y su sección     */
/***************************************************************/
var treemaps = []; //array que contendra los diferentes gráficos treemap

//Función que crea un gráfico treemap o de areas y lo añade al array treemaps
function createTreemap(name, label, fileName, targetColumn, thumbnailNames, thumbsContainer, thumbHeadNames, width, height, abbreviations){
	var config = {
		label: label,

		margin: {top:10, right:10, bottom:10, left:10},
		width: undefined != width ? width : 900,
		height: undefined != height ? height : 500,
		fileName: fileName,
		targetColumn: targetColumn,
		thumbnailNames: thumbnailNames,
		thumbsContainer: thumbsContainer,
		thumbHeadNames: thumbHeadNames,
		abbrs: undefined != abbreviations ? abbreviations : null
	}
	
	treemaps[name] = new Treemap(name + "TreemapContainer", config);
	treemaps[name].draw();
}

//Textos abreviados a nivel de capítulo de cuentas de ingresos, gastos y clasificación por programa
var abbrs = {
	//Gastos
	"GASTOS DE PERSONAL":"GTOS PERSONAL",
	"GASTOS CORRIENTES EN BIENES Y SERVICIOS":"GTOS CORRIENTES",
	"GASTOS FINANCIEROS":"GTOS FINANCIEROS",
	"TRANSFERENCIAS CORRIENTES":"TRANSF.CORRIENTES",
	"FONDO DE CONTINGENCIA Y OTROS IMPREVISTOS":"FONDO DE CONTINGENCIA", //Añadido por nueva cuenta de gastos cap5
	"INVERSIONES REALES":"INVERSIONES",
	"TRANSFERENCIAS DE CAPITAL":"TRANSF. CAPITAL",
	"ACTIVOS FINANCIEROS":"ACTIVOS FINAN.",
	"PASIVOS FINANCIEROS":"PASIVOS FINAN.",
	//Ingresos
	"IMPUESTOS DIRECTOS":"IMP. DIRECTOS",
	"IMPUESTOS INDIRECTOS":"IMP. INDIRECTOS",
	"TASAS, PRECIOS PÚBLICOS Y OTROS INGRESOS":"TASAS, PRECIOS",
	"TRANSFERENCIAS CORRIENTES":"TRANSF. CORRIENTE",
	"INGRESOS PATRIMONIALES":"ING. PATRIM.",
	"ENAJENACIÓN DE INVERSIONES REALES":"ENAJ. INVERSIONES",
	"TRANSFERENCIAS DE CAPITAL":"TRANSF. CAPITAL",
	"ACTIVOS FINANCIEROS":"ACTIVOS FINAN.",
	"PASIVOS FINANCIEROS":"PASIVOS FINAN.",
	//Por Programa
	"DEUDA PÚBLICA":"DEUDA PÚBLICA",
	"SERVICIOS PÚBLICOS BÁSICOS":"S. PÚBLICOS BÁSICOS",
	"ACTUACIONES DE PROTECCIÓN Y PROMOCIÓN SOCIAL":"PROTECCIÓN Y PROM. SOCIAL",
	"PRODUCCIÓN DE BIENES PÚBLICOS DE CARÁCTER PREFERENTE":"BIENES PREFERENTES",
	"ACTUACIONES DE CARÁCTER ECONÓMICO":"ACTUACIONES ECAS.",
	"ACTUACIONES DE CARÁCTER GENERAL":"ACTUACIONES GRALES."
}

//Función que crea todos los gráficos de área, los HBar del slide complementario y la leyenda correspondiente
function createTreemaps(){

	//fichero con información de gastos de la diputación de Zaragoza para el periodo 2011, valor inicial del treemap
	var liqName = "data/2011-50000DD00-gast.csv"; 
	var liqThumbs = ["thumb4TreemapContainer", "thumb5TreemapContainer", "thumb6TreemapContainer"];
	var liqHeadThumbs = ["thumbHeader4", "thumbHeader5", "thumbHeader6"];

	var dataInfo = [
		{name: "A", value: 20.0, label: "labelA"},
		{name: "B", value: 10.0, label: "labelB"}
	];

	var dataLegend = [
		{name: "A", label: "Presupuesto"},
		{name: "B", label: "Liquidación"}
	];

 
	//Se crea treemap
	if(display_config["section2"]["slides"][0].indexOf("treemap") >= 0)
		createTreemap("liq", "Liquidación", liqName, "Lenloc_context1", liqThumbs, "dashboard211", liqHeadThumbs, ratioDashboardWidth*3, ratioDashboardWidth*2, abbrs);
	//Se crean HBars y la leyenda
	if(display_config["section2"]["slides"][1].indexOf("hbars") >= 0){
		createHBar("cap1", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "1. IMPUESTOS DIRECTOS");
		createHBar("cap2", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "2. IMPUESTOS INDIRECTOS");
		createHBar("cap3", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "3. TASAS, PRECIOS PÚBLICOS Y OTROS INGRESOS");
		createHBar("cap4", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "4. TRANSFERENCIAS CORRIENTES");
		createHBar("cap5", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "5. INGRESOS PATRIMONIALES");
		createHBar("cap6", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "6. ENAJENACIÓN DE INVERSIONES REALES");
		createHBar("cap7", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "7. TRANSFERENCIAS DE CAPITAL");
		createHBar("cap8", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "8. ACTIVOS FINANCIEROS");
		createHBar("cap9", dataInfo, "€", 0, ratioDashboardWidth, Math.max((ratioDashboardWidth*2)/3, 110), "9. PASIVOS FINANCIEROS");

		createLegend("liqPre", dataLegend, ratioDashboardWidth*1.5, 60, "horizontal");
	}

}

//Función que actualiza los gráficos de área, los HBar del slide complementario y su leyenda
function updateTreemaps(data){
	if(display_config["section2"]["slides"][0].indexOf("treemap") >= 0)
		treemaps["liq"].redraw(data.fileName, data.targetField);
	if(display_config["section2"]["slides"][1].indexOf("hbars") >= 0)
		updateMHBar(data.fileName);	
	if(eventos[1].dispatch){
		eventos[1].dispatch = false;
		document.dispatchEvent(eventos[1].evt);
	}
}

//Función que actualiza los HBar de la seección de "INGRESOS Y GASTOS"
function updateMHBar(nameFile){
	d3.csv(nameFile, type, function(error, csvData){
		var capData = csvData.filter(function(d){ return d.id.length == 1});
		for(var i = 0; i < 9; i++){
			if(i < capData.length){
				d3.select("#cap"+(i+1)+"HBarContainer").transition().duration(750).style("opacity", "1");
				var data = [{name:"A", value:capData[i].pre, label:"Presupuesto"},{name:"B", value:capData[i].liq, label:"Liquidación"}];
				hBars["cap"+(i+1)].redraw(data, 750, capData[i].id + ". " + capData[i].cuenta);
				//console.log(capData[i].id + ". " + capData[i].cuenta);
			} else {
				d3.select("#cap"+(i+1)+"HBarContainer").transition().duration(750).style("opacity", "0");
			}
			
		}

	});

	//Función auxiliar que pretrata datos de un fichero CSV de entrada
	function type(d){

		if(d.contexto_lenloc != undefined){ //ingresos o gastos
			d.liq = +d.contexto_lenloc;
			d.pre = +d.contexto_penloc;
		} else { //clasificación por programa
			var keysStartWith = function(obj, cad){return Object.keys(obj).filter(function(e){return cad == e.slice(0,cad.length);});}
			var liq_contexts = keysStartWith(d,"contexto_lenloc");
			var pre_contexts = keysStartWith(d,"contexto_penloc");
			d.liq = 0;
			d.pre = 0;
			liq_contexts.forEach(function(e){d.liq += +d[e]});
			pre_contexts.forEach(function(e){d.pre += +d[e]});
		}

		if(d.id.length == 1){
			// d.cuenta = abbrChapter(d.cuenta);
			d.cuenta = abbrs[d.cuenta];
		}
		return d;
	}

}

/**********************************************************************************************/
/* Funciones relacionadas con los HBAR de la sección de "GASTOS DE LOS PRINCIPALES SERVICIOS" */
/**********************************************************************************************/

//Función que crea todos los HBAR necesarios de la sección "GASTOS DE LOS PRINCIPALES SERVICIOS" y la leyenda correspondiente
function createServicesHBars(){

	var dataInfo = [
		{name: "A", value: 20.0, label: "labelA"},
		{name: "B", value: 5.0, label: "labelB"},
		{name: "C", value: 10.0, label: "labelC"}
	];

	var dataLegend = [
		{name: "A", label: "labelA"},
		{name: "B", label: "Promedio nacional"},
		{name: "C", label: "labelC"}
	];
	
	//Vivienda y urbanismo
	if(display_config["section4"]["slides"][0].indexOf("servicio1") >= 0)
		createHBar("serv1", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	//Saneamiento, abastecimiento y distribución de aguas
	if(display_config["section4"]["slides"][0].indexOf("servicio2") >= 0)
		createHBar("serv2", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	//Recogida, eliminación y tratamiento de residuos
	if(display_config["section4"]["slides"][0].indexOf("servicio3") >= 0)
		createHBar("serv3", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	//Alumbrado público
	if(display_config["section4"]["slides"][1].indexOf("servicio4") >= 0)
		createHBar("serv4", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	//Medio ambiente
	if(display_config["section4"]["slides"][1].indexOf("servicio5") >= 0)
		createHBar("serv5", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	//Servicios Sociales y promoción social
	if(display_config["section4"]["slides"][1].indexOf("servicio6") >= 0)
		createHBar("serv6", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	//Sanidad
	if(display_config["section4"]["slides"][2].indexOf("servicio7") >= 0)
		createHBar("serv7", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	//Educación
	if(display_config["section4"]["slides"][2].indexOf("servicio8") >= 0)
		createHBar("serv8", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	//Cultura
	if(display_config["section4"]["slides"][2].indexOf("servicio9") >= 0)
		createHBar("serv9", dataInfo, "€", 2, ratioDashboardWidth, ratioDashboardWidth*1.25, null, ["#AEC7E8","#CCC","#FFBB78"], true);		
	
	//Leyenda con las administraciones a comparar
	createLegend("services", dataLegend, 750, 60, "horizontal", ["#AEC7E8","#CCC","#FFBB78"]);
}

//Función que actualiza los gráficos HBar de la sección "GASTOS DE LOS PRINCIPALES SERVICIOS" y su leyenda
function updateServicesHBars(updateData){
	var services = display_config["section4"]["slides"].map(function(e){return e.map(function(n){return n.slice(8)}).join();}).join().split(",").map(function(v){return parseInt(v)});
	var ids = [15,161,162,165,17,23,31,32,33];
	services.forEach(function(e){
		var data = [
			{name:"A", value:updateData[0].values[e-1], label:updateData[0].name},
			{name:"B", value:currentCostServicesLimits[ids[e-1]].med, label:"Promedio nacional"}
		];
		for(var i = 1; i < updateData.length; i++){ //datos de otra localidades que no son la ppal
			data.push({name:"C", value:updateData[i].values[e-1], label:updateData[i].name});
		}
		
		hBars["serv"+e].redraw(data);
	});

	var promLabel = ($("select#periodo option:selected").val() <= period_limit) ? "Promedio nacional" : "Promedio nacional("+period_limit+")";
	var labels = [
		{name: "A", label: updateData[0].name},
		{name: "B", label: promLabel}
	];
	for(var i = 1; i < updateData.length; i++){ //labels de otra localidades que no son la ppal
		labels.push({name: "C", label: updateData[i].name});
	}
	legends["services"].redraw(labels);

	if(eventos[3].dispatch){
		eventos[3].dispatch = false;
		document.dispatchEvent(eventos[3].evt);
	}

}

/***************************************************************/
/*     Funciones relacionadas con los scatter plot             */
/***************************************************************/
var scatterPlots = []; //array que contendra los diferentes gráficos scatter plot

//Función que crea un gráfico scatter plot y lo añade al array scatterPlots
function createScatterPlot(name, labelX, labelY, data, width, height, dotRadius, withLine, colorLine, legend, colors){
	var config = {
		labelX: labelX,
		labelY: labelY,
		margin: {top: 30, right: 30, bottom: 80, left: 100},
		width: undefined != width ? width : 300,
		height: undefined != height ? height : 100,
		dotRadius: undefined != dotRadius ? dotRadius : 3.5,
		withLine: undefined != withLine ? withLine : true,
		colorLine: undefined != colorLine ? colorLine : "#9575AD",
		legend: undefined != legend ? legend : false,
		colors: undefined != colors ? colors : ["#AEC7E8","#EE0000","#98DF8A","#FF9896","#C5B0D5","#C49C94","#F7B6D2","#C7C7C7","#DBDB8D","#9EDAE5"],
		data: data,
		ticks: 3
	}
	
	scatterPlots[name] = new ScatterPlot(name + "ScatterPlotContainer", config);
	scatterPlots[name].draw();
}

//Función que crea todos los scatter plot necesarios de la sección "RELACIÓN ENTRE DOS INDICADORES"
function createScatterPlots(){
	var dataInfo = [];
	var labelX = addMeasures($("select#factor1 option:selected").html());
    var labelY = addMeasures($("select#factor2 option:selected").html());
    var dotRadius = $(window).width() < 980 ? 2.5 : 3.5;
	createScatterPlot("sPlot1", labelX, labelY, dataInfo, ratioDashboardWidth*3, ratioDashboardWidth*2, dotRadius);

	if(eventos[4].dispatch){
		eventos[4].dispatch = false;
		document.dispatchEvent(eventos[4].evt);
	}
}

//Función que actualiza los gráficos scatter plot de la sección "RELACIÓN ENTRE DOS INDICADORES"
function updateScatterPlots(data, r2, reg, labels){
	var dataInfo = [];
	for(var i = 0; i < 1000; i++){
		dataInfo.push({"factorX": Math.random()*7 , "factorY": Math.random()*7 , "source": "source1", "name": "name"+i});
	}

	data = undefined != data ? data : dataInfo;
	var sortedData = data.slice(0).sort(function(a,b){return a.factorX - b.factorX;});
	var linea = undefined;
	if(reg){
		linea = [
			{"x":sortedData[0].factorX, "y":sortedData[0].factorX*reg['beta']+reg['alpha']},
			{"x":sortedData[sortedData.length-1].factorX, "y":sortedData[sortedData.length-1].factorX*reg['beta']+reg['alpha']}
		];
	} else {
		linea = [];
	}

	scatterPlots["sPlot1"].redraw(data, linea, labels);
	$("#corr").html(r2.toFixed(2));
}