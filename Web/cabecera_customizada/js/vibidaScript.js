/********************************************************************/
/* Fichero:     vibidaScript.js                                     */
/* Autor:       David Gracia Larrodé   dagrala@gmail.com            */
/* Descripción: Scripts relacionados con la gestión del aspecto y   */
/*              efectos gráficos de la página, asi como controlar   */
/*              la entrada de datos externos que hacen evolucionar  */
/*              los gráficos según su valor.                        */
/********************************************************************/

/* Variables globales */

//Variables que tienen que ver con las dimensiones de las secciones
var slideWidth = $(window).width()*0.8;   //Anchura de slide
var slideHeight = $(window).height()*0.6; //Altura inicial de slide
var sideArrowWidth = 50; //Anchura svg flecha lateral
var sideArrowHeight = 50;//Altura svg flecha lateral
var ratioDashboardWidth = (slideWidth - 120)/4.0; //Anchura máxima de un dashboard dentro de un slide
var slideHeight1 = 0; //Altura de la sección 1 -> LOS 10 PRINCIPALES INDICADORES FINANCIEROS
var slideHeight2 = 0; //Altura de la sección 2 -> INGRESOS Y GASTOS
var slideHeight3 = 0; //Altura de la sección 3 -> Comparar dos administraciones
var slideHeight4 = 0; //Altura de la sección 4 -> GASTOS DE LOS PRINCIPALES SERVICIOS
var slideHeight5 = 0; //Altura de la sección 5 -> RELACIÓN ENTRE DOS INDICADORES

//Variable que almacena los pares código/nombre de las diputaciones
var dipList = {
  "02000DD00":"Albacete","03000DD00":"Alicante/Alacant","04000DD00":"Almería","01000DD00":"Araba/Álava",
  "05000DD00":"Ávila","06000DD00":"Badajoz","08000DD00":"Barcelona","48000DD00":"Bizkaia",
  "09000DD00":"Burgos","10000DD00":"Cáceres","11000DD00":"Cádiz","12000DD00":"Castellón/Castelló",
  "13000DD00":"Ciudad Real","14000DD00":"Córdoba","15000DD00":"Coruña, A","16000DD00":"Cuenca",
  "35001DD00":"Fuerteventura (Cabildo insular)","17000DD00":"Girona","38001DD00":"Gomera, La (Cabildo Insular)","18000DD00":"Granada",
  "35002DD00":"Gran Canaria (Cabildo insular)","19000DD00":"Guadalajara","20000DD00":"Gipuzkoa","38002DD00":"Hierro, El (Cabildo Insular)",
  "21000DD00":"Huelva","22000DD00":"Huesca","07001DD00":"Ibiza (Consejo Insular)","23000DD00":"Jaén",
  "35003DD00":"Lanzarote (Cabildo insular)","24000DD00":"León","25000DD00":"Lleida","27000DD00":"Lugo",
  "29000DD00":"Málaga","07002DD00":"Mallorca (Consejo Insular)","07003DD00":"Menorca (Consejo Insular)","32000DD00":"Ourense",
  "34000DD00":"Palencia","38003DD00":"Palma, La (Cabildo Insular)","36000DD00":"Pontevedra","37000DD00":"Salamanca",
  "40000DD00":"Segovia","41000DD00":"Sevilla","42000DD00":"Soria","43000DD00":"Tarragona",
  "38004DD00":"Tenerife (Cabildo Insular)","44000DD00":"Teruel","45000DD00":"Toledo","46000DD00":"Valencia/Valéncia",
  "47000DD00":"Valladolid","49000DD00":"Zamora","50000DD00":"Zaragoza"
};

var munList = undefined; //variable objeto con tantas propiedades como provincias con una lista de municipios asociada a cada una

//variable que contendra la información sobre el periodo actual y para cada indicador
//su valor mínimo, máximo, primer y tercer cuartil, percentil 5 y 95 y la mediana.
currentIndicatorLimits = {
  periodo:2012, 
  1:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  2:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  3:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  4:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  5:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  6:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  7:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  8:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  9:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  10:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50}
};

//variable que contendra la información sobre el periodo actual y para cada gasto
//de servicio su valor mínimo, máximo, primer y tercer cuartil, percentil 5 y 95 y 
//la mediana.
currentCostServicesLimits = {
  periodo:2012, 
  15:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  161:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  162:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  165:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  17:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  23:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  31:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  32:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50},
  33:{min:0,max:100,q1:25,q3:75,p5:5,p95:95,med:50}
};

//variable con la información de indicadores del municipio/diputación actualmente seleccionado en la cabecera
var newRatios = {code:"", periodo:0, rango:"", ratios:[], lines:[]};
//variable con la información de indicadores del municipio/diputación actualmente seleccionado en la sección 3 -> 'Comparar dos administraciones'
var newRatiosOp = {code:"", periodo:0, rango:"", ratios:[], lines:[]};
//variable con la información de gastos de servicios del municipio/diputación actualmente seleccionado en la cabecera
var newServices = {code:"", periodo:0, rango:"", costes:[]};
//variable con la información de gastos de servicios del municipio/diputación actualmente seleccionado en la sección 4 -> 'GASTOS DE LOS PRINCIPALES SERVICIOS'
var newServicesOp = {code:"", periodo:0, rango:"", costes:[]};

var scatterPoints = []; //array de los puntos del scatter plot de las sección 5 -> 'RELACIÓN ENTRE DOS INDICADORES'
var currentR2s = {}; //objeto con coeficientes de determinación diferenciados por población
var currentRegs = {};//objeto con funciones de regresión lineal diferenciados por población
var pobList = undefined; //variable con información de población por municipio/diputación diferenciada por periodo

//Variable que contien los eventos customizados que harán que se colapsen las secciones tras haberse construido de forma correcta
var eventos = [1,2,3,4,5].map(function(e){return {'dispatch': true, 'evt': new CustomEvent('build'+e, {'detail':e})};});
eventos.forEach(function(e,i,a){document.addEventListener('build'+(i+1), function(e){collapseGraphicSection(e.detail);}, false);});

var display_config = null; //variable con el objeto de configuración que indica que secciones o graficos se podrán observar
//variable con pares indicador-id contenedor diferenciador por sección
var dashboards = {
  'section1': {"indicador1":"dashboard111","indicador2":"dashboard112","indicador3":"dashboard113",
              "indicador4":"dashboard121","indicador5":"dashboard122","indicador6":"dashboard123",
              "indicador7":"dashboard131","indicador8":"dashboard132","indicador9":"dashboard133","indicador10":"dashboard134"},
  'section2': {"treemap":"slide21","hbars":"slide22"},
  'section3': {"indicador1":"dashboard311","indicador2":"dashboard312","indicador3":"dashboard313",
              "indicador4":"dashboard321","indicador5":"dashboard322","indicador6":"dashboard323",
              "indicador7":"dashboard331","indicador8":"dashboard332","indicador9":"dashboard333","indicador10":"dashboard334"},
  'section4': {"servicio1":"dashboard411","servicio2":"dashboard412","servicio3":"dashboard413",
              "servicio4":"dashboard421","servicio5":"dashboard422","servicio6":"dashboard423",
              "servicio7":"dashboard431","servicio8":"dashboard432","servicio9":"dashboard433"}
};
//variable que marca el último periodo para el que se posee datos de toda España, para que todas las seccio funcionen correctamente
var period_limit = 2012;


/* Funciones */

//Función que colapsa y despliega las diferentes secciones de la
//página según el número de sección introducido como parámetro
function collapseGraphicSection(num) {
    var sel = "";
    if(num > 0){
      sel = "#g"+num;
    } else {
      sel = "#mapa";
    }

    $(sel).slideToggle("fast", function(){
      var arrow = $("img#coll_arrow"+num);
      if($(this).is(":visible")){ //Desplegar
        arrow.attr({
          src: "img/arrow_up.svg",
          alt: "Ocultar"
        });
        if((arrow.parent().attr("id") != "coll_bar3")&& (arrow.parent().attr("id") != "coll_bar4")){
          arrow.parent().children("div.menu").each(function(){
            $(this).css("display", "block");
          });
          if(arrow.parent().attr("id") == "coll_bar0"){
            arrow.parent().children("h3").html("Ver indicador:");
          } else if(arrow.parent().attr("id") == "coll_bar5"){
            $("#ScatterButton").css("display", "inline-block");
            $("#ScatterInfo").css("display", "inline");
            arrow.parent().children("h2").html("RELACIÓN ENTRE:  ");
          }
        } else {
          if($("select#division option:selected").val() == "DIP"){
            showDipMenu();
            hideMunMenu();
          } else {
            hideDipMenu();
            showMunMenu();
          }
          if(arrow.parent().attr("id") == "coll_bar3"){
            arrow.parent().children("h3").html("Comparar con:");
          } else {
            arrow.parent().children("h2").html("GASTOS DE SERVICIOS - Comparar con:");
          }
        }
        if(num == 0){
          var periodo = $("select#periodo option:selected").val();
          var rango = $("select#division option:selected").val();
          var code = (rango == "DIP") ? $("select#diputaciones option:selected").val() : $("select#municipios option:selected").val();
          updateMap(rango, periodo, $("select#indicadores option:selected").val());
          setTimeout(function(){centerMap(code)}, 500);
        }
        if(num == 1){updateGauges(newRatios.ratios); updateLines(newRatios.lines);}
        if(num == 2){updateTreemaps(getInputTreemaps());}
        if(num == 3){
          var rangoSelect = (newRatios.rango == "DIP") ? "diputaciones" : "municipios";
          var names = [$("select#" + rangoSelect + " option:selected").html(),$("select#" + rangoSelect + "2 option:selected").html()];
          updateHBars(newRatios.ratios, newRatiosOp.ratios, names);
        }
        if(num == 4){refreshLimitCostServices();}
      } else { //Colapsar
        arrow.attr({
          src: "img/arrow_down.svg",
          alt: "Mostrar"
        });
        arrow.parent().children("div.menu").each(function(){
          $(this).css("display", "none");
        });

        if(arrow.parent().attr("id") == "coll_bar3"){
          arrow.parent().children("h3").html("Comparar dos administraciones");
        } else if(arrow.parent().attr("id") == "coll_bar4") {
          arrow.parent().children("h2").html("GASTOS DE LOS PRINCIPALES SERVICIOS");
        } else if(arrow.parent().attr("id") == "coll_bar0") {
          arrow.parent().children("h3").html("Ver indicadores o seleccionar una Administración en Google Maps");
        } else if(arrow.parent().attr("id") == "coll_bar5"){
          $("#ScatterButton").css("display", "none");
          $("#ScatterInfo").css("display", "none");
          arrow.parent().children("h2").html("RELACIÓN ENTRE DOS INDICADORES");
        } 
      }
    });
}

//Función que realiza la transición hacia la slide anterior/izquierda de la 
//slide actual pasada como parámetro.
function prev(num){
  $("#left" + num).off("click");
  $('.wrapper ul#slides' + num).css("margin-left", "-" + slideWidth + "px");
  $('.wrapper ul#slides' + num).find("li:first").before($('.wrapper ul#slides' + num).find("li:last"));
  $('.wrapper ul#slides' + num).animate({marginLeft:(0)+'px'},1000,function(){
    $("#left" + num).on("click", function(){prev(num);});
    var cSlide =  $("#contenedor" + num + " ul>li:first div").attr("id").slice(-1);
    var maxSlide = (num == 2) ? 2 : 3;
    var sPrev = ((cSlide-1 == 0)?maxSlide:cSlide-1);
    var imgLeft = $('<img />', {src: 'img/th'+num+'_'+sPrev+'.png', alt:'Slide'+sPrev, width: $('#tooltip'+num).width(), height: 'auto'});  
    $("#tooltip"+num).empty();
    $("#tooltip"+num).append(imgLeft);
  });
}

//Función que realiza la transición hacia la slide siguiente/derecha de la 
//slide actual pasada como parámetro.
function next(num){
  $("#right" + num).off("click");
  $('.wrapper ul#slides' + num).animate({marginLeft:(-slideWidth)+'px'},1000,function(){
    $(this).find("li:last").after($(this).find("li:first"));
    $(this).css({marginLeft:0});
    $("#right" + num).on("click", function(){next(num);});
    var maxSlide = (num == 2) ? 2 : 3;
    var cSlide =  $("#contenedor" + num + " ul>li:first div").attr("id").slice(-1);
    var sNext = ((cSlide == maxSlide)?1:(+cSlide+1));
    var imgRight = $('<img />', {src: 'img/th'+num+'_'+sNext+'.png', alt:'Slide'+sNext, width: $('#tooltip'+num).width(), height: 'auto'});
     $("#tooltip"+num).empty();
    $("#tooltip"+num).append(imgRight);
  });
}

