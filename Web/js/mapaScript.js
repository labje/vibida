/********************************************************************/
/* Fichero:     mapaScript.js                                       */
/* Autores:     Guillermo Esteban Pérez   gesteban@gmail.com        */
/*              David Gracia Larrodé      dagrala@gmail.com         */
/* Descripción: Script con funciones que crean, comunican Google    */
/*              Fusion Tables y Google Maps y modifican el mapa de  */
/*              de la sección correspondiente, necesaria API de     */
/*              Google Maps                                         */
/********************************************************************/

//nivel de zoom mínimo
var minZoomLevel = 6;

//opciones del mapa inicialmente
var mapOptions = {
    zoom: 8,
    center: new google.maps.LatLng(41.712424, -0.958606),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false,
    streetViewControl: false
  };

//Estilos de indicadores
var indicatorStyles = {
  'L_Ingresos': [
    {
      'min': 0,
      'max': 2000000,
      'color': '#66CCFF',
      'opacity': 0.1
    },
    {
      'min': 2000000,
      'max': 20000000,
      'color': '#55AAFF',
      'opacity': 0.2
    },
    {
      'min': 20000000,
      'max': 40000000,
      'color': '#4488FF',
      'opacity': 0.3
    },
    {
      'min': 40000000,
      'max': 100000000000,
      'color': '#3366FF',
      'opacity': 0.4
    },
  ],
  'L_Gastos': [
    {
      'min': 98000,
      'max': 3865333,
      'color': '#717BD8',
      'opacity': 0.7
    },
    {
      'min': 3865333,
      'max': 7632666,
      'color': '#2E3784',
      'opacity': 0.7
    },
    {
      'min': 7632666,
      'max': 11400000,
      'color': '#081272',
      'opacity': 0.7
    }
  ],'1': [
    {
      'color': '#F5A9A9',
      'opacity': 0.35
    },
    {
      'color': '#FFF3F2',
      'opacity': 0.35
    },
    {
      'color': '#F2FFF6',
      'opacity': 0.35
    },
    {
      'color': '#9FF781',
      'opacity': 0.35
    }
  ],'2': [
    {
      'color': '#92D4F0',
      'opacity': 0.55
    },
    {
      'color': '#30A2F2',
      'opacity': 0.55
    },
    {
      'color': '#2567F5',
      'opacity': 0.55
    },
    {
      'color': '#6F5AFA',
      'opacity': 0.55
    }
  ]
};

//estílo para geometría de entidad sin datos
var blankStyle = {
    polygonOptions: {
      fillColor: "#000000",
      fillOpacity: 0.01,
      strokeOpacity: 0.01
    }
};

//Variables con rango, periodo e indicador actuales
var actualDivision = 'DIP', actualYear = '2012', actualIndicator = '1';
//variable que contiene el objeto mapa
var map;  
//variable con capa de division de Fusion Table
var divisionLayer;
//Objeto que contiene los ids de las tablas Fusion Tables, según rango y periodo
var tableIds = {
  '2010':{'DIP':'13bzW4267LOC3gwpGgrKgn_Fv1_qz-Uy8P8t3QH7f','MUN':'1X17Pu45qLOc2PDIdk1AVb6DcmhQIpvmOkwevx-Lu'},
  '2011':{'DIP':'1kgSkmJEHk535JOgLRdIU6SlqWzQSFBeWJBuQg4Mu','MUN':'1jXUs_pGwAYfGxSOekAKCQKyQxAn7OuF0I0NQ9gq8'},
  '2012':{'DIP':'1vjFerI89azGUI-p8v8cqWOzgSm8wUMcsZQEzV0lF','MUN':'1BxB9yvSccXK85Et-5d6ca48msrl-rOf9DKANh0IO'}
}

//Función que crea e iniciliza el mapa
function initializeMap() {

  // Se crea el mapa
  map = new google.maps.Map(document.getElementById('mapa'), mapOptions);

  // Se limita el nivel de zoom
  google.maps.event.addListener(map, 'zoom_changed', function() {
   if (map.getZoom() < minZoomLevel) map.setZoom(minZoomLevel);
  });

  google.maps.event.addListenerOnce(map, 'idle', function(){
    collapseGraphicSection(0);
  });
  
  // Se inicializa la capa de Fusion Tables
  divisionLayer = new google.maps.FusionTablesLayer({
      query: {
        select: 'geometry',
        from: '1vjFerI89azGUI-p8v8cqWOzgSm8wUMcsZQEzV0lF',
      },
      suppressInfoWindows: 'true'
  });
  divisionLayer.setMap(map);
  //Se añade escuchador al mapa
  google.maps.event.addListener(divisionLayer, 'click', clickListener);
  
  // Se inicializan estilos
  updateIndicatorStyles(actualIndicator);
  divisionLayer.set('styles', getDivisionLayerIndicatorStyles(actualIndicator));
  
  //Se crea la leyenda del mapa
  addLegend(map);
}