//Función que redimensiona las diferentes secciones de la página,
//tras haberse inicialiado los gráficos de la sección correspondiente
function initSlidesDimensions(){
  slideWidth = $(window).width()*0.8;
  slideHeight = $(window).height()*0.6;
  ratioDashboardWidth = (slideWidth - 120)/4.0;

  $("div.contenedor_grafico").css({
    width: slideWidth + "px"
  });
  $("div.contenedor_slides").css({
    width: slideWidth + "px",
    height: slideHeight + "px"
  });
  $("div.wrapper").css({
    width: slideWidth + "px",
    height: slideHeight + "px"
  });
  $("div.wrapper ul").css({
    width: (slideWidth*3) + "px",
    height: slideHeight + "px"
  });
  $("div.wrapper ul li").css({
    width: slideWidth + "px",
    height: slideHeight + "px"
  });
  $("div.wrapper ul li>div").css({
    width: slideWidth + "px",
    height: slideHeight + "px"
  });
  
  //Sección 1 -> 'LOS 10 PRINCIPALES INDICADORES FINANCIEROS'
  if(display_config['section1'] != null){
    $("div.wrapper ul li div.ratio-dashboard").css({
      width: ratioDashboardWidth + "px",
      "margin-right": "12px",
      "margin-left": "12px"
    });
    slideHeight1 = ((Math.max.apply(this,$("div.ratio-dashboard div.gaugeHeader").map(function(val, key){return [$(key).height()];})) +  ratioDashboardWidth*1.75)+20) * 1.10;
    $("div.wrapper ul li div.ratio-dashboard").css({
      height: slideHeight1 + "px",
      "padding-top": (slideHeight1*0.1/1.10) + "px"
    });
    $("#contenedor1").css({
      height: slideHeight1 + "px"
    });
    $("#contenedor1 div.wrapper").css({
      height: slideHeight1 + "px"
    });
    $("#contenedor1 div.wrapper ul").css({
      height: slideHeight1 + "px"
    });
    $("#contenedor1 div.wrapper ul li").css({
      height: slideHeight1 + "px"
    });
    $("#contenedor1 div.wrapper ul li>div").css({
      height: slideHeight1 + "px"
    });
  }

  //Sección 2 -> 'INGRESOS Y GASTOS'
  if(display_config['section2'] != null){
    slideHeight2 = (Math.max((ratioDashboardWidth*2), 360) + $("div.mHBar-dashboard div.treemapHeader").height()) * 1.25;
    $("div.wrapper ul li div.treemap-dashboard").css({
      width: ratioDashboardWidth*3 + "px",
      height: slideHeight2 + "px",
      "margin-right": "12px",
      "margin-left": "12px",
      "padding-top": (slideHeight2-$("div.treemap-dashboard div.treemapContainer").height())/2 + "px"
    });

    $("div.wrapper ul li div.thumbnail-dashboard").css({
      width: ratioDashboardWidth + "px",
      height:($("div.hBar-dashboard div.treemapHeader").height() +  $("div.treemap-dashboard div.treemapContainer").height()) + "px",
      "margin-right": "12px",
      "margin-left": "12px",
      "padding-top": 40 + "px",
      display: "none"
    });

    $("div.wrapper ul li div.mHBar-dashboard").css({
      width: ratioDashboardWidth*4 + "px",
      height: ($("div.hBar-dashboard div.treemapHeader").height() +  $("div.treemap-dashboard div.treemapContainer").height()) + "px",
      "margin-right": "12px",
      "margin-left": "12px",
      "padding-top": 40 + "px"
    });

    $("div.wrapper ul li div.mHBarColumn-dashboard").css({
      width: ratioDashboardWidth + "px",
      height: ($("div.treemap-dashboard div.treemapContainer").height() - 100) + "px",
      "margin-right": "12px",
      "margin-left": "12px",
      "padding-top": 40 + "px"
    });

    $("#contenedor2").css({
      height: slideHeight2 + "px"
    });
    $("#contenedor2 div.wrapper").css({
      height: slideHeight2 + "px"
    });
    $("#contenedor2 div.wrapper ul").css({
      height: slideHeight2 + "px"
    });
    $("#contenedor2 div.wrapper ul li").css({
      height: slideHeight2 + "px"
    });
    $("#contenedor2 div.wrapper ul li>div").css({
      height: slideHeight2 + "px"
    });
  }

  //Sección 3 -> 'Comparar dos administraciones'
  if(display_config['section3'] != null){
    $("div#g3 div.wrapper ul li div.hBar-dashboard").css({
      width: ratioDashboardWidth + "px",
      "margin-right": "12px",
      "margin-left": "12px"
    });
    slideHeight3 = (Math.max.apply(this,$("div#g3 div.hBar-dashboard div.hBarHeader").map(function(val, key){return [$(key).height()];})) +  ratioDashboardWidth*1.25 + 10)*1.10;
    $("div#g3 div.wrapper ul li div.hBar-dashboard").css({
      height: slideHeight3 + "px",
      "padding-top": (slideHeight3*0.1/1.10) + "px"
    });
    
    $("#contenedor3").css({
      height: slideHeight3 + "px"
    });
    $("#contenedor3 div.wrapper").css({
      height: slideHeight3 + "px"
    });
    $("#contenedor3 div.wrapper ul").css({
      height: slideHeight3 + "px"
    });
    $("#contenedor3 div.wrapper ul li").css({
      height: slideHeight3 + "px"
    });
    $("#contenedor3 div.wrapper ul li>div").css({
      height: slideHeight3 + "px"
    });
  }

  //Sección 4 -> 'GASTOS DE LOS PRINCIPALES SERVICIOS'
  if(display_config['section4'] != null){
    $("div#g4 div.wrapper ul li div.hBar-dashboard").css({
      width: ratioDashboardWidth + "px",
      "margin-right": "12px",
      "margin-left": "12px"
    });
    slideHeight4 = (Math.max.apply(this,$("div#g4 div.hBar-dashboard div.hBarHeader").map(function(val, key){return [$(key).height()];})) +  ratioDashboardWidth*1.25 + 10)*1.10;
    $("div#g4 div.wrapper ul li div.hBar-dashboard").css({
      height: slideHeight4 + "px",
      "padding-top": (slideHeight4*0.1/1.10) + "px"
    });

    $("#contenedor4").css({
      height: slideHeight4 + "px"
    });
    $("#contenedor4 div.wrapper").css({
      height: slideHeight4 + "px"
    });
    $("#contenedor4 div.wrapper ul").css({
      height: slideHeight4 + "px"
    });
    $("#contenedor4 div.wrapper ul li").css({
      height: slideHeight4 + "px"
    });
    $("#contenedor4 div.wrapper ul li>div").css({
      height: slideHeight4 + "px"
    });
  }

  //Sección 5 -> 'RELACIÓN ENTRE DOS INDICADORES'
  if(display_config['section5'] != null){
    slideHeight5 = ($("div.scatterPlot-dashboard div.scatterPlotHeader").height() +  ratioDashboardWidth*2) * 1.10;
    $("div.wrapper ul li div.scatterPlot-dashboard").css({
      width: ratioDashboardWidth*3 + "px",
      height: slideHeight5 + "px",
      "margin-right": "12px",
      "margin-left": "12px",
      "padding-top": (slideHeight5*0.1/1.10) + "px"
    });

    $("#contenedor5").css({
      height: slideHeight5 + "px"
    });
    $("#contenedor5 div.wrapper").css({
      height: slideHeight5 + "px"
    });
    $("#contenedor5 div.wrapper>div").css({
      height: slideHeight5 + "px"
    });
  }


  //Se ajusta la altura de las flechas laterales en las secciones con slides
  $("img.left_arrow").css({
    width: sideArrowWidth + "px",
    height: sideArrowHeight + "px",
    top: ((slideHeight - sideArrowHeight)/2.0) + "px",
    left:"-40px"
  });
  $("img.right_arrow").css({
    width: sideArrowWidth + "px",
    height: sideArrowHeight + "px",
    top: ((slideHeight - sideArrowHeight)/2.0) + "px",
    right: "-40px"
  });

  
  //Sección 1
  if(display_config['section1'] != null){
    $("#contenedor1 img.left_arrow").css({
      top: ((slideHeight1 - sideArrowHeight)/2.0) + "px",
    });
    $("#contenedor1 img.right_arrow").css({
      top: ((slideHeight1 - sideArrowHeight)/2.0) + "px",
    });
  }

  //Sección 2
  if(display_config['section2'] != null){
    $("#contenedor2 img.left_arrow").css({
      top: ((slideHeight2 - sideArrowHeight)/2.0) + "px",
    });
    $("#contenedor2 img.right_arrow").css({
      top: ((slideHeight2 - sideArrowHeight)/2.0) + "px",
    });
  }

  //Sección 3
  if(display_config['section3'] != null){
    $("#contenedor3 img.left_arrow").css({
      top: ((slideHeight3 - sideArrowHeight)/2.0) + "px",
    });
    $("#contenedor3 img.right_arrow").css({
      top: ((slideHeight3 - sideArrowHeight)/2.0) + "px",
    });
  }

  //Sección 4
  if(display_config['section4'] != null){
    $("#contenedor4 img.left_arrow").css({
      top: ((slideHeight4 - sideArrowHeight)/2.0) + "px",
    });
    $("#contenedor4 img.right_arrow").css({
      top: ((slideHeight4 - sideArrowHeight)/2.0) + "px",
    });
  }

  //Ajuste de la leyendas de la sección de '10 Indicadores' y 'Mapa' 
  if((display_config['section1'] != null)||(display_config['section0'] != null)){
    $("div.gauge-legend").css({
      top: ((slideHeight1 - sideArrowHeight)/2.0 + 90) + "px",
      right: "-12%"//"-120px"
    });

    /* Ajustar tamaño leyenda de gauge según la anchura*/
    if(($(window).width() <= 1024)&&(display_config['section1'] != null)){
      $("div.gauge-legend svg").width(80).height(20);
      $("div.gauge-legend svg g rect").attr("width", 10).attr("height", 10);
      $("div.gauge-legend svg g circle").attr("r", 5).attr("cx", 5).attr("cy", 5);
      $("div.gauge-legend svg g text").attr("x",12).attr("dy","0.9em");
      $("div.gauge-legend svg g text").css("font-size", "9px");
    }
  }

}

//Función que muestra los selectores asociados al rango de diputaciones
function showDipMenu(){
  $("select#diputaciones").parent().css("display", "block");
  if(($("#g3").css("display") != 'none') && (display_config['section3'] != null)) {$("select#diputaciones2").parent().css("display", "block");}
  if(($("#g4").css("display") != 'none') && (display_config['section4'] != null)) {$("select#diputaciones3").parent().css("display", "block");}
}

//Función que oculta los selectores asociados al rango de diputaciones
function hideDipMenu(){
  $("select#diputaciones").parent().css("display", "none");
  if(display_config['section3'] != null){$("select#diputaciones2").parent().css("display", "none");}
  if(display_config['section4'] != null){$("select#diputaciones3").parent().css("display", "none");}
}

//Función que muestra los selectores asociados al rango de municipios
function showMunMenu(){
  $("select#provincias").parent().css("display", "block");
  $("select#municipios").parent().css("display", "block");
  if(($("#g3").css("display") != 'none') && (display_config['section3'] != null)) {
    $("select#provincias2").parent().css("display", "block");
    $("select#municipios2").parent().css("display", "block");
  }
  if(($("#g4").css("display") != 'none') && (display_config['section4'] != null)) {
    $("select#provincias3").parent().css("display", "block");
    $("select#municipios3").parent().css("display", "block");
  }
}

//Función que oculta los selectores asociados al rango de municipios
function hideMunMenu(){
  $("select#provincias").parent().css("display", "none");
  $("select#municipios").parent().css("display", "none");
  if(display_config['section3'] != null){
    $("select#provincias2").parent().css("display", "none");
    $("select#municipios2").parent().css("display", "none");
  }
  if(display_config['section4'] != null){
    $("select#provincias3").parent().css("display", "none");
    $("select#municipios3").parent().css("display", "none");
  }
}


//Función que inicializa el valor de las opciones de los selectores de diputaciones
function initDip(){
  //Selector cabecera
  $("select#diputaciones").html("");
  $("select#diputaciones").append("<option value='02000DD00'>Albacete</option>");
  $("select#diputaciones").append("<option value='03000DD00'>Alicante/Alacant</option>");
  $("select#diputaciones").append("<option value='04000DD00'>Almería</option>");
  $("select#diputaciones").append("<option value='01000DD00'>Araba/Álava</option>");
  $("select#diputaciones").append("<option value='05000DD00'>Ávila</option>");
  $("select#diputaciones").append("<option value='06000DD00'>Badajoz</option>");
  $("select#diputaciones").append("<option value='08000DD00'>Barcelona</option>");
  $("select#diputaciones").append("<option value='48000DD00'>Bizkaia</option>");
  $("select#diputaciones").append("<option value='09000DD00'>Burgos</option>");
  $("select#diputaciones").append("<option value='10000DD00'>Cáceres</option>");
  $("select#diputaciones").append("<option value='11000DD00'>Cádiz</option>");
  $("select#diputaciones").append("<option value='12000DD00'>Castellón/Castelló</option>");
  $("select#diputaciones").append("<option value='13000DD00'>Ciudad Real</option>");
  $("select#diputaciones").append("<option value='14000DD00'>Córdoba</option>");
  $("select#diputaciones").append("<option value='15000DD00'>Coruña, A</option>");
  $("select#diputaciones").append("<option value='16000DD00'>Cuenca</option>");
  $("select#diputaciones").append("<option value='35001DD00'>Fuerteventura (Cabildo insular)</option>");
  $("select#diputaciones").append("<option value='17000DD00'>Girona</option>");
  $("select#diputaciones").append("<option value='38001DD00'>Gomera, La (Cabildo Insular)</option>");
  $("select#diputaciones").append("<option value='18000DD00'>Granada</option>");
  $("select#diputaciones").append("<option value='35002DD00'>Gran Canaria (Cabildo insular)</option>");
  $("select#diputaciones").append("<option value='19000DD00'>Guadalajara</option>");
  $("select#diputaciones").append("<option value='20000DD00'>Gipuzkoa</option>");
  $("select#diputaciones").append("<option value='38002DD00'>Hierro, El (Cabildo Insular)</option>");
  $("select#diputaciones").append("<option value='21000DD00'>Huelva</option>");
  $("select#diputaciones").append("<option value='22000DD00'>Huesca</option>");
  $("select#diputaciones").append("<option value='07001DD00'>Ibiza (Consejo Insular)</option>");
  $("select#diputaciones").append("<option value='23000DD00'>Jaén</option>");
  $("select#diputaciones").append("<option value='35003DD00'>Lanzarote (Cabildo insular)</option>");
  $("select#diputaciones").append("<option value='24000DD00'>León</option>");
  $("select#diputaciones").append("<option value='25000DD00'>Lleida</option>");
  $("select#diputaciones").append("<option value='27000DD00'>Lugo</option>");
  $("select#diputaciones").append("<option value='29000DD00'>Málaga</option>");
  $("select#diputaciones").append("<option value='07002DD00'>Mallorca (Consejo Insular)</option>");
  $("select#diputaciones").append("<option value='07003DD00'>Menorca (Consejo Insular)</option>");
  $("select#diputaciones").append("<option value='32000DD00'>Ourense</option>");
  $("select#diputaciones").append("<option value='34000DD00'>Palencia</option>");
  $("select#diputaciones").append("<option value='38003DD00'>Palma, La (Cabildo Insular)</option>");
  $("select#diputaciones").append("<option value='36000DD00'>Pontevedra</option>");
  $("select#diputaciones").append("<option value='37000DD00'>Salamanca</option>");
  $("select#diputaciones").append("<option value='40000DD00'>Segovia</option>");
  $("select#diputaciones").append("<option value='41000DD00'>Sevilla</option>");
  $("select#diputaciones").append("<option value='42000DD00'>Soria</option>");
  $("select#diputaciones").append("<option value='43000DD00'>Tarragona</option>");
  $("select#diputaciones").append("<option value='38004DD00'>Tenerife (Cabildo Insular)</option>");
  $("select#diputaciones").append("<option value='44000DD00'>Teruel</option>");
  $("select#diputaciones").append("<option value='45000DD00'>Toledo</option>");
  $("select#diputaciones").append("<option value='46000DD00'>Valencia/Valéncia</option>");
  $("select#diputaciones").append("<option value='47000DD00'>Valladolid</option>");
  $("select#diputaciones").append("<option value='49000DD00'>Zamora</option>");
  $("select#diputaciones").append("<option value='50000DD00'>Zaragoza</option>");
  
  //Sección a modificar si la entidad de la cabecera es una diputación:
  // - Se selecciona la diputación
  $("select#diputaciones option[value='50000DD00']").prop("selected", true);
  
  if(display_config['section3'] != null){ //selector de la sección 3 -> 'Comparar dos administraciones'
    $("select#diputaciones2").html("");
    $("select#diputaciones2").append("<option value='02000DD00'>Albacete</option>");
    $("select#diputaciones2").append("<option value='03000DD00'>Alicante/Alacant</option>");
    $("select#diputaciones2").append("<option value='04000DD00'>Almería</option>");
    $("select#diputaciones2").append("<option value='01000DD00'>Araba/Álava</option>");
    $("select#diputaciones2").append("<option value='05000DD00'>Ávila</option>");
    $("select#diputaciones2").append("<option value='06000DD00'>Badajoz</option>");
    $("select#diputaciones2").append("<option value='08000DD00'>Barcelona</option>");
    $("select#diputaciones2").append("<option value='48000DD00'>Bizkaia</option>");
    $("select#diputaciones2").append("<option value='09000DD00'>Burgos</option>");
    $("select#diputaciones2").append("<option value='10000DD00'>Cáceres</option>");
    $("select#diputaciones2").append("<option value='11000DD00'>Cádiz</option>");
    $("select#diputaciones2").append("<option value='12000DD00'>Castellón/Castelló</option>");
    $("select#diputaciones2").append("<option value='13000DD00'>Ciudad Real</option>");
    $("select#diputaciones2").append("<option value='14000DD00'>Córdoba</option>");
    $("select#diputaciones2").append("<option value='15000DD00'>Coruña, A</option>");
    $("select#diputaciones2").append("<option value='16000DD00'>Cuenca</option>");
    $("select#diputaciones2").append("<option value='35001DD00'>Fuerteventura (Cabildo insular)</option>");
    $("select#diputaciones2").append("<option value='17000DD00'>Girona</option>");
    $("select#diputaciones2").append("<option value='38001DD00'>Gomera, La (Cabildo Insular)</option>");
    $("select#diputaciones2").append("<option value='18000DD00'>Granada</option>");
    $("select#diputaciones2").append("<option value='35002DD00'>Gran Canaria (Cabildo insular)</option>");
    $("select#diputaciones2").append("<option value='19000DD00'>Guadalajara</option>");
    $("select#diputaciones2").append("<option value='20000DD00'>Gipuzkoa</option>");
    $("select#diputaciones2").append("<option value='38002DD00'>Hierro, El (Cabildo Insular)</option>");
    $("select#diputaciones2").append("<option value='21000DD00'>Huelva</option>");
    $("select#diputaciones2").append("<option value='22000DD00'>Huesca</option>");
    $("select#diputaciones2").append("<option value='07001DD00'>Ibiza (Consejo Insular)</option>");
    $("select#diputaciones2").append("<option value='23000DD00'>Jaén</option>");
    $("select#diputaciones2").append("<option value='35003DD00'>Lanzarote (Cabildo insular)</option>");
    $("select#diputaciones2").append("<option value='24000DD00'>León</option>");
    $("select#diputaciones2").append("<option value='25000DD00'>Lleida</option>");
    $("select#diputaciones2").append("<option value='27000DD00'>Lugo</option>");
    $("select#diputaciones2").append("<option value='29000DD00'>Málaga</option>");
    $("select#diputaciones2").append("<option value='07002DD00'>Mallorca (Consejo Insular)</option>");
    $("select#diputaciones2").append("<option value='07003DD00'>Menorca (Consejo Insular)</option>");
    $("select#diputaciones2").append("<option value='32000DD00'>Ourense</option>");
    $("select#diputaciones2").append("<option value='34000DD00'>Palencia</option>");
    $("select#diputaciones2").append("<option value='38003DD00'>Palma, La (Cabildo Insular)</option>");
    $("select#diputaciones2").append("<option value='36000DD00'>Pontevedra</option>");
    $("select#diputaciones2").append("<option value='37000DD00'>Salamanca</option>");
    $("select#diputaciones2").append("<option value='40000DD00'>Segovia</option>");
    $("select#diputaciones2").append("<option value='41000DD00'>Sevilla</option>");
    $("select#diputaciones2").append("<option value='42000DD00'>Soria</option>");
    $("select#diputaciones2").append("<option value='43000DD00'>Tarragona</option>");
    $("select#diputaciones2").append("<option value='38004DD00'>Tenerife (Cabildo Insular)</option>");
    $("select#diputaciones2").append("<option value='44000DD00'>Teruel</option>");
    $("select#diputaciones2").append("<option value='45000DD00'>Toledo</option>");
    $("select#diputaciones2").append("<option value='46000DD00'>Valencia/Valéncia</option>");
    $("select#diputaciones2").append("<option value='47000DD00'>Valladolid</option>");
    $("select#diputaciones2").append("<option value='49000DD00'>Zamora</option>");
    $("select#diputaciones2").append("<option value='50000DD00'>Zaragoza</option>");
    //Se carga la diputación de Huesca por defecto
    $("select#diputaciones2 option[value='22000DD00']").prop("selected", true);
  }

  if(display_config['section4'] != null){  //selector de la sección 4 -> 'GASTOS DE LOS PRINCIPALES SERVICIOS'
    $("select#diputaciones3").html("");
    $("select#diputaciones3").append("<option value='02000DD00'>Albacete</option>");
    $("select#diputaciones3").append("<option value='03000DD00'>Alicante/Alacant</option>");
    $("select#diputaciones3").append("<option value='04000DD00'>Almería</option>");
    $("select#diputaciones3").append("<option value='01000DD00'>Araba/Álava</option>");
    $("select#diputaciones3").append("<option value='05000DD00'>Ávila</option>");
    $("select#diputaciones3").append("<option value='06000DD00'>Badajoz</option>");
    $("select#diputaciones3").append("<option value='08000DD00'>Barcelona</option>");
    $("select#diputaciones3").append("<option value='48000DD00'>Bizkaia</option>");
    $("select#diputaciones3").append("<option value='09000DD00'>Burgos</option>");
    $("select#diputaciones3").append("<option value='10000DD00'>Cáceres</option>");
    $("select#diputaciones3").append("<option value='11000DD00'>Cádiz</option>");
    $("select#diputaciones3").append("<option value='12000DD00'>Castellón/Castelló</option>");
    $("select#diputaciones3").append("<option value='13000DD00'>Ciudad Real</option>");
    $("select#diputaciones3").append("<option value='14000DD00'>Córdoba</option>");
    $("select#diputaciones3").append("<option value='15000DD00'>Coruña, A</option>");
    $("select#diputaciones3").append("<option value='16000DD00'>Cuenca</option>");
    $("select#diputaciones3").append("<option value='35001DD00'>Fuerteventura (Cabildo insular)</option>");
    $("select#diputaciones3").append("<option value='17000DD00'>Girona</option>");
    $("select#diputaciones3").append("<option value='38001DD00'>Gomera, La (Cabildo Insular)</option>");
    $("select#diputaciones3").append("<option value='18000DD00'>Granada</option>");
    $("select#diputaciones3").append("<option value='35002DD00'>Gran Canaria (Cabildo insular)</option>");
    $("select#diputaciones3").append("<option value='19000DD00'>Guadalajara</option>");
    $("select#diputaciones3").append("<option value='20000DD00'>Gipuzkoa</option>");
    $("select#diputaciones3").append("<option value='38002DD00'>Hierro, El (Cabildo Insular)</option>");
    $("select#diputaciones3").append("<option value='21000DD00'>Huelva</option>");
    $("select#diputaciones3").append("<option value='22000DD00'>Huesca</option>");
    $("select#diputaciones3").append("<option value='07001DD00'>Ibiza (Consejo Insular)</option>");
    $("select#diputaciones3").append("<option value='23000DD00'>Jaén</option>");
    $("select#diputaciones3").append("<option value='35003DD00'>Lanzarote (Cabildo insular)</option>");
    $("select#diputaciones3").append("<option value='24000DD00'>León</option>");
    $("select#diputaciones3").append("<option value='25000DD00'>Lleida</option>");
    $("select#diputaciones3").append("<option value='27000DD00'>Lugo</option>");
    $("select#diputaciones3").append("<option value='29000DD00'>Málaga</option>");
    $("select#diputaciones3").append("<option value='07002DD00'>Mallorca (Consejo Insular)</option>");
    $("select#diputaciones3").append("<option value='07003DD00'>Menorca (Consejo Insular)</option>");
    $("select#diputaciones3").append("<option value='32000DD00'>Ourense</option>");
    $("select#diputaciones3").append("<option value='34000DD00'>Palencia</option>");
    $("select#diputaciones3").append("<option value='38003DD00'>Palma, La (Cabildo Insular)</option>");
    $("select#diputaciones3").append("<option value='36000DD00'>Pontevedra</option>");
    $("select#diputaciones3").append("<option value='37000DD00'>Salamanca</option>");
    $("select#diputaciones3").append("<option value='40000DD00'>Segovia</option>");
    $("select#diputaciones3").append("<option value='41000DD00'>Sevilla</option>");
    $("select#diputaciones3").append("<option value='42000DD00'>Soria</option>");
    $("select#diputaciones3").append("<option value='43000DD00'>Tarragona</option>");
    $("select#diputaciones3").append("<option value='38004DD00'>Tenerife (Cabildo Insular)</option>");
    $("select#diputaciones3").append("<option value='44000DD00'>Teruel</option>");
    $("select#diputaciones3").append("<option value='45000DD00'>Toledo</option>");
    $("select#diputaciones3").append("<option value='46000DD00'>Valencia/Valéncia</option>");
    $("select#diputaciones3").append("<option value='47000DD00'>Valladolid</option>");
    $("select#diputaciones3").append("<option value='49000DD00'>Zamora</option>");
    $("select#diputaciones3").append("<option value='50000DD00'>Zaragoza</option>");
    $("select#diputaciones3").append("<option value='none'>--</option>");
    //Se carga diputación vacía '--' por defecto
    $("select#diputaciones3 option[value='none']").prop("selected", true);
  }
}
//Función que inicializa el valor de las opciones de los selectores de provincias y municipios
function initMun(){
  //Selectores cabecera
  $("select#provincias").html("");
  $("select#provincias").append("<option value='02'>Albacete</option>");
  $("select#provincias").append("<option value='03'>Alicante/Alacant</option>");
  $("select#provincias").append("<option value='04'>Almería</option>");
  $("select#provincias").append("<option value='01'>Araba/Álava</option>");
  $("select#provincias").append("<option value='33'>Asturias</option>");
  $("select#provincias").append("<option value='05'>Ávila</option>");
  $("select#provincias").append("<option value='06'>Badajoz</option>");
  $("select#provincias").append("<option value='07'>Balears, Illes</option>");
  $("select#provincias").append("<option value='08'>Barcelona</option>");
  $("select#provincias").append("<option value='48'>Bizkaia</option>");
  $("select#provincias").append("<option value='09'>Burgos</option>");
  $("select#provincias").append("<option value='10'>Cáceres</option>");
  $("select#provincias").append("<option value='11'>Cádiz</option>");
  $("select#provincias").append("<option value='39'>Cantabria</option>");
  $("select#provincias").append("<option value='12'>Castellón/Castelló</option>");
  $("select#provincias").append("<option value='51'>Ceuta</option>");
  $("select#provincias").append("<option value='13'>Ciudad Real</option>");
  $("select#provincias").append("<option value='14'>Córdoba</option>");
  $("select#provincias").append("<option value='15'>Coruña, A</option>");
  $("select#provincias").append("<option value='16'>Cuenca</option>");
  $("select#provincias").append("<option value='20'>Gipuzkoa</option>");
  $("select#provincias").append("<option value='17'>Girona</option>");
  $("select#provincias").append("<option value='18'>Granada</option>");
  $("select#provincias").append("<option value='19'>Guadalajara</option>");
  $("select#provincias").append("<option value='21'>Huelva</option>");
  $("select#provincias").append("<option value='22'>Huesca</option>");
  $("select#provincias").append("<option value='23'>Jaén</option>");
  $("select#provincias").append("<option value='24'>León</option>");
  $("select#provincias").append("<option value='25'>Lleida</option>");
  $("select#provincias").append("<option value='27'>Lugo</option>");
  $("select#provincias").append("<option value='28'>Madrid</option>");
  $("select#provincias").append("<option value='29'>Málaga</option>");
  $("select#provincias").append("<option value='52'>Melilla</option>");
  $("select#provincias").append("<option value='30'>Murcia</option>");
  $("select#provincias").append("<option value='31'>Navarra</option>");
  $("select#provincias").append("<option value='32'>Ourense</option>");
  $("select#provincias").append("<option value='34'>Palencia</option>");
  $("select#provincias").append("<option value='35'>Palmas, Las</option>");
  $("select#provincias").append("<option value='36'>Pontevedra</option>");
  $("select#provincias").append("<option value='26'>Rioja, La</option>");
  $("select#provincias").append("<option value='37'>Salamanca</option>");
  $("select#provincias").append("<option value='38'>Santa Cruz de Tenerife</option>");
  $("select#provincias").append("<option value='40'>Segovia</option>");
  $("select#provincias").append("<option value='41'>Sevilla</option>");
  $("select#provincias").append("<option value='42'>Soria</option>");
  $("select#provincias").append("<option value='43'>Tarragona</option>");
  $("select#provincias").append("<option value='44'>Teruel</option>");
  $("select#provincias").append("<option value='45'>Toledo</option>");
  $("select#provincias").append("<option value='46'>Valencia/Valéncia</option>");
  $("select#provincias").append("<option value='47'>Valladolid</option>");
  $("select#provincias").append("<option value='49'>Zamora</option>");
  $("select#provincias").append("<option value='50'>Zaragoza</option>");

  //Sección a modificar si la entidad de la cabecera es un municipio:
  // - provincia a la que pertenece el municipio a seleccionar
  $("select#provincias option[value='22']").prop("selected", true); 
  // - Se carga la lista de municipios de la provincia seleccionada
  loadMun("22"); 
  // - Se selecciona el municipio
  $("select#municipios option[value='22125AA00']").prop("selected", true); 

  if(display_config['section3']){ //selectores de la sección 3 -> 'Comparar dos administraciones'
    $("select#provincias2").html("");
    $("select#provincias2").append("<option value='02'>Albacete</option>");
    $("select#provincias2").append("<option value='03'>Alicante/Alacant</option>");
    $("select#provincias2").append("<option value='04'>Almería</option>");
    $("select#provincias2").append("<option value='01'>Araba/Álava</option>");
    $("select#provincias2").append("<option value='33'>Asturias</option>");
    $("select#provincias2").append("<option value='05'>Ávila</option>");
    $("select#provincias2").append("<option value='06'>Badajoz</option>");
    $("select#provincias2").append("<option value='07'>Balears, Illes</option>");
    $("select#provincias2").append("<option value='08'>Barcelona</option>");
    $("select#provincias2").append("<option value='48'>Bizkaia</option>");
    $("select#provincias2").append("<option value='09'>Burgos</option>");
    $("select#provincias2").append("<option value='10'>Cáceres</option>");
    $("select#provincias2").append("<option value='11'>Cádiz</option>");
    $("select#provincias2").append("<option value='39'>Cantabria</option>");
    $("select#provincias2").append("<option value='12'>Castellón/Castelló</option>");
    $("select#provincias2").append("<option value='51'>Ceuta</option>");
    $("select#provincias2").append("<option value='13'>Ciudad Real</option>");
    $("select#provincias2").append("<option value='14'>Córdoba</option>");
    $("select#provincias2").append("<option value='15'>Coruña, A</option>");
    $("select#provincias2").append("<option value='16'>Cuenca</option>");
    $("select#provincias2").append("<option value='20'>Gipuzkoa</option>");
    $("select#provincias2").append("<option value='17'>Girona</option>");
    $("select#provincias2").append("<option value='18'>Granada</option>");
    $("select#provincias2").append("<option value='19'>Guadalajara</option>");
    $("select#provincias2").append("<option value='21'>Huelva</option>");
    $("select#provincias2").append("<option value='22'>Huesca</option>");
    $("select#provincias2").append("<option value='23'>Jaén</option>");
    $("select#provincias2").append("<option value='24'>León</option>");
    $("select#provincias2").append("<option value='25'>Lleida</option>");
    $("select#provincias2").append("<option value='27'>Lugo</option>");
    $("select#provincias2").append("<option value='28'>Madrid</option>");
    $("select#provincias2").append("<option value='29'>Málaga</option>");
    $("select#provincias2").append("<option value='52'>Melilla</option>");
    $("select#provincias2").append("<option value='30'>Murcia</option>");
    $("select#provincias2").append("<option value='31'>Navarra</option>");
    $("select#provincias2").append("<option value='32'>Ourense</option>");
    $("select#provincias2").append("<option value='34'>Palencia</option>");
    $("select#provincias2").append("<option value='35'>Palmas, Las</option>");
    $("select#provincias2").append("<option value='36'>Pontevedra</option>");
    $("select#provincias2").append("<option value='26'>Rioja, La</option>");
    $("select#provincias2").append("<option value='37'>Salamanca</option>");
    $("select#provincias2").append("<option value='38'>Santa Cruz de Tenerife</option>");
    $("select#provincias2").append("<option value='40'>Segovia</option>");
    $("select#provincias2").append("<option value='41'>Sevilla</option>");
    $("select#provincias2").append("<option value='42'>Soria</option>");
    $("select#provincias2").append("<option value='43'>Tarragona</option>");
    $("select#provincias2").append("<option value='44'>Teruel</option>");
    $("select#provincias2").append("<option value='45'>Toledo</option>");
    $("select#provincias2").append("<option value='46'>Valencia/Valéncia</option>");
    $("select#provincias2").append("<option value='47'>Valladolid</option>");
    $("select#provincias2").append("<option value='49'>Zamora</option>");
    $("select#provincias2").append("<option value='50'>Zaragoza</option>");

    $("select#provincias2 option[value='22']").prop("selected", true);
    loadMun("22", 2); //Se carga la lista de municipios de Huesca por defecto
  }

  if(display_config['section4']){ //selectores de la sección 4 -> 'GASTOS DE LOS PRINCIPALES SERVICIOS'
    $("select#provincias3").html("");
    $("select#provincias3").append("<option value='02'>Albacete</option>");
    $("select#provincias3").append("<option value='03'>Alicante/Alacant</option>");
    $("select#provincias3").append("<option value='04'>Almería</option>");
    $("select#provincias3").append("<option value='01'>Araba/Álava</option>");
    $("select#provincias3").append("<option value='33'>Asturias</option>");
    $("select#provincias3").append("<option value='05'>Ávila</option>");
    $("select#provincias3").append("<option value='06'>Badajoz</option>");
    $("select#provincias3").append("<option value='07'>Balears, Illes</option>");
    $("select#provincias3").append("<option value='08'>Barcelona</option>");
    $("select#provincias3").append("<option value='48'>Bizkaia</option>");
    $("select#provincias3").append("<option value='09'>Burgos</option>");
    $("select#provincias3").append("<option value='10'>Cáceres</option>");
    $("select#provincias3").append("<option value='11'>Cádiz</option>");
    $("select#provincias3").append("<option value='39'>Cantabria</option>");
    $("select#provincias3").append("<option value='12'>Castellón/Castelló</option>");
    $("select#provincias3").append("<option value='51'>Ceuta</option>");
    $("select#provincias3").append("<option value='13'>Ciudad Real</option>");
    $("select#provincias3").append("<option value='14'>Córdoba</option>");
    $("select#provincias3").append("<option value='15'>Coruña, A</option>");
    $("select#provincias3").append("<option value='16'>Cuenca</option>");
    $("select#provincias3").append("<option value='20'>Gipuzkoa</option>");
    $("select#provincias3").append("<option value='17'>Girona</option>");
    $("select#provincias3").append("<option value='18'>Granada</option>");
    $("select#provincias3").append("<option value='19'>Guadalajara</option>");
    $("select#provincias3").append("<option value='21'>Huelva</option>");
    $("select#provincias3").append("<option value='22'>Huesca</option>");
    $("select#provincias3").append("<option value='23'>Jaén</option>");
    $("select#provincias3").append("<option value='24'>León</option>");
    $("select#provincias3").append("<option value='25'>Lleida</option>");
    $("select#provincias3").append("<option value='27'>Lugo</option>");
    $("select#provincias3").append("<option value='28'>Madrid</option>");
    $("select#provincias3").append("<option value='29'>Málaga</option>");
    $("select#provincias3").append("<option value='52'>Melilla</option>");
    $("select#provincias3").append("<option value='30'>Murcia</option>");
    $("select#provincias3").append("<option value='31'>Navarra</option>");
    $("select#provincias3").append("<option value='32'>Ourense</option>");
    $("select#provincias3").append("<option value='34'>Palencia</option>");
    $("select#provincias3").append("<option value='35'>Palmas, Las</option>");
    $("select#provincias3").append("<option value='36'>Pontevedra</option>");
    $("select#provincias3").append("<option value='26'>Rioja, La</option>");
    $("select#provincias3").append("<option value='37'>Salamanca</option>");
    $("select#provincias3").append("<option value='38'>Santa Cruz de Tenerife</option>");
    $("select#provincias3").append("<option value='40'>Segovia</option>");
    $("select#provincias3").append("<option value='41'>Sevilla</option>");
    $("select#provincias3").append("<option value='42'>Soria</option>");
    $("select#provincias3").append("<option value='43'>Tarragona</option>");
    $("select#provincias3").append("<option value='44'>Teruel</option>");
    $("select#provincias3").append("<option value='45'>Toledo</option>");
    $("select#provincias3").append("<option value='46'>Valencia/Valéncia</option>");
    $("select#provincias3").append("<option value='47'>Valladolid</option>");
    $("select#provincias3").append("<option value='49'>Zamora</option>");
    $("select#provincias3").append("<option value='50'>Zaragoza</option>");
    $("select#provincias3").append("<option value='none'>--</option>");

    $("select#provincias3 option[value='none']").prop("selected", true);
    loadMun("none", 3);//Se carga la lista de municipios de la opción vacia '--' 
  }
}