//función que actualiza la información mostrada por el mapa
function updateMap(division, year, indicator) {

  // Se crea una nueva capa de división solo si el rango a cambiado
  if(divisionLayer==null || actualDivision!=division) {
    if(divisionLayer!=null) divisionLayer.setMap(null);
    divisionLayer = new google.maps.FusionTablesLayer({
        query: {
          select: 'geometry',
          from: tableIds[year][division],
        },
        suppressInfoWindows: 'true'
    });
    divisionLayer.setMap(map);
    google.maps.event.addListener(divisionLayer, 'click', clickListener);
  };
  
  // Refrescar datos actuales
  actualYear = year;
  actualDivision = division;
  actualIndicator = indicator;
  updateIndicatorStyles(indicator);
  
  // Actualizar capa y leyenda
  divisionLayer.set('styles', getDivisionLayerIndicatorStyles(indicator));
  updateLegend(indicator);
  
}


//Función que se ejecuta al producirse un evento de 'click',
//cambia selectores de cabecera como corresponda y actualiza
//datos de las diferentes secciones de la página
function clickListener(event) {  

  var codigoTerritorio;

  if(actualDivision=='DIP') { //rango de diputaciones
    codigoTerritorio = event.row.code.value;
    //Se actualiza selector de diputaciones
    $("select#diputaciones option[value="+codigoTerritorio+"]").prop("selected",true);
    //Se actualiza información de secciones
    refreshValueIndicators(codigoTerritorio, "DIP");
    if(display_config['section2'] != null){updateTreemaps(getInputTreemaps());}
    if(display_config['section4'] != null){refreshValueCostServices(codigoTerritorio, "DIP");}
  } else { //rango de municipios
    var codigoTerritorio = event.row.code.value;
    var codigoProvincia = codigoTerritorio.substring(0, 2);
    //Se actualiza selector provincias
    $("select#provincias option[value="+codigoProvincia+"]").prop("selected",true);
    loadMun(codigoProvincia);
    //Se actualiza selector municipios
    $("select#municipios option[value="+codigoTerritorio+"]").prop("selected",true);
    //Se actualiza información de secciones
    refreshValueIndicators(codigoTerritorio, "MUN");
    if(display_config['section2'] != null){updateTreemaps(getInputTreemaps());}
    if(display_config['section4'] != null){refreshValueCostServices(codigoTerritorio, "MUN");}
  }
}

//Función auxiliar que genera clausula WHERE
function generateWhere(columnName, low, high) {
  var whereClause = [];
  whereClause.push("'");
  whereClause.push(columnName);
  whereClause.push("' >= ");
  whereClause.push(low);
  whereClause.push(" AND '");
  whereClause.push(columnName);
  whereClause.push("' < ");
  whereClause.push(high);
  return whereClause.join('');
}

//Función devuelve el conjunto de estilos del indicador pasado como parámetro
function getDivisionLayerIndicatorStyles(indicator) {
  var styles = [];
  styles.push(blankStyle);
  for (var i in indicatorStyles['1']) {
    var style = indicatorStyles['1'][i];
    styles.push({
      where: generateWhere('indicador'.concat(indicator), style.min, style.max),
      polygonOptions: {
        fillColor: style.color,
        fillOpacity: style.opacity,
        strokeOpacity: 0.5
      }
    });
  }
  return styles;
}

//Función que actualiza el valor de los intervalos en el estilo del indicador
//pasado como parámetro
function updateIndicatorStyles(indicator) {
  indicatorStyles['1'][0].min = currentIndicatorLimits[indicator].min;
  indicatorStyles['1'][0].max = currentIndicatorLimits[indicator].q1;
  indicatorStyles['1'][1].min = currentIndicatorLimits[indicator].q1;
  indicatorStyles['1'][1].max = currentIndicatorLimits[indicator].q3;
  indicatorStyles['1'][2].min = currentIndicatorLimits[indicator].q3;
  indicatorStyles['1'][2].max = currentIndicatorLimits[indicator].p95;
  indicatorStyles['1'][3].min = currentIndicatorLimits[indicator].p95;
  indicatorStyles['1'][3].max = currentIndicatorLimits[indicator].max;
}