//Función que inicializa los selectores de cabecera y secciones 3 y 4.
//Se comienza con los selectores de rango municipios y periodo 2012,
//último en añadir.
function initHeaderMenu(){
  $("select#division option[value='MUN']").prop("selected", true);  //municipio
  //$("select#division option[value='DIP']").prop("selected", true); //diputación
  hideDipMenu();
  //showDipMenu();
  showMunMenu();
  //hideMunMenu();
  $("select#periodo option[value='2012']").prop("selected", true);
  initDip();
  initMun();
}

//Función auxiliar que devuelve la cadena introducida
//como parámetro con sus carácteres sin acentos y en
//minúsculas, para favorecer la ordenación de la lista
//de municipios
function removeAccents(cad){
  var c = cad.toLowerCase();
  var aVowels = ["á", "é", "í", "ó", "ú"];
  var oVowels = {"á":"a", "é":"e", "í":"i", "ó":"o", "ú":"u"};
  var ac = '';
  var c2 = '';
  for(var i = 0; i < c.length; i++){
    if(aVowels.indexOf(c[i]) >= 0){
      c2 += oVowels[c[i]];
    } else {
      c2 += c[i];
    }
  }
  return c2;
}

//Función que carga la lista de municipios asociada al código de provincia 'mun'
//en el selector de municipios 'sel' pasado como parámetro
function loadMun(mun, sel){
  sel = undefined != sel ? sel : "";
  var muns = []; 
  $.each(munList[mun], function(key, value){
    muns.push({key:key, value:value});
  });

  //se ordena la lista de municipios alfabeticamente
  var munSorted = muns.sort(function(a,b){
    if(removeAccents(a.value) < removeAccents(b.value)) return -1;
    if(removeAccents(a.value) > removeAccents(b.value)) return 1;
    return 0;
  });

  $("select#municipios"+sel).html("");
  for(var i = 0; i < munSorted.length; i++){
    $("select#municipios"+sel).append("<option value='"+munSorted[i].key+"'>"+munSorted[i].value+"</option>");
  }
}

//Función que añade escuchadores a las flechas laterales SVG de las secciones con slides.
//Cuando se pasa el ratón sobre una flecha cambia de color y se muestra una imagen prefabricada
//de la slide siguiente/anterior. Cuando el ratón abandona la flecha vuelve al color original
//y desaparece la imagen.
function arrowHover(elem, side){
  $(elem).on({
    mouseover: function(event){ //el ratón pasa sobre la flecha
      var num = $(elem).attr("id").slice(-1);
      var tId = "tooltip" + num;
      var side = $(elem).attr("id").slice(0,-1);
      var pId = $(elem).parent().attr("id");
      var maxSlide = (pId == "contenedor2") ? 2 : 3;
      var cSlide =  $("#" + pId + " ul>li:first div").attr("id").slice(-1);
      var sHeight = (tId == "tooltip1")? slideHeight1 : ((tId == "tooltip2") ? slideHeight2 : ((tId == "tooltip3") ? slideHeight3 : slideHeight4));
      var sPrev = ((cSlide-1 == 0)?maxSlide:cSlide-1);
      var sNext = ((cSlide == maxSlide)?1:(+cSlide+1));
      
      var imgLeft = $('<img />', {src: 'img/th'+num+'_'+sPrev+'.png', alt:'Slide'+sPrev, width: $('#'+tId).width(), height: 'auto'});
      var imgRight = $('<img />', {src: 'img/th'+num+'_'+sNext+'.png', alt:'Slide'+sNext, width: $('#'+tId).width(), height: 'auto'});

      $(elem).attr("src", "img/arrow_"+ side + "_hover.svg");
      $("#"+tId).empty();
      $("#"+tId).animate({
        opacity: 0.9
      },{
        duration: 250,
        start: function(){

           $(this).css("top", ((sHeight - sideArrowHeight)/2.0 + 60) + "px");
          if(side == "left"){
            $(this).css("left", (18-$('#'+tId).width()) + "px")
              .css("right", "auto")
              .append(imgLeft);
          } else {
            $(this).css("right", (18-$('#'+tId).width()) + "px")
              .css("left", "auto")
              .append(imgRight);
          }
        }
      });
    
    },
    mouseout: function(){ //el ratón abandona la flecha
      var tId = "tooltip" +  $(elem).attr("id").slice(-1);
      $(elem).attr("src", "img/arrow_"+ side + ".svg");
       $("#"+tId).animate({
        opacity: 0
       }, 250);
    }
  });


}

//Función que inicializa el valor de las variables globales que poseen la información actual 
//de limites de indicadores y gastos de servicios (inicialmente periodo 2012 y rango de municipios).
//Después de actualizar las variables se crean los gráficos de las diferentes secciones, se redimensiona
//aquellas slides que lo necesiten y se actualiza el estado de los gráficos según el valor de los selectores
//de cabecera y cada sección.
function initLimitInfo(){
  var periodo = $("select#periodo option:selected").val();
  var rango = $("select#division option:selected").val();
  var code = (rango == "DIP") ? $("select#diputaciones option:selected").val() : $("select#municipios option:selected").val();
  var f1 = periodo + "-" + rango + "-indi.json";
  var f2 = periodo + "-" + rango + "-serv.json";

  $.when(
    $.getJSON("data/"+f1, function(data){ //fichero de los límites en indicadores
      currentIndicatorLimits = data;
      for(var i = 1; i <= 10; i++){
        currentIndicatorLimits[i].min = parseFloat(currentIndicatorLimits[i].min);
        currentIndicatorLimits[i].max = parseFloat(currentIndicatorLimits[i].max);
        currentIndicatorLimits[i].q1 = parseFloat(currentIndicatorLimits[i].q1);
        currentIndicatorLimits[i].q3 = parseFloat(currentIndicatorLimits[i].q3);
        currentIndicatorLimits[i].p5 = parseFloat(currentIndicatorLimits[i].p5);
        currentIndicatorLimits[i].p95 = parseFloat(currentIndicatorLimits[i].p95);
        currentIndicatorLimits[i].med = parseFloat(currentIndicatorLimits[i].med);
      }
    })
    .done(function(){})
    .fail(function(){alert("Error: Fichero con limites de indicadores no encontrado.");}),
    $.getJSON("data/"+f2, function(data){ //fichero de los límites en gastos de servicios
      currentCostServicesLimits = data;
      var ids = [15,161,162,165,17,23,31,32,33];
      ids.forEach(function(e,i,a){
        currentCostServicesLimits[e].min = parseFloat(currentCostServicesLimits[e].min);
        currentCostServicesLimits[e].max = parseFloat(currentCostServicesLimits[e].max);
        currentCostServicesLimits[e].q1 = parseFloat(currentCostServicesLimits[e].q1);
        currentCostServicesLimits[e].q3 = parseFloat(currentCostServicesLimits[e].q3);
        currentCostServicesLimits[e].p5 = parseFloat(currentCostServicesLimits[e].p5);
        currentCostServicesLimits[e].p95 = parseFloat(currentCostServicesLimits[e].p95);
        currentCostServicesLimits[e].med = parseFloat(currentCostServicesLimits[e].med);
      });
    })
    .done(function(){
      //Se crean gráficos de la sección 0 -> 'Ver indicadores o seleccionar una Administración en Google Maps'
      if(display_config['section0'] != null){initializeMap();}
    })
    .fail(function(){alert("Error: Fichero con limites de gastos de servicios no encontrado.");})
  )
  .done(function(){
    //Se crean gráficos de la sección 1 -> 'LOS 10 PRINCIPALES INDICADORES FINANCIEROS'
    if(display_config['section1'] != null){
      createGauges();
      createLines();
    }
    //Se crean gráficos de la sección 3 -> 'Comparar dos administraciones'
    if(display_config['section3'] != null){createHBars();}
    //Se crean gráficos de la sección 2 -> 'INGRESOS Y GASTOS'
    if(display_config['section2'] != null){createTreemaps();}
    //Se crean gráficos de la sección 4 -> 'GASTOS DE LOS PRINCIPALES SERVICIOS'
    if(display_config['section4'] != null){createServicesHBars();}
    //Se redimensionan las secciones
    initSlidesDimensions();

    //Se actualizan los gráficos con los valores de los selectores
    if(display_config['section0'] != null){updateMap(rango, periodo, $("select#indicadores option:selected").val());}
    if(display_config['section2'] != null){updateTreemaps(getInputTreemaps());}
    refreshValueIndicators(code, rango, 1);
    if(display_config['section4'] != null){refreshValueCostServices(code, rango, 1);}
  })
  .fail(function(){alert("Error: Error al cargar los ficheros de limites de indicadores y gastos de servicios.");});
  
}

//Función que actualiza el valor de las variable global que posee la información actual de
//los limites de indicadores, según el periodo y rango seleccionados en la cabecera. También
//actualiza los gráficos de las secciones que tienen que ver con los indicadores.
function refreshLimitIndicators(){
  var periodo = ($("select#periodo option:selected").val() <= period_limit) ? $("select#periodo option:selected").val() : period_limit;
  var rango = $("select#division option:selected").val();
  var code = (rango == "DIP") ? $("select#diputaciones option:selected").val() : $("select#municipios option:selected").val();
  var f = periodo + "-" + rango + "-indi.json";

  $.getJSON("data/"+f, function(data){
      currentIndicatorLimits = data;
      for(var i = 1; i <= 10; i++){
        currentIndicatorLimits[i].min = parseFloat(currentIndicatorLimits[i].min);
        currentIndicatorLimits[i].max = parseFloat(currentIndicatorLimits[i].max);
        currentIndicatorLimits[i].q1 = parseFloat(currentIndicatorLimits[i].q1);
        currentIndicatorLimits[i].q3 = parseFloat(currentIndicatorLimits[i].q3);
        currentIndicatorLimits[i].p5 = parseFloat(currentIndicatorLimits[i].p5);
        currentIndicatorLimits[i].p95 = parseFloat(currentIndicatorLimits[i].p95);
        currentIndicatorLimits[i].med = parseFloat(currentIndicatorLimits[i].med);
      }
    })
    .done(function(){
      //Se actualiza la sección del mapa
      if($("#coll_bar0").is(":visible") && (display_config['section0'] != null)){updateMap(rango, periodo, $("select#indicadores option:selected").val());}
      //Se actualiza las secciones 1 y 3.
      refreshValueIndicators(code, rango, 1);
    })
    .fail(function(){alert("Error: Fichero con limites de indicadores no encontrado.");});  
}