//Función que crea la leyenda del mapa
function addLegend(map) {
  var legendWrapper = document.createElement('div');
  legendWrapper.id = 'legendWrapper';
  legendWrapper.index = 1; 
  map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(
      legendWrapper);
  legendContent(legendWrapper, '1');
}

//Función que actualiza la leyenda del mapa con los valores 
//de intervalos del indicador pasado como parámetro
function updateLegend(indicator) {
  var legendWrapper = document.getElementById('legendWrapper');
  var legend = document.getElementById('legend');
  if(legendWrapper!=null) {
    legendWrapper.removeChild(legend);
    legendContent(legendWrapper, indicator);
  }
}

//Función auxiliar que actualiza los componentes que
//forman el contenedor de la leyenda e indicador pasados 
//como parámetro
function legendContent(legendWrapper, indicator) {
  var legend = document.createElement('div');
  legend.id = 'legend';
  legend.setAttribute('class', 'gauge-legend');
  legend.style.position = 'relative';

  var title = document.createElement('p');

  var info = document.createElement('div');
  info.setAttribute('class', 'info');
  info.style.position = 'absolute';
  info.style.right = '2px';
  var helpImg = document.createElement('img');
  helpImg.src = 'img/info2.svg';
  helpImg.alt = 'info';
  helpImg.style.height = '1.1em';
  helpImg.style.width = '1.1em';
  helpImg.addEventListener("mouseover", function(){$(this).next().animate({opacity:1}, 250);});
  helpImg.addEventListener("mouseout", function(){$(this).next().animate({opacity:0}, 250);});
  var infoTooltip = document.createElement('div');
  infoTooltip.setAttribute('id', 'infoTooltipMap');
  info.appendChild(helpImg);
  info.appendChild(infoTooltip);
  legend.appendChild(info);

  var texts = [
    'Está en el cuarto inferior.',
    'Está en el segundo cuarto.',
    'Está en el tercer cuarto.',
    'Está en el cuarto superior.'
  ];

  var text = document.createTextNode('Con las poblaciones ordenadas de forma creciente por el valor del indicador y dividida la lista en cuatro partes:');
  var p = document.createElement('p');
  p.appendChild(text);
  infoTooltip.appendChild(p);

  var columnStyle = indicatorStyles['1'];
  for (var i in columnStyle) {
    var style = columnStyle[i];
    var legendItem = document.createElement('div');
    var color = document.createElement('span');
    color.setAttribute('class', 'color');
    color.style.backgroundColor = style.color;
    legendItem.appendChild(color);
    var minMax = document.createElement('span');
    var min = indicator==9 ? (style.min*100).toFixed(0) : style.min.toFixed(2);
    var max = indicator==9 ? (style.max*100).toFixed(0) : style.max.toFixed(2);
    minMax.innerHTML = indicator==9 ? min + '% / ' + max + '%' : min + '€ / ' + max + '€';
    minMax.setAttribute("style","text-align:center; display:block; float:center");
    legendItem.appendChild(minMax);
    legend.appendChild(legendItem);

    var span = document.createElement('span');
    span.setAttribute("class", "square");
    span.style.backgroundColor = style.color;
    var text = document.createTextNode(texts[i]);
    var p = document.createElement('p');
    p.appendChild(span);
    p.appendChild(text);
    infoTooltip.appendChild(p);
  }

  legendWrapper.appendChild(legend);
}

//Manejador para manipular respuesta de consulta a Fusion Table
function dataHandler(response) {
  
  var x = response.rows[0][0].geometries == undefined ?
    response.rows[0][0].geometry.coordinates[0][0][0] : 
    response.rows[0][0].geometries[0].coordinates[0][0][0] ;
  var y = response.rows[0][0].geometries == undefined ?
    response.rows[0][0].geometry.coordinates[0][0][1] : 
    response.rows[0][0].geometries[0].coordinates[0][0][1] ;
  var newCenter = new google.maps.LatLng(y, x);
  //Centra el mapa en la nueva posición
  map.setCenter(newCenter);
  
}

//función que centra el mapa en la posición del territorio pasado como parámetro
function centerMap(territoryCode) {

  var table = tableIds[actualYear][actualDivision];
  
  // Consulta a Fusion Table
  var queryUrlHead = 'https://www.googleapis.com/fusiontables/v1/query?sql=';
  var queryUrlTail = '&key=AIzaSyAPqyXYVfA9lOfF2zaDRS-YT7jToIKXaok';
  var query = "SELECT geometry, code FROM " + table + " WHERE code='" + territoryCode + "' LIMIT 1";
  var allQuery = queryUrlHead + query + queryUrlTail;
  var queryurl = encodeURI(allQuery);
  var response = $.get(queryurl, dataHandler, "jsonp");
  
}