//Función que actualiza la variable con información de indicadores del municipio/diputación actual en la cabecera,
//definido por los parámetros de entrada. Después se actualizan los gráficos de las secciones 1 y 3.
function refreshValueIndicators(code, rango, op){

  op = undefined != op ? op : 0;

  var fileName = "data/"+ code + "-indi.csv";

  newRatios.code = code;
  newRatios.periodo = parseInt(currentIndicatorLimits.periodo);
  newRatios.rango = rango;
  newRatios.ratios.length = 0;
  newRatios.lines.length = 0;

  $.get(fileName, function(data){
    var lines = data.split("\n");
    var periodCols = lines[0].split(",").slice(4);
    for(var i = 1; i < lines.length-1; i++){
      newRatios.lines[i-1] = [];
      for(var col = 0; col < periodCols.length; col++){
        newRatios.lines[i-1].push({"fecha":String(parseInt(periodCols[col])), "valor": lines[i].split(",")[col+4]});
        if(parseInt(periodCols[col]) == parseInt($("select#periodo option:selected").val())){
          newRatios.ratios.push(parseFloat(lines[i].split(",")[col+4]))
        }
      }
    }
  })
  .done(function(){
    if(newRatios.ratios.length > 0){ //existen datos del periodo
      if($("#g1").is(":visible") && (display_config['section1'] != null)){
        updateGauges(newRatios.ratios);
        updateLines(newRatios.lines);
      }

      if(op == 0){ //modificación de selector de cabecera
        if($("#g3").is(":visible") && (display_config['section3'] != null)){
          var rangoSelect = (newRatios.rango == "DIP") ? "diputaciones" : "municipios";
          var names = [$("select#" + rangoSelect + " option:selected").html(),$("select#" + rangoSelect + "2 option:selected").html()];
          updateHBars(newRatios.ratios, newRatiosOp.ratios, names);
        }
      } else { //modificación selector sección 3 -> 'Comparar dos administraciones'
        if(display_config['section3'] != null){
          var code2 = (rango == "DIP") ? $("select#diputaciones2 option:selected").val() : $("select#municipios2 option:selected").val();
          refreshOppIndicators(code2, newRatios.rango);
        }
      }
    } else {
      var err_msg = (newRatios.rango == "DIP") ? $("select#diputaciones option:selected").html() : $("select#municipios option:selected").html();
      alert("No existen datos de indicadores finanacieros para " + err_msg + " en el periodo " + newRatios.periodo + "(Cabecera)");
    }
  })
  .fail(function(){
    var err_msg = (newRatios.rango == "DIP") ? $("select#diputaciones option:selected").html() : $("select#municipios option:selected").html();
    alert("No existen datos de indicadores finanacieros para " + err_msg + "(Cabecera)");
  }); 
}

//Función que actualiza la variable con información de indicadores del municipio/diputación actual en la sección 3,
//definido por los parámetros de entrada. Después se actualizan los gráficos de las secciones 3.
function refreshOppIndicators(code, rango){
  var fileName = "data/"+ code + "-indi.csv";

  newRatiosOp.code = code;
  newRatiosOp.periodo = parseInt(currentIndicatorLimits.periodo);
  newRatiosOp.rango = rango;
  newRatiosOp.ratios.length = 0;
  newRatiosOp.lines.length = 0;

  $.get(fileName, function(data){
    var lines = data.split("\n");
    var periodCols = lines[0].split(",").slice(4);
    for(var i = 1; i < lines.length-1; i++){
      newRatiosOp.lines[i-1] = [];
      for(var col = 0; col < periodCols.length; col++){
        newRatiosOp.lines[i-1].push({fecha:String(parseInt(periodCols[col])), valor: lines[i].split(",")[col+4]});
        if(parseInt(periodCols[col]) == newRatiosOp.periodo){
          newRatiosOp.ratios.push(parseFloat(lines[i].split(",")[col+4]))
        }
      }
    }
  })
  .done(function(){
    if(newRatiosOp.ratios.length > 0){ //existen datos del periodo
      var rangoSelect = (newRatios.rango == "DIP") ? "diputaciones" : "municipios";
      var names = [$("select#" + rangoSelect + " option:selected").html(),$("select#" + rangoSelect + "2 option:selected").html()];
      updateHBars(newRatios.ratios, newRatiosOp.ratios, names);
    } else {
      var err_msg = (newRatiosOp.rango == "DIP") ? $("select#diputaciones2 option:selected").html() : $("select#municipios2 option:selected").html();
      alert("No existen datos de indicadores finanacieros para " + err_msg + " en el periodo " + newRatiosOp.periodo + "(sección comparar)");
    }

  })
  .fail(function(){
    var err_msg = (newRatiosOp.rango == "DIP") ? $("select#diputaciones2 option:selected").html() : $("select#municipios2 option:selected").html();
    alert("No existen datos de indicadores finanacieros para " + err_msg + "(sección comparar)");
  }); 
}

//Función que actualiza el valor de las variable global que posee la información actual de
//los limites de gastos de servicios, según el periodo y rango seleccionados en la cabecera.
function refreshLimitCostServices(){
  var periodo = ($("select#periodo option:selected").val() <= period_limit) ? $("select#periodo option:selected").val() : period_limit;
  var rango = $("select#division option:selected").val();
  var code = (rango == "DIP") ? $("select#diputaciones option:selected").val() : $("select#municipios option:selected").val();
  var f = periodo + "-" + rango + "-serv.json";

  $.getJSON("data/"+f, function(data){
      currentCostServicesLimits = data;
      var ids = [15,161,162,165,17,23,31,32,33];
      ids.forEach(function(e,i,a){
        currentCostServicesLimits[e].min = parseFloat(currentCostServicesLimits[e].min);
        currentCostServicesLimits[e].max = parseFloat(currentCostServicesLimits[e].max);
        currentCostServicesLimits[e].q1 = parseFloat(currentCostServicesLimits[e].q1);
        currentCostServicesLimits[e].q3 = parseFloat(currentCostServicesLimits[e].q3);
        currentCostServicesLimits[e].p5 = parseFloat(currentCostServicesLimits[e].p5);
        currentCostServicesLimits[e].p95 = parseFloat(currentCostServicesLimits[e].p95);
        currentCostServicesLimits[e].med = parseFloat(currentCostServicesLimits[e].med);
      }); 
    })
    .done(function(){
      //Se actualiza la sección 4 -> 'GASTOS DE LOS PRINCIPALES SERVICIOS'
      refreshValueCostServices(code, rango, 1);
    })
    .fail(function(){alert("Error: Fichero con gastos de servicios no encontrado.");});  
}

//Función que actualiza la variable con información de gastos de servicios del municipio/diputación actual en la cabecera,
//definido por los parámetros de entrada. Después se actualizan los gráficos de la sección 4.
function refreshValueCostServices(code, rango, op){

  op = undefined != op ? op : 0;

  var fileName = "data/"+ code + "-serv.csv";

  newServices.code = code;
  newServices.periodo = parseInt(currentCostServicesLimits.periodo);
  newServices.rango = rango;
  newServices.costes.length = 0;

  $.get(fileName, function(data){
    var lines = data.split("\n");
    var periodCols = lines[0].split(",").slice(4);
    for(var i = 1; i < lines.length-1; i++){
      for(var col = 0; col < periodCols.length; col++){
        var line;
        if(lines[i].indexOf('"') < 0 ){
          line = lines[i].split(",");
        } else {
          line = lines[i].split('"')[0].slice(0,-1).split(",").concat( lines[i].split('"')[1], lines[i].split('"')[2].slice(1).split(","));
        }
        if(parseInt(periodCols[col]) == parseInt($("select#periodo option:selected").val())){
          newServices.costes.push(parseFloat(line[col+4]))
        }
      }
    }
  })
  .done(function(){
    if(newServices.costes.length > 0){ //existen datos del periodo
      if(op == 0){ //modificación de selector de cabecera
        var rangoSelect = (newServices.rango == "DIP") ? "diputaciones" : "municipios";
        var code2 = (rangoSelect == "diputaciones") ? $("select#diputaciones3 option:selected").val() : $("select#municipios3 option:selected").val();
        var names = [$("select#" + rangoSelect + " option:selected").html(),$("select#" + rangoSelect + "3 option:selected").html()];
        
        if(code2 != 'none'){
          updateServicesHBars([{"name":names[0], "values":newServices.costes},{"name":names[1], "values":newServicesOp.costes}]);//newServices.costes, newServicesOp.costes, names);
        } else {
          updateServicesHBars([{"name":names[0], "values":newServices.costes}]);
        }
      } else { //modificación selector sección 4 -> 'GASTOS DE LOS PRINCIPALES SERVICIOS'
        var code2 = (rango == "DIP") ? $("select#diputaciones3 option:selected").val() : $("select#municipios3 option:selected").val();
        refreshOppCostServices(code2, newServices.rango);
      }
    } else {
      var err_msg = (newServices.rango == "DIP") ? $("select#diputaciones option:selected").html() : $("select#municipios option:selected").html();
      alert("No existen datos de gasto de servicios para " + err_msg + " en el periodo " + newServices.periodo + "(Cabecera)");
    }
  })
  .fail(function(){
    var err_msg = (newServices.rango == "DIP") ? $("select#diputaciones option:selected").html() : $("select#municipios option:selected").html();
    alert("No existen datos de gasto de servicios para " + err_msg + "(Cabecera)");
  }); 
}

//Función que actualiza la variable con información de gastos de servicios del municipio/diputación actual en la sección 4,
//definido por los parámetros de entrada. Después se actualizan los gráficos de la sección 4.
function refreshOppCostServices(code, rango){
  var fileName = "data/"+ code + "-serv.csv";
  newServicesOp.code = code;
  newServicesOp.periodo = parseInt(currentCostServicesLimits.periodo);
  newServicesOp.rango = rango;
  newServicesOp.costes.length = 0;

  $.get(fileName, function(data){
    var lines = data.split("\n");
    var periodCols = lines[0].split(",").slice(4);
    for(var i = 1; i < lines.length-1; i++){
      for(var col = 0; col < periodCols.length; col++){
        var line;
        if(lines[i].indexOf('"') < 0 ){
          line = lines[i].split(",");
        } else {
          line = lines[i].split('"')[0].slice(0,-1).split(",").concat( lines[i].split('"')[1], lines[i].split('"')[2].slice(1).split(","));
        }
        if(parseInt(periodCols[col]) == newServicesOp.periodo){
          newServicesOp.costes.push(parseFloat(line[col+4]))
        }
      }
    }
  })
  .done(function(){
    if(newServicesOp.costes.length > 0){ //existen datos del periodo
      var rangoSelect = (newServices.rango == "DIP") ? "diputaciones" : "municipios";
      var names = [$("select#" + rangoSelect + " option:selected").html(),$("select#" + rangoSelect + "3 option:selected").html()];
      updateServicesHBars([{"name":names[0], "values":newServices.costes},{"name":names[1], "values":newServicesOp.costes}]);
    } else {
      var err_msg = (newServicesOp.rango == "DIP") ? $("select#diputaciones3 option:selected").html() : $("select#municipios3 option:selected").html();
      alert("No existen datos de gasto de servicios para " + err_msg + " en el periodo " + newServicesOp.periodo + "(sección gasto servicios)");
    }

  })
  .fail(function(){
    if(code != 'none'){
      var err_msg = (newServicesOp.rango == "DIP") ? $("select#diputaciones3 option:selected").html() : $("select#municipios3 option:selected").html();
      alert("No existen datos de gasto de servicios para " + err_msg + "(sección gasto servicios)");
    } else {
      var rangoSelect = (newServices.rango == "DIP") ? "diputaciones" : "municipios";
      var name = $("select#" + rangoSelect + " option:selected").html();
      updateServicesHBars([{"name":name, "values":newServices.costes}]);
    }
  }); 
}

//Función que devuelve la información necesaria para actualizar la sección 2 -> 'INGRESOS y GASTOS'
function getInputTreemaps(){
  var option = $("select#tree-options option:selected").val(),
      periodo = $("select#periodo option:selected").val(),
      rango = $("select#division option:selected").val(),
      code = (rango == "DIP") ? $("select#diputaciones option:selected").val() : $("select#municipios option:selected").val();

  var fileName = "data/" + periodo + "-" + code + "-" + option.split("-").slice(-1) + ".csv";
  var targetField = (option == "prog") ? 
    ["contexto_lenloc0","contexto_lenloc1","contexto_lenloc2","contexto_lenloc3","contexto_lenloc4","contexto_lenloc5","contexto_lenloc6","contexto_lenloc7"]
     : "contexto_lenloc";
 
  var dataInfo = {fileName: fileName, targetField: targetField};
  return dataInfo;
}

//Función para añadir el servicio de Google Analytics a la página
function activeGoogleAnalytics(){
  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');
  
  ga('create', 'UA-390929-7', 'auto');
  ga('send', 'pageview');
}

//Función que devuelve el número identificativo de intervalo de población, según la población pasada como parámetro.
//Inervalos: 0 -> [0-5000], 1 -> (5000-50000], 2 -> (50000-...)
function rangoPoblacion(pob){
  if(pob <= 5000){
    return 0;
  } else if(pob > 50000) {
    return 2;
  } else {
    return 1;
  }
}

//Función que actualiza el gráfico de la sección 5 (RELACIÓN ENTRE DOS INDICADORES), redibujando
//los puntos del scatter plot al cambiar los selectores de entidad (diputaciones, provincias-municipios),
//los casos en los que no se necesita lanzar una nueva consulta a BigQuery.
function refreshPoints(){
  var scatterPointsFixed = [];
  var rango = $("select#division option:selected").val();
  var periodo = $("select#periodo option:selected").val();
  var loc = (rango == 'DIP') ? $("select#diputaciones option:selected").val() : $("select#municipios option:selected").val();
  var poblacion = (pobList[periodo][loc] != undefined) ? pobList[periodo][loc] : 50000;
  var rango_select_pob = rangoPoblacion(poblacion);
  
  var location = undefined;
  scatterPoints.forEach(function(e,i,a){
    var rango_pob = rangoPoblacion(parseFloat(e.poblacion));
    var name = (rango == 'DIP') ? dipList[e.code] : munList[e.code.slice(0,2)][e.code];
    if(rango_pob == rango_select_pob){
      if(e.code == loc){
        location = {"factorX": e.factorX , "factorY": e.factorY , "source": "source2", "code": e.code, "name": name};
      } else {
        scatterPointsFixed.push({"factorX": e.factorX , "factorY": e.factorY , "source": "source1", "code": e.code, "name": name});
      }
    }
    
  });
  
  if(location){scatterPointsFixed.push(location);}
  updateScatterPlots(scatterPointsFixed, currentR2s['r2_'+(rango_select_pob+1)],
    currentRegs['reg'+(rango_select_pob+1)], {
    "x": addMeasures($("select#factor1 option:selected").html()),
    "y": addMeasures($("select#factor2 option:selected").html())
  });
}

//Función que lanza la consulta a BigQuery determinada por los selectores de factores de la 
//sección 5 (RELACIÓN ENTRE DOS INDICADORES), almacena el resultado de la consulta y actualiza
//el scatter plot, teniendo en cuenta el rango de población en el que se encuentra la entidad
//seleccionada en la cabecera. Existen 3 rangos de población: 
// - menor igual que 5000 habitantes (0)
// - mayor que 5000 habitantes y menor igual que 50000 habitantes (1)
// - mayor que 50000 habitantes (2)
function calculateQuery(){
  scatterPoints.length = 0;
  var scatterPointsFixed = [];

  $(this).attr("disabled", true);
  var rango = $("select#division option:selected").val();
  var periodo = $("select#periodo option:selected").val();
  var factor1 = $("select#factor1 option:selected").html();
  var factor2 = $("select#factor2 option:selected").html();
  var loc = (rango == 'DIP') ? $("select#diputaciones option:selected").val() : $("select#municipios option:selected").val();
  var poblacion = (pobList[periodo][loc] != undefined) ? pobList[periodo][loc] : 50000;
  var rango_select_pob = rangoPoblacion(poblacion);
  var minR2 = 0.3;

  var params = {
    'rango': rango, 
    'periodo': periodo, 
    'factor1': factor1,
    'factor2': factor2,
    'poblacion': poblacion,
    'minR2': minR2
  };
  var timeout = false;
  $("img#load-img").css("visibility", "visible");
  $("div#scatter-timeout").css("visibility", "hidden");

  //Se lanza el script que realiza la consulta a BigQuery
  $.post("html/queries_BQ.php", params, function(data){
    // console.log(data); //descomentar para ver el resultado en bruto de la consulta en la consola del navegador
    if(data.indexOf('<br />') >= 0){ //se trata el caso de error
      $("img#load-img").css("visibility", "hidden");
      $("div#scatter-timeout").css("visibility", "visible");
      $("#ScatterButton").attr("disabled", false);
      timeout = true;
      console.log("controlando error"+ data.indexOf('<br />'));
    } else { // se trata el caso con datos correctos
      var res = JSON.parse(data)["lista"];
      var res2 = JSON.parse(data)["r2s"];
      var res3 = JSON.parse(data)["regressions"]
      
      var location = undefined;
      res.forEach(function(e,i,a){
        var rango_pob = rangoPoblacion(parseFloat(e.poblacion));
        var name = (rango == 'DIP') ? dipList[e.codigo] : munList[e.codigo.slice(0,2)][e.codigo];
        scatterPoints.push({"factorX": parseFloat(e.factor1) , "factorY": parseFloat(e.factor2) , "source": "source1", "code": e.codigo, "poblacion": parseInt(e.poblacion)});
        if(rango_pob == rango_select_pob){
          if(e.codigo == loc){
            location = {"factorX": parseFloat(e.factor1) , "factorY": parseFloat(e.factor2) , "source": "source2", "code": e.codigo, "name": name};
          } else {
            scatterPointsFixed.push({"factorX": parseFloat(e.factor1) , "factorY": parseFloat(e.factor2) , "source": "source1", "code": e.codigo, "name": name});
          }
        }
        
      });

      for(e in res2){
        currentR2s[e] = parseFloat(res2[e]);
      }

      for(e in res3){
        if(res3[e]){
          currentRegs[e] = {'beta': parseFloat(res3[e]['beta']), 'alpha': parseFloat(res3[e]['alpha'])};
        } else {
          currentRegs[e] = null;
        }
      }

      if(location){scatterPointsFixed.push(location);}
    }
  })
  .done(function(){
    if(!timeout){
      $("img#load-img").css("visibility", "hidden");
      updateScatterPlots(scatterPointsFixed, currentR2s['r2_'+(rango_select_pob+1)],
        currentRegs['reg'+(rango_select_pob+1)],  {
        "x": addMeasures($("select#factor1 option:selected").html()),
        "y": addMeasures($("select#factor2 option:selected").html())
      });
    }
  })
  .fail(function(){
    alert("Error al calcular la correlación de " + factor1 + " y " + factor2 + " para " + rango + " en " + periodo);
  });
}

//Función auxuliar que devuelve el label para eje del scatter plot, según el factor pasado como parámetro 
function addMeasures(option){
  var measureMaps = {
    "Población": "Población (miles de hab)",
    "Ingresos": "Ingresos (millones de €)",
    "Gastos": "Gastos (millones de €)",
    "Déficit/Superávit per cápita": "Déficit o superávit per cápita (€/hab)",
    "Ahorro neto per cápita": "Ahorro neto per cápita (€/hab)",
    "Ahorro bruto per cápita": "Ahorro bruto per cápita (€/hab)",
    "Estabilidad presupuestaria": "Estabilidad presupuestaria (€/hab)",
    "Gasto público por habitante": "Gasto público por habitante (€/hab)",
    "Gasto de inversión por habitante": "Gastos de inversión per cápita (€/hab)",
    "Gasto de inversión directo por habitante": "Gastos de inversión directa per cápita (€/hab)",
    "Ingresos fiscales por habitante": "Ingresos fiscales por habitante (€/hab)",
    "Autonomía fiscal": "Autonomía fiscal (%)",
    "Incremento de deuda per cápita": "Incremento de Deuda per cápita (€/hab)"
  };
  return measureMaps[option];
}

//Función que oculta o deja visibles aquellas secciones tal y como viene definido en la variable display_config
function displaySections(){
  //Se ocultan secciones no necesarias
  for(k in display_config){
    if(display_config[k] == null){
      $("#"+k).css("display", "none");
    } else {
      if(["section1","section2","section3","section4"].indexOf(k) >= 0){
        var elements = display_config[k]["slides"].map(function(e){return e.join();}).join().split(",");
        for(p in dashboards[k]){
          if(elements.indexOf(p) < 0){
            if(k == 'section2'){
              $("#"+dashboards[k][p]).parent().css("display","none");
            } else {
              $("#"+dashboards[k][p]).css("display","none");
            }
          }
        }
      } else if("section0" == k){
        var options = display_config[k]["options"];
        var children = $("#indicadores").children();
        for(var i = 0; i < 10; i++){
          if(options.indexOf(parseInt(children[i].value)) < 0){
            children[i].remove();
          }
        }
      } else if("section5" == k){
        var options = display_config[k]["options"];
        var children1 = $("#factor1").children();
        var children2 = $("#factor2").children();
        for(var i = 0; i < 13; i++){
          if(options.indexOf(parseInt(children1[i].value)) < 0){
            children1[i].remove();
            children2[i].remove();
          }
        }
      }
    }
  }
}

//Función que habilita/deshabilita secciones según el valor la variable period_limit.
//Si el valor del periodo seleccionado en la cabecera es mayor que period_limit significa
//que no exiten datos de todas las entidades para ese periodo, por lo que habrá que deshabilitar
//las secciones que no tengan sentido y reajustar las variables de limites. En el caso contrario,
//que el periodo actual sea igual o menor que period_limit, se devuelve todo a la normalidad, al
//volver a disponer de los datos necesarios.
function adaptByPeriodLimit(){
  var periodo = parseInt($("select#periodo option:selected").val());
  if(periodo > period_limit){ //periodo superior al limite con info global
    if((display_config['section0'] != null) && $("#mapa").is(":visible")){console.log("section0");collapseGraphicSection(0);}
    if((display_config['section3'] != null) && $("#g3").is(":visible")){console.log("section3");collapseGraphicSection(3);}
    if((display_config['section5'] != null) && $("#g5").is(":visible")){console.log("section5");collapseGraphicSection(5);}
    
    $("img#coll_arrow0").css("display", "none");
    $("#coll_bar0 h3").off().css("color","#777");
    $("img#coll_arrow3").css("display", "none");
    $("#coll_bar3 h3").off().css("color","#777");
    $("img#coll_arrow5").css("display", "none");
    $("#coll_bar5 h2").off().css("color","#777");

    $("#section4 select").prop("disabled", true);
    $("#pOutLimit").css("display","block").text("(*)  Limites de " + period_limit + ".");
  } else {
    $("img#coll_arrow0").css("display", "block");
    $("#coll_bar0 h3").on("click", function(){collapseGraphicSection(0);})
      .css("color","black")
      .hover(function(){$(this).css("color","#777")},function(){$(this).css("color","black")});
    $("img#coll_arrow3").css("display", "block");
    $("#coll_bar3 h3").on("click", function(){collapseGraphicSection(3);})
      .css("color","black")
      .hover(function(){$(this).css("color","#777")},function(){$(this).css("color","black")});
    $("img#coll_arrow5").css("display", "block");
    $("#coll_bar5 h2").on("click", function(){collapseGraphicSection(5);})
      .css("color","black")
      .hover(function(){$(this).css("color","#777")},function(){$(this).css("color","black")});
    $("#section4 select").prop("disabled", false);
    $("#pOutLimit").css("display","none");
  }
}

$(function(){ //Función que se ejecuta tras cargar la página
  //Google Analytics
  activeGoogleAnalytics();

  //Se el fichero de configuración para ver que seeciones serán visibles
  $.getJSON("data/display_config.json", function(data){ 
    display_config = data;
  })
  .fail(function(e){ //En caso de error, se tomará el valor por defecto, mostrar todas las secciones
    console.log("Error al leer el fichero de configuración, se utilizará la configuración por defecto");
    // console.log(e.responseText);
    display_config = {
      "section0": {"name":"Mapa","options":[1,2,3,4,5,6,7,8,9,10]},
      "section1": {"name":"Indicadores","slides":[
        ["indicador1","indicador2","indicador3"],
        ["indicador4","indicador5","indicador6"],
        ["indicador7","indicador8","indicador9","indicador10"]]},
      "section2": {"name":"Ingresos y gastos","slides":[["treemap"],["hbars"]]},
      "section3": {"name":"Comparar indicadores","slides":[
        ["indicador1","indicador2","indicador3"],
        ["indicador4","indicador5","indicador6"],
        ["indicador7","indicador8","indicador9","indicador10"]]},
      "section4": {"name":"Servicios","slides":[
        ["servicio1","servicio2","servicio3"],
        ["servicio4","servicio5","servicio6"],
        ["servicio7","servicio8","servicio9"]]},
      "section5": {"name":"Relacion","options":[1,2,3,4,5,6,7,8,9,10,11,12,13]}
    };
  })
  .always(function(){

      //Se ocultan secciones no necesarias
      displaySections();

      //Definición de escuchadores
      if(display_config['section0'] != null){
        $("img#coll_arrow0").on("click", function(){ //Botón que colapsa/expande la zona del mapa
          collapseGraphicSection(0);
        });
        $("#coll_bar0 h3").on("click", function(){ //Header que colapsa/expande la zona del mapa
          collapseGraphicSection(0);
        });
      }

      if(display_config['section1'] != null){
        $("img#coll_arrow1").on("click", function(){  //Botón que colapsa/expande la zona de indicadores
          collapseGraphicSection(1);
        });
        $("#coll_bar1 h2").on("click", function(){  //Header que colapsa/expande la zona de indicadores
          collapseGraphicSection(1);
        });
      }

      if(display_config['section2'] != null){
        $("img#coll_arrow2").on("click", function(){  //Botón que colapsa/expande la zona de Presupuesto y Liquidación
          collapseGraphicSection(2);
        });
        $("#coll_bar2 h2").on("click", function(){  //Header que colapsa/expande la zona de Presupuesto y Liquidación
          collapseGraphicSection(2);
        });
      }

      if(display_config['section3'] != null){
        $("img#coll_arrow3").on("click", function(){  //Botón que colapsa/expande la zona de comparaciones
          collapseGraphicSection(3);
        });
        $("#coll_bar3 h3").on("click", function(){  //Header que colapsa/expande la zona de comparaciones
          collapseGraphicSection(3);
        });
      }

      if(display_config['section4'] != null){
        $("img#coll_arrow4").on("click", function(){  //Botón que colapsa/expande la zona de coste de servicios
          collapseGraphicSection(4);
        });
        $("#coll_bar4 h2").on("click", function(){  //Header que colapsa/expande la zona de coste de servicios
          collapseGraphicSection(4);
        });
      }

      if(display_config['section5'] != null){
        $("img#coll_arrow5").on("click", function(){  //Botón que colapsa/expande la zona de correlaciones
          collapseGraphicSection(5);
        });
        $("#coll_bar5 h2").on("click", function(){  //Header que colapsa/expande la zona de correlaciones
          collapseGraphicSection(5);
        });
      }

      
      $("img.right_arrow").each(function(){arrowHover(this, "right");}); //Se añade efecto hover a flechas hacia la derecha
      $("img.left_arrow").each(function(){arrowHover(this, "left");});  //Se añade efecto hover a flechas hacia la izquierda

      if(display_config['section1'] != null){
        $("#left1").on("click", function(){prev(1);});    //Retrocede hacia el anterior slide de la zona de indicadores
        $("#right1").on("click", function(){next(1);});   //Avanza hacia la siguiente slide de la zona de indicadores
      }
      if(display_config['section2'] != null){      
        $("#left2").on("click", function(){prev(2);});    //Retrocede hacia el anterior slide de la zona de Presupuesto y Liquidación
        $("#right2").on("click", function(){next(2);});   //Avanza hacia la siguiente slide de la zona de Presupuesto y Liquidación
      }
      if(display_config['section3'] != null){      
        $("#left3").on("click", function(){prev(3);});    //Retrocede hacia el anterior slide de la zona de comparaciones
        $("#right3").on("click", function(){next(3);});   //Avanza hacia la siguiente slide de la zona de comparaciones
      }
      if(display_config['section4'] != null){      
        $("#left4").on("click", function(){prev(4);});    //Retrocede hacia el anterior slide de la zona de coste de servicios
        $("#right4").on("click", function(){next(4);});   //Avanza hacia la siguiente slide de la zona de coste de servicios 
      }
      

      $("select#division").on("change", function(){ //escuchador ante cambios en el selector "#division"
        if($("select#division option:selected").val() == "DIP"){ //Si la opción elegida es diputaciones
          showDipMenu();  //se muestran los selectores que tienen que ver con diputaciones
          hideMunMenu();  //se ocultan los selectores que tienen que ver con municipios
        } else { //municipios == "MUN", a opción elegida es municipios
          hideDipMenu();  //se ocultan los selectores que tienen que ver con diputaciones
          showMunMenu();  //se muestran los selectores que tienen que ver con municipios
        }
        
        refreshLimitIndicators(); //Se actualizan los Gauges
        if($("#g4").is(":visible") && (display_config['section4'] != null)){refreshLimitCostServices();}
        if(display_config['section5'] != null){$("#ScatterButton").attr("disabled", false);}
        if($("#g2").is(":visible") && (display_config['section2'] != null)){updateTreemaps(getInputTreemaps());}
        if(display_config['section0'] != null){
          var rango = $("select#division option:selected").val();
          var code = (rango == "DIP") ? $("select#diputaciones option:selected").val() : $("select#municipios option:selected").val();
          setTimeout(function(){centerMap(code)}, 500);
        }
      });

      $("select#periodo").on("change", function(){ //escuchador ante cambios en el selector "#periodo"
        adaptByPeriodLimit();
        refreshLimitIndicators(); //Se actualizan los Gauges
        if($("#g4").is(":visible") && (display_config['section4'] != null)){refreshLimitCostServices();}
        if($("#g2").is(":visible") && (display_config['section2'] != null)){updateTreemaps(getInputTreemaps());}
        if(display_config['section5'] != null){$("#ScatterButton").attr("disabled", false);}
      });

      $("select#provincias").on("change", function(){ //Si se produce un cambio en el selector '#provincias', se cargan los municipios
        loadMun($("select#provincias option:selected").val()); //de la provincia selecionada en el selector de municipios
        var code = $("select#municipios option:selected").val();
        refreshValueIndicators(code, "MUN");
        if($("#g4").is(":visible") && (display_config['section4'] != null)){refreshValueCostServices(code, "MUN");}
        if($("#g2").is(":visible") && (display_config['section2'] != null)){updateTreemaps(getInputTreemaps());}
        if(display_config['section0'] != null){setTimeout(function(){centerMap(code)}, 500);}
        if(($("#ScatterButton").attr("disabled") == 'disabled') && (display_config['section5'] != null)){
          refreshPoints();
        } 
      });

      $("select#municipios").on("change", function(){ //Escuchador ante cambios en el selector '#municipios'
        var code = $("select#municipios option:selected").val();
        refreshValueIndicators(code, "MUN");
        if($("#g4").is(":visible") && (display_config['section4'] != null)){refreshValueCostServices(code, "MUN");}
        if($("#g2").is(":visible") && (display_config['section2'] != null)){updateTreemaps(getInputTreemaps());}
        if(display_config['section0'] != null){setTimeout(function(){centerMap(code)}, 500);}
        if(($("#ScatterButton").attr("disabled") == 'disabled') && (display_config['section5'] != null)){
          refreshPoints();
        } 
      });

      $("select#diputaciones").on("change", function(){ //Escuchador ante cambios en el selector 'diputaciones'
        var code = $("select#diputaciones option:selected").val();
        refreshValueIndicators(code, "DIP");
        if($("#g4").is(":visible") && (display_config['section4'] != null)){refreshValueCostServices(code, "DIP");}
        if($("#g2").is(":visible") && (display_config['section2'] != null)){updateTreemaps(getInputTreemaps());}
        if(display_config['section0'] != null){setTimeout(function(){centerMap(code)}, 500);}
        if(($("#ScatterButton").attr("disabled") == 'disabled') && (display_config['section5'] != null)){
          refreshPoints();
        } 
      });



      //Escuchadores selectores sección de comparaciones
      if(display_config['section3'] != null){
        $("select#provincias2").on("change", function(){ //Si se produce un cambio en el selector '#provincias', se cargan los municipios
          loadMun($("select#provincias2 option:selected").val(), 2); //de la provincia selecionada en el selector de municipios
          var code = $("select#municipios2 option:selected").val();
          refreshOppIndicators(code, "MUN");
        });

        $("select#municipios2").on("change", function(){ //Escuchador ante cambios en el selector '#municipios'
          var code = $("select#municipios2 option:selected").val();
          refreshOppIndicators(code, "MUN");
        });

        $("select#diputaciones2").on("change", function(){ //Escuchador ante cambios en el selector 'diputaciones'
          var code = $("select#diputaciones2 option:selected").val();
          refreshOppIndicators(code, "DIP");
        });
      }

      //Escuchadores selectores sección de coste de servicios
      if(display_config['section4'] != null){
        $("select#provincias3").on("change", function(){ //Si se produce un cambio en el selector '#provincias', se cargan los municipios
          loadMun($("select#provincias3 option:selected").val(), 3); //de la provincia selecionada en el selector de municipios
          var code = $("select#municipios3 option:selected").val();
          refreshOppCostServices(code, "MUN");
        });

        $("select#municipios3").on("change", function(){ //Escuchador ante cambios en el selector '#municipios'
          var code = $("select#municipios3 option:selected").val();
         refreshOppCostServices(code, "MUN");
        });

        $("select#diputaciones3").on("change", function(){ //Escuchador ante cambios en el selector 'diputaciones'
          var code = $("select#diputaciones3 option:selected").val();
          refreshOppCostServices(code, "DIP");
        });
      }

      //Escuchador selector sección del mapa
      if(display_config['section0'] != null){
        $("select#indicadores").on("change", function(){ //escuchador ante cambios en el selector "#indicadores"
         updateMap($("select#division option:selected").val(), $("select#periodo option:selected").val(),
               $("select#indicadores option:selected").val());
        });
      }

      //Escuchador selector sección de Ingresos y Gastos
      if(display_config['section2'] != null){
        $("select#tree-options").on("change", function(){ //Escuchador ante cambios en el selector '#tree-options'
          updateTreemaps(getInputTreemaps());
        });
      }

      //Escuchadores de sección correlaciones
      if(display_config['section5'] != null){
        $("#ScatterButton").on("click", calculateQuery);

        $("select#factor1").on("change", function(){
          $("#ScatterButton").attr("disabled", false);
        });

        $("select#factor2").on("change", function(){
          $("#ScatterButton").attr("disabled", false);
        });

        $("#ScatterButton").attr("disabled", false);
      }


      $.getJSON("data/municipios.json", function(data){  //Se lee del servidor el fichero "data/municipios.json" 
        munList = data;                                  //para inicializar los datos de los selectores del header
        munList['none'] = {'none':'--'};
        initHeaderMenu();
       
      })
      .done(function(){

        $.getJSON("data/poblaciones.json", function(data){  //Se lee del servidor el fichero "data/poblaciones.json" 
          pobList = data;                                   //para dar valor a la variable que contendra las poblaciones
        })                                                  //de las entidades
        .fail(function(){
          alert("Error: No se encuentra fichero con el listado de poblaciones y sus códigos");
        })
        .always(function(){ 
          //Código necesario para cargar la información de la población cuyo código ha sido introducido en la URL de la página
          var code = location.search.slice(1);
          if(code != ""){
            if(code.indexOf('DD00') >= 0){ //Diputación
              $("select#division option[value='DIP']").prop("selected", true);
              showDipMenu();
              hideMunMenu();
              $("select#diputaciones option[value='" + code + "']").prop("selected", true);
            } else { //municipio
              $("select#division option[value='MUN']").prop("selected", true);
              hideDipMenu();
              showMunMenu();
              $("select#provincias option[value='" + code.slice(0,2) + "']").prop("selected", true);
              loadMun(code.slice(0,2)); 
              $("select#municipios option[value='" + code + "']").prop("selected", true);
            }
          }

          //Se inicializan las secciones y sus contenidos
          initLimitInfo();
          if(display_config['section5'] != null){createScatterPlots();} //Se crea el gráfico de la sección 5 -> 'RELACIÓN ENTRE DOS INDICADORES'
        });

        
      })
      .fail(function(){
        alert("Error: No se encuentra fichero con el listado de municipios y sus códigos");
      });

      //Escuchadores para los iconos de ayuda, se motrará información pertinente
      //al pasar el ratón por encima del icono y deaparecerá al dejar de estar en
      //contacto con el icono. 
      $("div.info img").on({
        mouseover: function(event){ 
          $(this).next().animate({opacity:1}, 250);
        },
        mouseout: function(){ 
           $(this).next().animate({opacity:0}, 250); 
        }
      });
  });
  
});