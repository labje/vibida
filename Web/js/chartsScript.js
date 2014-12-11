/**********************************************************************/
/* Fichero: 	chartsScript.js                                       */
/* Autor: 		David Gracia Larrodé   dagrala@gmail.com              */
/* Descripción: Script donde se implementan las propiedades y métodos */
/*				de los diferentes tipos de gráficos que se utilizan   */
/*				en la aplicación web del proyecto VIBIDA, necesaria   */
/*              librería JavaScript D3.js                             */
/**********************************************************************/

//objeto con definición de tipos locales en español
var es_ES = {
	"decimal": ",",
  	"thousands": ".",
  	"grouping": [3],
  	"currency": ["€", ""],
  	"dateTime": "%a %b %e %X %Y",
  	"date": "%d/%m/%Y",
  	"time": "%H:%M:%S",
  	"periods": ["AM", "PM"],
 	"days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
  	"shortDays": ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
  	"months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
  	"shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
};

//Se crea objeto d3.locale, para modificar números a nomenclatura española
var esLocale = d3.locale(es_ES);

/***************************************************************/
/*                           Objeto Gauge                      */
/***************************************************************/
function Gauge(placeholderName, configuration)
{
	this.placeholderName = placeholderName;
	
	var self = this; // para tener referencia al objeto en funciones internas de d3

	var parse2Dec = esLocale.numberFormat(",.2f"),
		parseSuff = function(s){return parse2Dec(s)+configuration.typeData},
		parsePercent = d3.format(".2%")
		parsePercentNF = d3.format(",.0%");
	
	//método configure, que da valor a las propiedades del gráfico
	this.configure = function(configuration)
	{
		this.config = configuration;
		
		this.config.size = this.config.size * 0.9; //diametro circulo exterior, 90% tamaño
		
		this.config.radius = this.config.size * 0.97 / 2;  //radio = 97% de la mitad del diametro exterior
		this.config.cx = this.config.size / 2;  //coordenada X del centro
		this.config.cy = this.config.size / 2;  //coordenada Y del centro
		
		this.config.min = undefined != configuration.min ? configuration.min : 0; //valor mínimo, por defecto 0
		this.config.max = undefined != configuration.max ? configuration.max : 100; //valor máximo, por defecto 100
		this.config.range = this.config.max - this.config.min; //rango de valores = (max - min)
	
		this.config.majorTicks = configuration.majorTicks || 5; //nº de marcas grandes
		this.config.minorTicks = configuration.minorTicks || 2; //nº de marcas pequeñas por intervalo
		
		this.config.greenColor 	= configuration.greenColor || "#109618";  //color banda verde, por defecto #109618
		this.config.yellowColor = configuration.yellowColor || "#FF9900"; //color banda amarilla, por defecto #FF9900
		this.config.redColor 	= configuration.redColor || "#DC3912"; //color banda roja, por defecto #DC3912
		
		this.config.transitionDuration = configuration.transitionDuration || 500; //duración de la transición, por defecto medio segundo
	}

	//método draw, que crea e instancia el gráfico dados los datos configurados inicialmente
	this.draw = function()
	{
		this.body = d3.select("#" + this.placeholderName) //Se define la prop body, que es el SVG añadido al placeholder con id this.placeholderName
							.append("svg:svg") //se añade un svg
							.attr("class", "gauge") //con clase gauge
							.attr("width", this.config.size)//se define su anchura
							.attr("height", this.config.size);//se define su altura
		
		this.body.append("svg:circle")				//al svg se le añade un primer círculo
					.attr("cx", this.config.cx)		//se define la coordenada X de su centro
					.attr("cy", this.config.cy)		//se define la coordenada Y de su centro
					.attr("r", this.config.radius)	//se define su radio
					.style("fill", "#ccc")			//se pinta el fondo de color gris
					.style("stroke", "#000")		//el borde de color negro
					.style("stroke-width", "0.5px");//la anchura del borde es medio píxel
					
		this.body.append("svg:circle")				//al svg se le añade un segundo cículo interior donde se dibujará el gauge
					.attr("cx", this.config.cx)		//se define la coordenada X de su centro, mismo que círculo externo
					.attr("cy", this.config.cy)		//se define la coordenada Y de su centro, mismo que círculo externo
					.attr("r", 0.9 * this.config.radius) //se define su radio, 90% del radio del círculo externo
					.style("fill", "#fff")			//se pinta el fondo de blanco
					.style("stroke", "#e0e0e0")		//el borde de color gris claro
					.style("stroke-width", "2px");	//la anchura del borde es 2 píxeles
			
		//las propiedades "color"Zones son arrays de objetos {from:value, to: value}		
		for (var index in this.config.greenZones) //Se pintan las bandas verdes, en caso de que se hayan definido
		{
			this.drawBand(this.config.greenZones[index].from, this.config.greenZones[index].to, self.config.greenColor);
		}
		
		for (var index in this.config.yellowZones) //se pintan las bandas amarillas, en caso de que se hayan definido
		{
			this.drawBand(this.config.yellowZones[index].from, this.config.yellowZones[index].to, self.config.yellowColor);
		}
		
		for (var index in this.config.redZones) //se pintan las bandas rojas, en caso de que se hayan definido
		{
			this.drawBand(this.config.redZones[index].from, this.config.redZones[index].to, self.config.redColor);
		}
		
		if (undefined != this.config.label) //si la propiedad label esta definida
		{
			var fontSize = Math.round(this.config.size / 9); //el tamaño de la fuente es la novena parte del tamaño del grafico
			this.body.append("svg:text")			//se añade un componente texto
						.attr("x", this.config.cx)	//se define la coordenada X, igual a la coordenada X del centro de los círculos
						.attr("y", this.config.cy / 2 + fontSize / 2) //se define la coordenada Y, igual a la coordenada Y del centro de los círculos
						.attr("dy", fontSize / 2)	//se define el ajuste vertical como mitad del tamaño de fuente
						.attr("text-anchor", "middle") //el punto de referencia será el centro del texto
						.text(this.config.label) //Se asigna el contenido del texto
						.style("font-size", fontSize + "px") //se asigna el tamaño del texto (1/9)
						.style("fill", "#333") //el color de la fuente sera gris oscuro
						.style("stroke-width", "0px"); //la anchura del borde es 0 píxeles
		}
		
		var fontSize = Math.round(this.config.size / 16); //se reutiliza la variable fontSize ahora la 16ava parte del tamaño del gráfico
		var majorDelta = this.config.range / (this.config.majorTicks - 1); //Se calcula el valor de cada intervalo grande definido por la propiedad majorTicks
		for (var major = this.config.min; major <= this.config.max; major += majorDelta) //se recorre valores dentro del rango comenzando desde el minimo hasta el máximo, con saltos de majorDelta
		{
			var minorDelta = majorDelta / this.config.minorTicks; //se calcula el valor de cada intervalo pequeño definido por la propiedad menorTicks
			for (var minor = major + minorDelta; minor < Math.min(major + majorDelta, this.config.max); minor += minorDelta) //se recorre valores dentro de cada intervalo grande, con saltos de minorDelta
			{
				var point1 = this.valueToPoint(minor, 0.75); //devuelve el punto correspondiente a minor, con un radio 75% del radio del círculo externo
				var point2 = this.valueToPoint(minor, 0.85); //devuelve el punto correspondiente a minor, con un radio 85% del radio del círculo externo
				
				this.body.append("svg:line") //Se añade una línea (corta)
							.attr("x1", point1.x) //se define la coordenada X del punto inicial de la linea con la propiedad x de point1
							.attr("y1", point1.y) //se define la coordenada Y del punto inicial de la linea con la propiedad y de point1
							.attr("x2", point2.x) //se define la coordenada X del punto final de la linea con la propiedad x de point2
							.attr("y2", point2.y) //se define la coordenada Y del punto final de la linea con la propiedad y de point2
							.style("stroke", "#666") //el color del borde es un color gris
							.style("stroke-width", "1px"); //la anchura del borde de la línea es 1px
			}
			
			var point1 = this.valueToPoint(major, 0.7);	//devuelve el punto correspondiente a major, con un radio 70% del radio del círculo externo
			var point2 = this.valueToPoint(major, 0.85);//devuelve el punto correspondiente a major, con un radio 85% del radio del círculo externo
			
			this.body.append("svg:line")		//se añade una línea (larga)
						.attr("x1", point1.x)	//se define la coordenada X del punto inicial de la linea con la propiedad x de point1
						.attr("y1", point1.y)	//se define la coordenada Y del punto inicial de la linea con la propiedad y de point1
						.attr("x2", point2.x)	//se define la coordenada X del punto final de la linea con la propiedad x de point2
						.attr("y2", point2.y)	//se define la coordenada Y del punto final de la linea con la propiedad y de point2
						.style("stroke", "#333") //el color del borde es un color gris oscuro
						.style("stroke-width", "2px"); //la anchura del borde de la línea es 2px
			
			if (major.toFixed(4) == this.config.min.toFixed(4) || major.toFixed(4) == this.config.max.toFixed(4)) //si el valor a representar es el mínimo o el máximo del rango
			{
				var point = this.valueToPoint(major, 0.63); //devuelve el punto correspondiente a minor, con un radio 63% del radio del círculo externo
				
				this.body.append("svg:text")	//se añade un elemento texto
							.attr("class", function(d){ return (major.toFixed(4) == self.config.min.toFixed(4)) ? "start" : "end";})
				 			.attr("x", point.x)	//se define la coordenada X del punto de referencia del texto con la propiedad x de point
				 			.attr("y", point.y) //se define la coordenada Y del punto de referencia del texto con la propiedad y de point
				 			.attr("dy", fontSize / 3) //se define el ajuste vertical como la tercera parte del tamaño de texto
				 			.attr("text-anchor", major == this.config.min ? "start" : "end") //si el valor es el minimo el punto de referencia es el comienzo del texto,
				 			.text(function(){return (self.config.typeData == '%') ? parsePercentNF(major).slice(0,-1) : Math.round(major);})// si es el máximo entonces el punto de referencia es el final del texto, se asigna el contenido del texto
				 			.style("font-size", fontSize + "px") //se asigna el tamaño de fuente (1/16)
							.style("fill", "#333") //el color del texto es gris oscuro
							.style("stroke-width", "0px"); //la anchura del borde es 0px
			}
		}

		var medPoint = this.valueToPoint(this.degreesToValue(-45), 0.80);
		var targetRotation = this.valueToDegrees(this.config.med);
		this.body.append("circle")
			.attr("class", "medianPoint")
			.attr("cx", medPoint.x)
			.attr("cy", medPoint.y)
			.attr("r", 0.05*this.config.radius)
			.style("fill", "rgba(0,0,0,0.75)")
			.style("stroke", "#222")
			.style("stroke-width", "1px")
			//.style("opacity", 0.75)
			.attr("transform", function(){return "rotate(" + (targetRotation+45) + "," + self.config.cx + "," + self.config.cy + ")";});
		
		var pointerContainer = this.body.append("svg:g").attr("class", "pointerContainer"); //se añade un elemento g al svg con clase pointerContainer
		
		var midValue = (this.config.min + this.config.max) / 2; //se calcula el punto medio del rango
		
		var pointerPath = this.buildPointerPath(midValue);	 //se calcula el path que forma el puntero
		
		var pointerLine = d3.svg.line()			//se define un generador de linea
									.x(function(d) { return d.x }) //coordenada X igual a la propiedad x del dato correspondiente
									.y(function(d) { return d.y }) //coordenada Y igual a la propiedad y del dato correspondiente
									.interpolate("basis"); //se define el método de interpolación "basis"
		
		pointerContainer.selectAll("path") //se buscan todos los elementos path de g.pointerContainter
							.data([pointerPath]) //se asignan datos el array formado por los puntos que forman el puntero
							.enter()
								.append("svg:path") //se van añadiendo elementos path por cada punto de los datos asignados
									.attr("d", pointerLine) //se asigna el generado de línea definido anteriormente
									.style("fill", "#dc3912")//el color de relleno es rojo
									.style("stroke", "#c63310")//el color del borde es un rojo más oscuro
									.style("fill-opacity", 0.7)//la opacidad del relleno es del 70%
					
		pointerContainer.append("svg:circle") //se añade a g.pointerContainer un elemento circle
							.attr("cx", this.config.cx) // se define la cordenada X del centro del circulo, como la coordenada X centro de los demás circulos
							.attr("cy", this.config.cy) // se define la cordenada Y del centro del circulo, como la coordenada Y centro de los demás circulos
							.attr("r", 0.12 * this.config.radius) // se define el radio del circulo como el 12% del radio del circulo externo
							.style("fill", "#4684EE") //el relleno es de color azul
							.style("stroke", "#666") //el borde es de color gris
							.style("opacity", 1); //la opacidad del circulo del 100%
		
		var fontSize = Math.round(this.config.size / 10); //se reutiliza la variable fontSize ahora la decima parte del tamaño del gráfico
		pointerContainer.selectAll("text")	//se buscan todos los elementos text contenidos en el elemento g pointerContainer
							.data([midValue]) //se le asigna datos, el array formado por el punto medio del rango
							.enter()
								.append("svg:text") //se van a ir creando elementos texto segun sea necesario por el nº de elementos asignados
									.attr("x", this.config.cx) //se define la coordenada X del punto de referencia del texto con la coordenda X del centro de los circulos
									.attr("y", this.config.size - this.config.cy / 4 - fontSize) //se define la coordenada Y del punto de referencia del texto en la parte inferior del circulo interno
									.attr("dy", fontSize / 2) //se define el ajuste vertical como la mitad del tamaño de texto
									.attr("text-anchor", "middle") //el punto de referencia será el centro del texto
									.style("font-size", fontSize + "px") //se define el tamaño del texto (1/10)
									.style("fill", "#000") //el color del texto es negro
									.style("stroke-width", "0px"); //la anchura del borde es 0px
		var o = {};
		o.value = this.config.min;
		this.redraw(o, 0); //se repinta el pointerContainer apuntando al valor minimo del rango con una duración de la transición de 0 ms
	}
	
	//método buildPointerPath que devuelve el path del puntero dado un valor
	this.buildPointerPath = function(value) 
	{
		var delta = this.config.range / 13; //se define delta como la 13ava parte del rango
		
		var head = valueToPoint(value, 0.85); //devuelve el punto correspondiente a value, con un radio 85% del radio del círculo externo, menos coordenadas cel centro
		var head1 = valueToPoint(value - delta, 0.12);//devuelve el punto correspondiente a value - delta, con un radio 12% del radio del círculo externo, menos coordenadas cel centro
		var head2 = valueToPoint(value + delta, 0.12);//devuelve el punto correspondiente a value + delta, con un radio 12% del radio del círculo externo, menos coordenadas cel centro
		
		var tailValue = value - (this.config.range * (1/(270/360)) / 2); //se define tailValue a partir de value y el rango
		var tail = valueToPoint(tailValue, 0.28); //se define el valor de la cola
		var tail1 = valueToPoint(tailValue - delta, 0.12);//se define el valor de la cola1
		var tail2 = valueToPoint(tailValue + delta, 0.12);//se define el valor del la cola2
		
		return [head, head1, tail2, tail, tail1, head2, head]; //devuelve los diferentes puntos del path que forman el puntero
		
		function valueToPoint(value, factor) //función local de valor númerico a punto correspondiente
		{
			var point = self.valueToPoint(value, factor); //llama a la funcion valueToPoint de Gauge
			point.x -= self.config.cx; //a la coordenada X resultante le resta la coordenada X del centro de los circulos
			point.y -= self.config.cy; //a la coordenada Y resultante le resta la coordenada Y del centro de los circulos
			return point; //devuelve el punto resultente
		}
	}
	
	//el método drawBand pinta la banda de color definida por los parámetros de entrada
	this.drawBand = function(start, end, color) 
	{
		if (0 >= end - start) return; //se comprueba que el rango es correcto, ordenado de mayor a menor cantidad
		
		this.body.append("svg:path") //se añade un elemento path al svg
					.style("fill", color) //el color de relleno esta definido por el valor del parametro color
					.attr("class", function(){return (color == self.config.greenColor) ? "green": (color == self.config.redColor ? "red" : "yellow");})
					.attr("d", d3.svg.arc() //el camino se define con el siguiente generador de arcos
						.startAngle(this.valueToRadians(start)) //se define el angulo inicial en radianes
						.endAngle(this.valueToRadians(end)) //se define el angulo final en radianes
						.innerRadius(0.65 * this.config.radius) //se define el radio interno del arco, 65% del radio del círculo externo
						.outerRadius(0.85 * this.config.radius)) //se define el radio externo del arco, 85% del radio del círculo externo
					.attr("transform", function() { return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(270)" }); //se mueve al centro de los circulos y se rota 270º
	}
	
	//método redraw, que actualiza el gráfico dados nuevos datos
	this.redraw = function(confObj, transitionDuration)
	{
		var value = confObj.value;
		
		var min = (undefined != confObj.min) ? confObj.min : this.config.min;
		var max = (undefined != confObj.max) ? confObj.max : this.config.max;
		var range = max - min;
		var q1 = (undefined != confObj.q1) ? confObj.q1 : this.config.q1;
		var q3 = (undefined != confObj.q3) ? confObj.q3 : this.config.q3;
		var med = (undefined != confObj.med) ? confObj.med : this.config.med; 

		var redDegrees = {from: this.valueToDegrees(this.config.redZones[0].from), to:  this.valueToDegrees(this.config.redZones[0].to)};
		var greenDegrees = {from: this.valueToDegrees(this.config.greenZones[0].from), to:  this.valueToDegrees(this.config.greenZones[0].to)};

		var drawArc = d3.svg.arc()
			.innerRadius(0.65 * this.config.radius) 
			.outerRadius(0.85 * this.config.radius)
			.startAngle(function(d, i) { return self.valueToRadians(d.start);})
			.endAngle(function(d, i) { return self.valueToRadians(d.end);});

		if(min != this.config.min){
			this.config.min = min;
			this.body.select(".start").text(function(){return (self.config.typeData == '%') ? parsePercentNF(min).slice(0,-1) : Math.round(min);});
		}

		if(max != this.config.max){
			this.config.max = max;
			this.body.select(".end").text(function(){return (self.config.typeData == '%') ? parsePercentNF(max).slice(0,-1) : Math.round(max);});
		}

		if(range != this.config.range){
			this.config.range = range;
		}

		if(q1 != this.config.q1){
			this.config.q1 = q1;
		}
		
		if(q3 != this.config.q3){
			this.config.q3 = q3;
		}

		if(med != this.config.med){
			var targetRotation = this.valueToDegrees(med);
			var currentRotation = this.valueToDegrees(this.config.med);
			var medCircle = this.body.select(".medianPoint").transition()
				.duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
				.attr("transform", function(){return "rotate(" + (targetRotation+45) + "," + self.config.cx + "," + self.config.cy + ")";});
			this.config.med = med;

		}

		//En caso de que se hayan modificado los limites se actualiza la banda roja
		if((this.config.redZones[0].from != min)||(this.config.redZones[0].to != q1)){
			var redBand = this.body.select(".red")
				.each(function(d){
		        	this._current = {start: self.degreesToValue(redDegrees.from), end: self.degreesToValue(redDegrees.to)};
		        	this._target = {start:min, end:q1};
		    	});
			this.config.redZones[0].from = min;
			this.config.redZones[0].to = q1;

			redBand.transition()
				.duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
				.attrTween("d", arc2Tween);
		}

		//En caso de que se hayan modificado los limites se actualiza la banda verde
		if((this.config.greenZones[0].from != q3)||(this.config.greenZones[0].to != max)){
			var greenBand = this.body.select(".green")
				.each(function(d){
		        	this._current = {start: self.degreesToValue(greenDegrees.from), end: self.degreesToValue(greenDegrees.to)};
		        	this._target = {start:q3, end:max};
		    	});
			this.config.greenZones[0].from = q3;
			this.config.greenZones[0].to = max;

			greenBand.transition()
				.duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration)
				.attrTween("d", arc2Tween);
		}
	
		var pointerContainer = this.body.select(".pointerContainer");
		pointerContainer.selectAll("text")
			.text(function(){return (self.config.typeData != "%") ? parseSuff(value) : parsePercent(value);})
			.style("font-weight", "bold");
		
		var pointer = pointerContainer.selectAll("path");
		pointer.transition()
					.duration(undefined != transitionDuration ? transitionDuration : this.config.transitionDuration) 
					.attrTween("transform", function()
					{
						var pointerValue = value;
						if (value > self.config.max) pointerValue = self.config.max + 0.02*self.config.range;
						else if (value < self.config.min) pointerValue = self.config.min - 0.02*self.config.range;
						var targetRotation = (self.valueToDegrees(pointerValue) - 90);
						var currentRotation = self._currentRotation || targetRotation;
						self._currentRotation = targetRotation;
						
						return function(step) 
						{
							var rotation = currentRotation + (targetRotation-currentRotation)*step;
							return "translate(" + self.config.cx + ", " + self.config.cy + ") rotate(" + rotation + ")"; 
						}
					});
	
		//función que describe la transición de arco
		function arc2Tween(d, indx) {
		    var interp = d3.interpolate(this._current.end, this._target.end);
		    var interp2 = d3.interpolate(this._current.start, this._target.start)

		    this._current.end = this._target.end;                   
		    this._current.start = this._target.start;
		    return function(t) {                 
		      var tmp = {};
		      tmp.start = interp(t);                
		      tmp.end = interp2(t);

		      return drawArc(tmp, indx);
		    }
  		}
	}

	//método valueToDegrees que pasa valor numerico a grados dentro del intervalo -45º a 225º
	this.valueToDegrees = function(value)
	{
		return value / this.config.range * 270 - (this.config.min / this.config.range * 270 + 45);
	}
	//método valueToRadians que pasa de valor númerico a radianes
	this.valueToRadians = function(value)
	{
		return this.valueToDegrees(value) * Math.PI / 180;
	}
	//método valueToPoint que pasa de valor a un objeto punto
	this.valueToPoint = function(value, factor)
	{
		return { 	x: this.config.cx - this.config.radius * factor * Math.cos(this.valueToRadians(value)),
					y: this.config.cy - this.config.radius * factor * Math.sin(this.valueToRadians(value)) 		};
	}
	//método degreesToValue que pasa de grados[-45º,225º] a valor numerico
	this.degreesToValue = function(degrees)
	{
		return (degrees + (this.config.min / this.config.range * 270 + 45)) / 270 * this.config.range;
	}
	
	// initialization
	this.configure(configuration);	
}

/***************************************************************/
/*                          Objeto Line                        */
/***************************************************************/
function Line(placeholderName, configuration)
{
	this.placeholderName = placeholderName;
	
	var self = this; // para tener referencia al objeto en funciones internas de d3
	var parseDate = d3.time.format("%Y").parse;

	//método configure, que da valor a las propiedades del gráfico
	this.configure = function(configuration)
	{
		this.config = configuration;
		
		this.margin = configuration.margin;
		this.height = this.config.height - this.config.margin.top - this.config.margin.bottom;
		this.width = this.config.width - this.config.margin.left - this.config.margin.right;

		this.data = configuration.data;
		this.ticks = configuration.ticks;
		this.color = configuration.color;

		this.data.forEach(function(element, index, array){
			element.fecha = typeof element.fecha == "string" ? parseDate(element.fecha) : element.fecha;
			element.valor = typeof element.valor == "string" ? +element.valor : element.valor;
		});

		this.config.transitionDuration = configuration.transitionDuration || 750; //duración de la transición, por defecto medio segundo
	}

	//método draw, que crea e instancia el gráfico dados los datos configurados inicialmente
	this.draw = function()
	{
		
		var xrange = d3.extent(this.data, function(d) { return d.fecha; });
		var xmin = new Date(xrange[0].getTime()),
		    xmax = new Date(xrange[1].getTime());
		xmin.setFullYear(xmin.getFullYear()-1);
		xmax.setFullYear(xmax.getFullYear()+1);

		
		var x = d3.time.scale()
		    .range([0, this.width])
		    .domain([xmin,xmax]);

		var y = d3.scale.linear()
		    .range([this.height, 0]);

		if(this.data.length > 1){
			var dom = d3.extent(this.data, function(d) { return d.valor; });
			var ymin = (Math.floor(Math.abs(dom[0])/100.0)+1)*-100;
			var ymax = (Math.floor(Math.abs(dom[1])/100.0)+1)*100;
			y.domain([ymin, ymax]);
		} else {
			var v = (Math.floor(Math.abs(this.data[0].valor)/100.0)+1)*100;
			y.domain([-v, v]);
		}
		    

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom")
		    .ticks(this.data.length+1);

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .ticks([this.ticks]);

		var line = d3.svg.line()
		    .x(function(d) { return x(d.fecha); })
		    .y(function(d) { return y(d.valor); });

		this.body = d3.select("#" + this.placeholderName) //Se define la prop body, que es el SVG añadido al placeholder con id this.placeholderName
			.append("svg:svg") //se añade un svg
				.attr("class", "line-chart") //con clase line
				.attr("width", this.width + this.margin.left + this.margin.right)//se define su anchura
				.attr("height", this.height + this.margin.top + this.margin.bottom)//se define su altura
				.style("font-size", "10px")
			.append("g") //Se añade un elemento G al SVG
				.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")"); //Su punto de referencia esta en la esquina (top,left)
		
		this.body.append("g")
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + this.height + ")")
		      .call(xAxis);

		this.body.append("g")
		      .attr("class", "y axis")
		      .call(yAxis);

			this.body.append("path")
		      .attr("class", "line")
		      .attr("d", line(this.data))
		      .style("fill","none")
		      .style("stroke", this.color)
		      .style("stroke-width", "1.5px");

		this.body.selectAll(".points")
			.data(this.data)
		  .enter().append("circle")
		  	.attr("class", "points")
			.attr("cx", function(d){return x(d.fecha);})
			.attr("cy", function(d){return y(d.valor);})
			.attr("r", "2px")
			.style("fill", "red");

		//método redraw, que actualiza el gráfico dados nuevos datos
		this.redraw = function(dataInfo, transitionDuration){
			transitionDuration = undefined != transitionDuration ? transitionDuration : this.config.transitionDuration;
			this.data = dataInfo;
			this.data.forEach(function(element, index, array){
				element.fecha = typeof element.fecha == "string" ? parseDate(element.fecha) : element.fecha;
				element.valor = typeof element.valor == "string" ? +element.valor : element.valor;
			});
			var xrange = d3.extent(this.data, function(d) { return d.fecha; });
			var xmin = new Date(xrange[0].getTime()),
			    xmax = new Date(xrange[1].getTime());
			xmin.setFullYear(xmin.getFullYear()-1);
			xmax.setFullYear(xmax.getFullYear()+1);

			x.domain([xmin,xmax]);

			if(this.data.length > 1){
				var dom = d3.extent(this.data, function(d) { return d.valor; });
				var ymin = (Math.floor(Math.abs(dom[0]/100)) + 1)*-100;
				var ymax = (Math.floor(Math.abs(dom[1])/100.0)+1)*100;
				y.domain([ymin, ymax]);
			} else {
				var v = (Math.floor(Math.abs(this.data[0].valor)/100.0)+1)*100;
				y.domain([-v, v]);
			}


			// Se selecciona la sección a la que se quiere aplicar los cambios
			var g = this.body.transition();
			var puntos = this.body.selectAll(".points")
				.data(this.data);

			puntos.enter().append("circle")
			      .attr("class", "points")
				  .attr("cx", function(d){return x(d.fecha);})
				  .attr("cy", function(d){return y(d.valor);})
				  .attr("r", "2px")
				  .style("fill", "red");
			puntos.exit().remove();
			
			g.select(".line")   // actualiza la linea
			    .duration(transitionDuration)
			    .attr("d", line(this.data));
			g.select(".x.axis") // actualiza el eje x
			    .duration(transitionDuration)
			    .call(xAxis);
			g.select(".y.axis") // actualiza el eje y
			    .duration(transitionDuration)
			    .call(yAxis);
			g.selectAll(".points")// actualiza puntos 
				.duration(transitionDuration)
				.attr("cx", function(d){return x(d.fecha);})
				.attr("cy", function(d){return y(d.valor);});


		}
	}
	
	
	// initialization
	this.configure(configuration);
}


/***************************************************************/
/*                           Objeto HBar                       */
/***************************************************************/
function HBar(placeholderName, configuration)
{
	this.placeholderName = placeholderName;
	
	var self = this; // para tener referencia al objeto en funciones internas de d3

	var parse2Dec = esLocale.numberFormat(",." + configuration.dec + "f"),
		parseSuff = function(s){return parse2Dec(s)+configuration.typeData},
		parsePercent = d3.format("." + configuration.dec + "%");
	var color = function(c){return configuration.colors[c];};

	//método configure, que da valor a las propiedades del gráfico
	this.configure = function(configuration)
	{
		this.config = configuration;
		
		this.margin = configuration.margin;
		this.width = this.config.width - this.config.margin.right - this.config.margin.left;
		this.height = this.config.height - this.config.margin.top - this.config.margin.bottom;

		this.data = configuration.data;
		this.ticks = configuration.ticks;
		this.title = configuration.title;
		this.legend = configuration.legend;
		this.zeroNull = configuration.zeroNull;

		this.config.transitionDuration = configuration.transitionDuration || 750; //duración de la transición, por defecto medio segundo
	}

	//método draw, que crea e instancia el gráfico dados los datos configurados inicialmente
	this.draw = function()
	{
		
		var x = d3.scale.linear().range([0, this.width]),
			y = d3.scale.ordinal().rangeRoundBands([0, this.height], .2);

		var xAxis = d3.svg.axis()
			.scale(x)
			.orient("bottom")
			.tickSize(6, 2)
			.ticks(this.ticks);

		if(this.config.typeData == '%'){
			xAxis.tickFormat(esLocale.numberFormat(",.0%"));
		} else {
			xAxis.tickFormat(esLocale.numberFormat(",.0f"));
		}

		this.body = d3.select("#" + this.placeholderName).append("svg")
			.attr("class", "hBar") //con clase hBar
			.attr("width", this.width + this.margin.right + this.margin.left)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
		  .append("g")
		  	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


		var limits = d3.extent(this.data, function(d){return d.value;});

		if(limits[0] < 0 && limits[1] <= 0){
			x.domain([limits[0], 0]).nice();
		} else if(limits[0] >= 0 && limits[1] > 0){
			x.domain([0,limits[1]]).nice();
		} else {
			x.domain(limits).nice();
		}
		
		y.domain(this.data.map(function(d){return d.name;}));


		if (this.legend != "none"){ 
			var legend = this.body.selectAll(".legend")
				.data(this.data)
			  .enter().append("g")
				.attr("class", "legend")
				.attr("transform", function(d, i){
					var coords = (self.legend == 'top') ? "translate(0," + (-(1/(1 + 1 * i))*self.margin.top) + ")" : 
						((self.legend == 'bottom') ? "translate(0," + (((1+i)/2)*self.margin.bottom + self.height) + ")" : null);
					
					return coords;
				});
			
			legend.append("rect")
			  	.attr("x", 0)
			  	.attr("y", 0)
			  	.attr("width", 30)
			  	.attr("height", this.margin.top/4)
			  	.style("fill", function(d,i){return color(i);});
	
			legend.append("text")
				.attr("x", 40)
				.attr("y", 0)
				.attr("dy", "1em")
				.style("text-anchor", "start")
				.text(function(d){return d.label});
		}

		if(this.title != null){
			var title = this.body.append("g")
				.attr("class", "hbar-title")
				.attr("transform", "translate(0," + (-this.margin.top) + ")");
			
			title.append("text")
				.attr("x", 0)
				.attr("y", 0)
				.attr("dy", "1em")
				.style("text-anchor", "start")
				.style("font-weight", "bold")
				.text(this.title)
				.each(cutLongTitle);

		}

		var bars = this.body.selectAll(".bar")
			.data(this.data)
		  .enter().append("g")
		  	.attr("class", "bar");

		bars.append("rect")
			.attr("class", function(d){return (d.value < 0) ? "bar negative" : "bar positive";})
		  	.attr("x", function(d){return x(Math.min(0, d.value));})
		  	.attr("y", function(d){return y(d.name);})
		  	.attr("width", function(d){return Math.abs(x(d.value) - x(0));})
		  	.attr("height", y.rangeBand())
		  	.style("fill", function(d, i){return color(i);});

		bars.append("text")
		  	.attr("x", function(d){ return x(d.value)})
		  	.attr("y", function(d){return y(d.name)+y.rangeBand()/2;})
		  	.attr("dy", ".35em")
		  	.attr("dx", function(d){return (d.value < 0) ? ".5em" : "-0.5em";})
		  	.style("text-anchor", function(d){return (d.value < 0) ? "start" : "end";})
		  	.text(function(d){return (self.config.typeData != "%") ? parseSuff(d.value) : parsePercent(d.value);});

		this.body.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + this.height +")")
			.call(xAxis);

		this.body.append("g")
			.attr("class", "y axis")
		  .append("line")
		  	.attr("x1", x(0))
		  	.attr("x2", x(0))
		  	.attr("y2", this.height);


		//método redraw, que actualiza el gráfico dados nuevos datos
		this.redraw = function(dataInfo, transitionDuration, dataTitle){
			transitionDuration = undefined != transitionDuration ? transitionDuration : this.config.transitionDuration;
			this.data = dataInfo;
			dataTitle = undefined != dataTitle ? dataTitle : null;

			var limits = d3.extent(this.data, function(d){return d.value;});
			y.domain(this.data.map(function(d){return d.name;}));

			if(limits[0] < 0 && limits[1] <= 0){
				x.domain([limits[0], 0]).nice();
			} else if(limits[0] >= 0 && limits[1] > 0){
				x.domain([0,limits[1]]).nice();
			} else {
				x.domain(limits).nice();
			}
			


			var g = this.body.selectAll("g.bar")
				.data(this.data, function(d){ return d.name});

			g.exit().remove();//se borran datos que sobren

			var appendBars = g.enter().append("g") //se tratan datos nuevos
				.attr("class", "bar");

			appendBars.append("rect")
			  	.style("fill", function(d, i){return color(i);});

			appendBars.append("text")
			  	.text(function(d){return (self.config.typeData != "%") ? parseSuff(d.value) : parsePercent(d.value);});


			g.select("text")
				.text(function(d){return ((d.value == 0) && (self.zeroNull)) ? 'S/D' : ((self.config.typeData != "%") ? parseSuff(d.value) : parsePercent(d.value));});

			var barUpdate = g.transition()
				.duration(transitionDuration);

			
			var t = this.body.transition().duration(transitionDuration);
			barUpdate.select("rect")
				.attr("class", function(d){return (d.value < 0) ? "bar negative" : "bar positive";})
		  		.attr("x", function(d){return x(Math.min(0, d.value));})
		  		.attr("y", function(d){return y(d.name);})
		  		.attr("width", function(d){return ((d.value == 0) && (self.zeroNull)) ? 30 : Math.abs(x(d.value) - x(0));})
		  		.attr("height", y.rangeBand());

		  	barUpdate.select("text")
				.attr("x", function(d){ return ((d.value == 0) && (self.zeroNull)) ? 36 :  x(d.value);})
				.attr("y", function(d){return y(d.name)+y.rangeBand()/2;})
		  		.attr("dy", ".35em")
				.attr("dx", function(d){return (d.value < 0) ? ".5em" : "-0.5em";})
				.style("text-anchor", function(d){return (d.value < 0) ? "start" : "end";})
				.style("opacity", function(d){d.w = this.getComputedTextLength();
					return ((d.value == 0) && (self.zeroNull)) ? 1 : ((Math.abs(x(d.value) - x(0)) - 8 > d.w) ? 1: 0);});

		  	t.select(".x.axis")
		  		.call(xAxis);

		  	t.select(".y.axis line")
		  		.attr("x1", x(0))
		  		.attr("x2", x(0));

		  	if(this.legend != "none"){
  			  	t.selectAll(".legend text")
  					.text(function(d, i){return dataInfo[i].label});
		  	}

		  	if(dataTitle != undefined){

		  		this.title = dataTitle;
				var title = this.body.select("g.hbar-title");

				title.select("text")
					.text(this.title)
					.each(cutLongTitle);

			}


		}

		//función auxiliar, que según anchura de contenedor y palabra,
		//recorta y añade puntos suspensivos en caso de que la palabra 
		//supere en anchura al contenedor
		function cutLongTitle(){
			if(this.getComputedTextLength() > self.width){
				var csize = Math.ceil(this.getComputedTextLength()/self.title.length);
				var c = Math.floor(self.width / csize) - 3;
				var words = self.title.split(" ");
				var word = words[0];
				for(var w = 1; w < words.length; w++){
					if((word.length + words[w].length + 1) > c){
						word += "..."
						break;
					} else {
						word += " " + words[w];
					}
				}
				d3.select(this).text(word);
			}

		}
	}
	
	// initialization
	this.configure(configuration);
}

/***************************************************************/
/*                          Objeto Legend                      */
/***************************************************************/
function Legend(placeholderName, configuration)
{
	this.placeholderName = placeholderName;
	
	var self = this;  // para tener referencia al objeto en funciones internas de d3

	var color = function(c){return configuration.colors[c];};

	//método configure, que da valor a las propiedades del gráfico
	this.configure = function(configuration)
	{
		this.config = configuration;
		
		this.margin = configuration.margin;
		this.width = this.config.width - this.config.margin.right - this.config.margin.left;
		this.height = this.config.height - this.config.margin.top - this.config.margin.bottom;
		this.orientation = configuration.orientation;
		this.data = configuration.data;

		this.config.transitionDuration = configuration.transitionDuration || 750; //duración de la transición, por defecto medio segundo
	}

	//método draw, que crea e instancia el gráfico dados los datos configurados inicialmente
	this.draw = function()
	{
		this.body = d3.select("#" + this.placeholderName).append("svg")
			.attr("class", "legend") //con clase legend
			.attr("width", this.width + this.margin.right + this.margin.left)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
		  .append("g")
		  	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");


		var legendLines = this.body.selectAll(".legend_line")
			.data(this.data)
		  .enter().append("g")
		  	.attr("class", "legend_line")
		  	.attr("transform", function(d,i){return "translate(0," + (i*30) + ")";});

		legendLines.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 40)
			.attr("height", 20)
			.style("fill", function(d,i){return color(i);});

		legendLines.append("text")
			.attr("x", 50)
			.attr("y", 0)
			.attr("dy", "1em")
			.text(function(d){return d.label;});

		var shifts = [];
		legendLines.selectAll("text")
			.each(function(d){
				shifts.push(this.getComputedTextLength()+70);
			});

		if(this.orientation == "horizontal"){
			var gsToMove = legendLines.filter(function(d,i){return i > 0;});
			var acum = 0;
			gsToMove.attr("transform", function(d,i){
				var current = shifts[i] + acum;
				acum += shifts[i];
				return "translate(" + (current) + ",0)";
			});
			
			d3.select("#" + this.placeholderName)
				.select("svg")
				.attr("width", d3.sum(shifts) + this.margin.right + this.margin.left);

		} else {
			d3.select("#" + this.placeholderName)
				.select("svg")
				.attr("width", d3.max(shifts) + this.margin.right + this.margin.left);
		}

		//método redraw, que actualiza el gráfico dados nuevos datos
		this.redraw = function(dataInfo, transitionDuration){
			transitionDuration = undefined != transitionDuration ? transitionDuration : this.config.transitionDuration;
			this.data = dataInfo;
			
			var lines = this.body.selectAll(".legend_line")
				.data(this.data, function(d){return d.name;});

			lines.exit().remove(); //Se borran líneas que no se encuentren en this.data

			var gLines = lines.enter().append("g")
				.attr("class", "legend_line")
			  	.attr("transform", function(d,i){return "translate(0," + (i*30) + ")";})
			  	.style("opacity", 0);

			gLines.append("rect")
				.attr("x", 0)
				.attr("y", 0)
				.attr("width", 40)
				.attr("height", 20)
				.style("fill", function(d,i){return color(i);});

			gLines.append("text")
				.attr("x", 50)
				.attr("y", 0)
				.attr("dy", "1em");

			lines.select("text")
					.text(function(d){ return d.label;});
		
			var shifts = [];
			lines.selectAll("text").transition().delay(1000)
				.each(function(d){
					if(this.getComputedTextLength() > 0){
						shifts.push(this.getComputedTextLength()+70);
					} else { //longitud de texto computado = 0, aunque haya texto
						shifts.push(stringWidth(this.textContent)+70);
					}
					
				});

  			if(this.orientation == "horizontal"){
				
				var gsToMove = lines.filter(function(d,i){return i > 0;}).transition().duration(transitionDuration);
				var acum = 0;

				gsToMove.attr("transform", function(d,i){
					var current = shifts[i] + acum;
					acum += shifts[i];
					return "translate(" + (current) + ",0)";
				}).each("end",function() {
					d3.select(this)
						.transition()
						.style("opacity",1);
				});
				

				d3.select("#" + this.placeholderName)
					.select("svg")
					.attr("width", d3.sum(shifts) + this.margin.right + this.margin.left);
			} else { //vertical
	  			d3.select("#" + this.placeholderName)
					.select("svg")
					.attr("width", d3.max(shifts) + this.margin.right + this.margin.left);
			}
		}
	}
	
	//función auxiliar que devuelve la anchura en px para una determinada
	//cadena de texto y un determinado tipo de fuente
	function stringWidth(cad, font){
	    font = font != undefined ? font : '16px "Open Sans"';
	    var div = document.createElement('div');
	    div.textContent = cad;
	    div.setAttribute('style', 'position: absolute; float: left; white-space: nowrap; visibility: hidden; font: ' + font);
	    document.body.appendChild(div);
	    var width = div.offsetWidth;
	    document.body.removeChild(div);
	    return width;
	}

	// initialization
	this.configure(configuration);
}

/***************************************************************/
/*                          Objeto Treemap                     */
/***************************************************************/
function Treemap(placeholderName, configuration)
{
	this.placeholderName = placeholderName;
	
	var self = this;  // para tener referencia al objeto en funciones internas de d3

	var parse2Dec = esLocale.numberFormat(",.0f"),
		parseSuff = function(s){return parse2Dec(s)+"€"};

	//método configure, que da valor a las propiedades del gráfico
	this.configure = function(configuration)
	{
		this.config = configuration;
		
		this.margin = configuration.margin;
		this.width = this.config.width - this.config.margin.right - this.config.margin.left;
		this.height = this.config.height - this.config.margin.top - this.config.margin.bottom;

		this.fileName = configuration.fileName;
		this.targetColumn = configuration.targetColumn;
		this.thumbnailNames = configuration.thumbnailNames;
		this.thumbHeadNames = configuration.thumbHeadNames;

		this.thumbMargin = {
			top: this.margin.top/(this.thumbnailNames.length),
			right: this.margin.right/(this.thumbnailNames.length), 
			bottom: this.margin.bottom/(this.thumbnailNames.length), 
			left: this.margin.left/(this.thumbnailNames.length)
		};
		this.thumbWidth = this.width / (this.thumbnailNames.length);
		this.thumbHeight = this.height / (this.thumbnailNames.length);
		this.thumbsContainer = d3.select("#" + configuration.thumbsContainer);

		this.abbrs = configuration.abbrs;

		this.config.transitionDuration = configuration.transitionDuration || 750; //duración de la transición, por defecto medio segundo
	}

	//método draw, que crea e instancia el gráfico dados los datos configurados inicialmente
	this.draw = function()
	{
		var color = function(c){
			return ["#aec7e8", "#ffbb78", "#98df8a", "#ff9896", "#c5b0d5", "#c49c94", "#f7b6d2", "#c7c7c7", "#dbdb8d", "#9edae5"][c];
		}

		var old_color = d3.scale.category10(),
			x = d3.scale.linear().range([0, this.width]),
			y = d3.scale.linear().range([0, this.height]),
			tx = d3.scale.linear().range([0, this.thumbWidth]),
			ty = d3.scale.linear().range([0, this.thumbHeight]),
			root,
			node,
			tRoot;

		var treemap = d3.layout.treemap()
			.round(false)
			.size([this.width, this.height])
			.sticky(true)
			.value(function(d){return d.size});

		var thumbTreemap = d3.layout.treemap()
			.round(false)
			.size([this.thumbWidth, this.thumbHeight])
			.sticky(true)
			.value(function(d){return d.size});


		this.body = d3.select("#" + this.placeholderName)
			.style("width", (this.width + this.margin.right + this.margin.left) + "px")
			.style("height", (this.height + this.margin.top + this.margin.bottom) + "px")
		  .append("svg")
		  	.attr("class", "treemap")
		  	.attr("width", this.width + this.margin.right + this.margin.left)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
		  .append("g")
		  	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.tooltip = d3.select("#" + this.placeholderName)
		  .append("div")
		    .attr("class", "tooltip")
			.style("opacity", 0);

		this.thumbs = [];
		this.titleThumbs = []; 
		for(var i = 0; i < this.thumbnailNames.length; i++){
			this.thumbs[i] = d3.select("#" + this.thumbnailNames[i])
				  .attr("width", this.thumbWidth + this.thumbMargin.right + this.thumbMargin.left)
				  .attr("height", this.thumbHeight + this.thumbMargin.top + this.thumbMargin.bottom)
				.append("svg")
					.attr("class", "thumb-treemap")
					.attr("width", this.thumbWidth + this.thumbMargin.right + this.thumbMargin.left)
					.attr("height", this.thumbHeight + this.thumbMargin.top + this.thumbMargin.bottom)
				  .append("g")
				  	.attr("transform", "translate(" + this.thumbMargin.left + "," + this.thumbMargin.top + ")")
				  	.style("opacity", "0");
			
			this.titleThumbs[i] = d3.select("#" + this.thumbHeadNames[i])
				  .attr("width", this.thumbWidth + this.thumbMargin.right + this.thumbMargin.left)
				  .attr("height", this.thumbHeight + this.thumbMargin.top + this.thumbMargin.bottom)
				.append("svg")
				  .attr("class", "thumb-header")
				  .attr("width", this.thumbWidth + this.thumbMargin.right + this.thumbMargin.left)
				  .attr("height", 20)
				.append("text")
					.attr("x", 0)
					.attr("y", 0)
					.attr("dy", "1em")
					.style("text-anchor", "start")
					// .style("font-size", "12px")
					.style("font-weight", "bold")
					.text("hola");
		
		}

		d3.csv(this.fileName, type, function(error, csvData){
			var empty = csvData.every(function(e,i,a){return e.size == 0.0;});
			var noDataInfo = self.body.append("text")
				.attr("class", "no-data")
			    .text("NO EXISTEN DATOS")
			    .attr("x", self.width/2)
			    .attr("y", self.height/2)
			    .style("text-anchor", "middle")
			    .style("font-weight", "bold")
			    .style("opacity", "0");

		 	try {
		 		node = root = csvToTree(csvData);
			} finally {
				if((error != null) || (root.children.length == 0)){
					noDataInfo.style("opacity", "1");
				} else {
					noDataInfo.style("opacity", "0");
				}
			}

		 	tRoot = csvToTree(csvData);
		    var nodes = treemap.nodes(root)
		    	.filter(function(d){ return (d.parent == root);});

		    var cell = self.body.selectAll("g")
		    	.data(nodes)
		      .enter().append("g")
		      	.attr("class", "cell")
		    	.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
		    	.on("click", function(d){ return d.children ? zoomIn(d) : null;})
		    	.on("mouseover", mouseOver)
			   	.on("mousemove", mouseMove)
			    .on("mouseout", mouseOut);

			

		    cell.append("rect")
		    	.attr("width", function(d){return d.dx-1;})
		    	.attr("height", function(d){return d.dy-1;})
		    	.style("fill", function(d){return color(d.id[0]);})
		    	.style("stroke", "white")
		    	.style("stroke-width", "1px");

		    cell.append("text")
		    	.attr("x", function(d){return d.dx / 2;})
		    	.attr("y", function(d){return d.dy / 2;})
		    	.attr("dy", ".35em")
		    	.attr("text-anchor", "middle")
		    	.text(function(d){return d.id + ". " + (d.abbr != undefined ? d.abbr : d.cuenta);})
		    	.style("font-size", "11px")
		    	.style("opacity", function(d){d.w = this.getComputedTextLength(); return (d.dx > d.w) ? 1: 0;});

		    firstThumbnail();

		});
	
		//método redraw, que actualiza el gráfico dados nuevos datos
		this.redraw = function(fileName, targetColumn){

			this.fileName = fileName;
			this.targetColumn = targetColumn;

			d3.csv(this.fileName, type, function(error, csvData){
				self.body.select("text.no-data").remove();
				var noDataInfo = self.body.append("text")
				.attr("class", "no-data")
			    .text("NO EXISTEN DATOS")
			    .attr("x", self.width/2)
			    .attr("y", self.height/2)
			    .style("text-anchor", "middle")
			    .style("font-weight", "bold")
			    .style("opacity", "0");

			    try{
					root = node = csvToTree(csvData);
			    } finally{
					if((error != null) || (root.children.length == 0)){
						noDataInfo.style("opacity", "1");
					} else {
						noDataInfo.style("opacity", "0");
					}
			    }

				tRoot = csvToTree(csvData);
				treemap = d3.layout.treemap()
					.round(false)
					.size([self.width, self.height])
					.sticky(true)
					.value(function(d){return d.size});

				updateThumbnails();

				var nodes = treemap.nodes(root)
					.filter(function(d){ return (d.parent == root);});


				var cells = self.body.selectAll("g.cell")
					.data(nodes, function(d){return d.id;});

			    cells.exit().remove(); //Se eliminan datos

			    cells.select("text") //Se actualizan datos
					.attr("x", function(d){return d.dx / 2;})
					.attr("y", function(d){return d.dy / 2;})
					.attr("dy", ".35em")
					.attr("text-anchor", "middle")
					.text(function(d){return d.id + ". " + (d.abbr != undefined ? d.abbr : d.cuenta);})
					.style("font-size", "11px")
					.style("opacity", function(d){d.w = this.getComputedTextLength(); return (d.dx > d.w) ? 1: 0;});

			    var newCells  = cells.enter().append("g") //Se añaden nuevos datos
			    	.attr("class", "cell")
			    	.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
			    	.on("click", function(d){ return d.children ? zoomIn(d) : null;})
			    	.on("mouseover", mouseOver)
			    	.on("mousemove", mouseMove)
			    	.on("mouseout", mouseOut);

			    
			    newCells.append("rect")
			    	.attr("width", function(d){return d.dx-1;})
			    	.attr("height", function(d){return d.dy-1;})
			    	.style("fill", function(d){return color(d.id[0]);})
			    	.style("stroke", "white")
			    	.style("stroke-width", "1px");

			    newCells.append("text")
			    	.attr("x", function(d){return d.dx / 2;})
			    	.attr("y", function(d){return d.dy / 2;})
			    	.attr("dy", ".35em")
			    	.attr("text-anchor", "middle")
			    	.text(function(d){return d.id + ". " + (d.abbr != undefined ? d.abbr : d.cuenta);})
			    	.style("font-size", "11px")
			    	.style("opacity", function(d){d.w = this.getComputedTextLength(); return (d.dx > d.w) ? 1: 0;});

				zoomOut(root);
			});
		}

		//función que se ejecuta al pasar el ratón sobre una de areas del treemap,
		//dibujando y posicionando un tooltip con información
		function mouseOver(d, i){
			var coords = d3.mouse(self.body[0][0]);
			var id = (d.id.length <= 3) ? d.id : (d.id.slice(0,3) + "." + d.id.slice(3));
			self.tooltip.transition()
				.duration(200)      
		        .style("opacity", .9)
		        .style("background-color", color(d.id[0]));      
		    self.tooltip .html("<b>" + id + " - " + d.cuenta + "</b><br/>"  + parseSuff(d.size))  
		        .style("left", coords[0] + "px")     
		        .style("top", coords[1] + "px");

		}

		//función que se ejecuta al mover el ratón sobre una de areas del treemap,
		//reposicionando el tooltip con información correspondiente
		function mouseMove(d, i){
			var coords = d3.mouse(self.body[0][0]);
        	self.tooltip.style("left", coords[0] + "px")     
               .style("top", coords[1] + "px");
		}                 
		
		//función que se ejecuta al salir el ratón de una de areas del treemap,
		//haciendo desaparecer el tooltip con información
		function mouseOut(d, i) {       
            self.tooltip.transition()        
                .duration(500)      
                .style("opacity", 0);   
        }

        //función que actualiza el treemap haciendo visible el nodo target
		//y sus descendientes teniendo en cuenta que se viene de la visualización
		// de un nodo de nivel inferior.
		function zoomOut(target){
			for(var i = 0; i < self.thumbs.length; i++){
				if(i+1 > target.depth){
					self.thumbs[i].transition().duration(self.config.transitionDuration).style("opacity", "0");
					self.titleThumbs[i].transition().duration(self.config.transitionDuration).style("opacity", "0");
				}
			}

			if(target.depth == 0){
				

				self.thumbsContainer.transition()
					.style("opacity", "0")
					.each("end",function() {
						d3.select(this)
							.transition()
							.duration(self.config.transitionDuration)
							.style("display", "none")
					});
			}
			var kx = self.width / target.dx, ky = self.height / target.dy;
			var nodes = treemap.nodes(root)
		    	.filter(function(d){ return  ((d.id[0] == target.id[0])&&(d.id.length <= target.id.length)) || (d.parent == root) || (d.parent == target);});

			x.domain([target.x, target.x + target.dx]);
			y.domain([target.y, target.y + target.dy]);

			var newCells = self.body.selectAll("g.cell")
				.data(nodes, function(d){return d.id;});
			  
			newCells.exit().remove();

			var t = self.body.selectAll("g.cell").transition()
				.duration(self.config.transitionDuration)
				.attr("transform", function(d){return "translate(" + x(d.x) + "," + y(d.y) + ")";});

			t.select("rect")
				.attr("width", function(d){return kx * d.dx - 1;})
				.attr("height", function(d){return ky * d.dy - 1;})

			t.select("text")
				.attr("x", function(d){return kx * d.dx / 2;})
				.attr("y", function(d){return ky * d.dy / 2;})
				.text(function(d){return d.id + ". " + (d.abbr != undefined ? d.abbr : d.cuenta);})
				.style("opacity", function(d){return kx * d.dx > d.w ? 1 : 0;});

			node = target;
			if(d3.event) d3.event.stopPropagation();

		}

		//función que actualiza el treemap haciendo visible el nodo target
		//y sus descendientes teniendo en cuenta que se viene de la visualización
		// de un nodo de nivel superior.
		function zoomIn(target){
			
			var kx = self.width / target.dx, ky = self.height / target.dy;
			var nodes = treemap.nodes(root)
		    	.filter(function(d){ return (d.parent == target);});


			x.domain([target.x, target.x + target.dx]);
			y.domain([target.y, target.y + target.dy]);

			var newCells = self.body.selectAll("g.cell")
				.data(nodes, function(d){return d.id;})

			newCells.enter().append("g")
		      	.attr("class", "cell")
		    	.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
		    	.on("click", function(d){ return d.children ? zoomIn(d) : null;})
		    	.on("mouseover", mouseOver)
			    .on("mousemove", mouseMove)
			    .on("mouseout", mouseOut);


		    newCells.append("rect")
		    	.attr("width", function(d){return d.dx-1;})
		    	.attr("height", function(d){return d.dy-1;})
		    	.style("fill", function(d){return color(d.id[0]) ;})
		    	.style("stroke", "white")
		    	.transition().duration(self.config.transitionDuration)
		    	.style("stroke-width", "1px");

		    newCells.append("text")
		    	.attr("x", function(d){return d.dx / 2;})
		    	.attr("y", function(d){return d.dy / 2;})
		    	.attr("dy", ".35em")
		    	.attr("text-anchor", "middle")
		    	.text(function(d){
		    		var id = (d.id.length <= 3) ? d.id : (d.id.slice(0,3) + "." + d.id.slice(3));
		    		return id + ". " + (d.abbr != undefined ? d.abbr : d.cuenta);
		    	})
		    	.style("opacity", 0)
		    	.style("font-size", "11px")
		    	.transition().duration(self.config.transitionDuration)
		    	.style("opacity", function(d){d.w = this.getComputedTextLength(); return (d.dx > d.w) ? 1: 0;});

			var t = self.body.selectAll("g.cell").transition()
				.duration(self.config.transitionDuration)
				.attr("transform", function(d){return "translate(" + x(d.x) + "," + y(d.y) + ")";});

			t.select("rect")
				.attr("width", function(d){return kx * d.dx - 1;})
				.attr("height", function(d){return ky * d.dy - 1;})

			t.select("text")
				.attr("x", function(d){return kx * d.dx / 2;})
				.attr("y", function(d){return ky * d.dy / 2;})
				.style("opacity", function(d){return kx * d.dx > d.w ? 1 : 0;});

			

			node = target;

			
			if(target.depth == 1){
				var displayContainer = self.thumbsContainer.style("display");
				var w = self.thumbsContainer.style("width");
				self.thumbsContainer.transition()
					.duration(0)
					.style("width", "0px")
					.style("opacity", "0")
					.each("end",function() {
						d3.select(this)
							.transition()
							.style("display", "inline-block")
							.style("opacity", 1)
							.duration(self.config.transitionDuration)
							.style("width", w)
							.each("end", function(){
								if(displayContainer){
									refreshThumbnail(target); //para el caso de profundidad 1 debe estar sincronizado para que cuente la anchura
									self.thumbs[0].style("opacity", "1");
									self.titleThumbs[0].style("opacity", "1");
								}
							});
					});
			}

			for(var i = 0; i < self.thumbs.length; i++){
				if(i < target.depth){
					if((target.depth != 1) || (self.thumbsContainer.style("display") != "none")){
						self.thumbs[i].transition().duration(self.config.transitionDuration).style("opacity", "1");
						self.titleThumbs[i].transition().duration(self.config.transitionDuration).style("opacity", "1");
						if(i+1 == target.depth){refreshThumbnail(target);}
					}
				} else {
					self.thumbs[i].transition().duration(self.config.transitionDuration).style("opacity", "0");
					self.titleThumbs[i].transition().duration(self.config.transitionDuration).style("opacity", "0");
				}
			}

			
			if(d3.event) d3.event.stopPropagation();

		}

		//función que inicializa los thumbnails
		function firstThumbnail(){
			var tnodes = thumbTreemap.nodes(tRoot)
		    	.filter(function(d){ return (d.parent == tRoot);});

			for(var th = 0; th < self.thumbs.length; th++){
				var tcell = self.thumbs[th].selectAll("g")
			    	.data(tnodes)
			      .enter().append("g")
			      	.attr("class", "cell")
			    	.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
			    	.on("click", function(d){
			    		return zoomOut(root);
			    	});

			    tcell.append("rect")
			    	.attr("width", function(d){return d.dx-1;})
			    	.attr("height", function(d){return d.dy-1;})
			    	.style("fill", function(d){return color(d.id[0]);})
			    	.style("opacity", "1")
			    	.style("stroke", "white")
			    	.style("stroke-width", "1px");
			}
		    
		}

		//función que actualiza valor de los thumbnails según la profundidad 
		//del nodo pasado como pasado como parámetro
		function refreshThumbnail(target){

			self.titleThumbs[target.depth-1]
				.text( target.id + ". " + (target.abbr != undefined ? target.abbr : target.cuenta))
				.each(cutLongTitle);

			if(target.depth > 1){
				var nodo = getNode(tRoot, target.parent.id);
				tIn(nodo, target.depth-1, target);
			} else {
				self.thumbs[target.depth-1].selectAll("rect")
					.style("opacity", function(d){return (d.id == target.id) ? 1 : 0.35;})
			}
		}

		//función auxiliar que actualiza valor de los thumbnails
		function updateThumbnails(){
			for(var th = 0; th < self.thumbs.length; th++){
				thumbTreemap = d3.layout.treemap()
					.round(false)
					.size([self.thumbWidth, self.thumbHeight])
					.sticky(true)
					.value(function(d){return d.size});

			 	var tnodes = thumbTreemap.nodes(tRoot)
			    	.filter(function(d){ return (d.parent == tRoot);});

			    var tcells = self.thumbs[th].selectAll("g.cell")
						.data(tnodes, function(d){return d.id;});

				tcells.exit().remove(); //Se eliminan datos

			    //Se crean nuevos datos
			    var newTcells = tcells.enter().append("g")
			    .attr("class", "cell")
			    .attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
			    .on("click", function(d){ return zoomOut(root);});

			    newTcells.append("rect")
			    	.attr("width", function(d){return d.dx-1;})
			    	.attr("height", function(d){return d.dy-1;})
			    	.style("fill", function(d){return color(d.id[0]);})
			    	.style("opacity", "1")
			    	.style("stroke", "white")
			    	.style("stroke-width", "1px");

			    tOut(tRoot, th);

			}
		 	

		}

		//función semejante a zoomOut para los thumbnails
		function tOut(target, thIndex){
			var kx = self.thumbWidth / target.dx, ky = self.thumbHeight / target.dy;
			var nodes = thumbTreemap.nodes(tRoot)
		    	.filter(function(d){ return  ((d.id[0] == target.id[0])&&(d.id.length <= target.id.length)) || (d.parent == tRoot) || (d.parent == target);});

			tx.domain([target.x, target.x + target.dx]);
			ty.domain([target.y, target.y + target.dy]);

			var newCells = self.thumbs[thIndex].selectAll("g.cell")
				.data(nodes, function(d){return d.id;});
			  
			newCells.exit().remove();

			var t = self.thumbs[thIndex].selectAll("g.cell").transition()
				.duration(self.config.transitionDuration)
				.attr("transform", function(d){return "translate(" + tx(d.x) + "," + ty(d.y) + ")";});

			t.select("rect")
				.attr("width", function(d){return kx * d.dx - 1;})
				.attr("height", function(d){return ky * d.dy - 1;})

			if(d3.event) d3.event.stopPropagation();

		}

		//función semejante a zoomIn para los thumbnails
		function tIn(target, thIndex, node){
			var rchildren = tRoot.children;
			self.thumbs[thIndex].selectAll("g.cell")
				.data(rchildren, function(d){return d.id;})
				.exit().remove();

			var kx = self.thumbWidth / target.dx, ky = self.thumbHeight / target.dy;

			var nodes =  target.children;
		    var parent = target.parent;
		    for (var p = parent.depth; p > 0; p--){
		    	nodes = nodes.concat(parent.children);
		    	parent = parent.parent;
		    }

			tx.domain([target.x, target.x + target.dx]);
			ty.domain([target.y, target.y + target.dy]);
	
			
			var newCells = self.thumbs[thIndex].selectAll("g.cell")
				.style("opacity", "0.35")
				.data(nodes, function(d){return d.id;});

			newCells.style("opacity", "0.35");
			
			newCells.enter().append("g")
		      	.attr("class", "cell")
		    	.attr("transform", function(d){return "translate(" + d.x + "," + d.y + ")";})
		    	.on("click", function(d){ return zoomOut(node.parent);});


		    newCells.append("rect")
		    	.attr("width", function(d){return d.dx-1;})
		    	.attr("height", function(d){return d.dy-1;})
		    	.style("fill", function(d){return color(d.id[0]) ;})
		    	.style("stroke", "white")
		    	.style("opacity", function(d){return (d.id == node.id) ? 1 : 0.35;})
		    	.transition().duration(self.config.transitionDuration)
		    	.style("stroke-width", "1px");


			var t = self.thumbs[thIndex].selectAll("g.cell").transition()
				.duration(self.config.transitionDuration)
				.attr("transform", function(d){return "translate(" + tx(d.x) + "," + ty(d.y) + ")";});

			t.select("rect")
				.attr("width", function(d){return kx * d.dx - 1;})
				.attr("height", function(d){return ky * d.dy - 1;});

			
			if(d3.event) d3.event.stopPropagation();

		}
		
		//función auxiliar que devuelve el objeto nodo, 
		//dado su identificador pasado como parámetro
		//y el nodo raiz correspondiente.
		function getNode(raiz, idNode){
			var node; 
			var r = raiz.children;
			for(var i = 0; i < idNode.length; i++){
				r.forEach(function(e1, i1, a1){
					if(e1.id[i] == idNode[i]){
						node = e1;
						r = !e1.children ? null : e1.children;
					}
				});
				if(r == null){break;}
			}

			return node;

		}

		//función auxiliar, que según anchura de contenedor y palabra,
		//recorta y añade puntos suspensivos en caso de que la palabra 
		//supere en anchura al contenedor
		function cutLongTitle(){
			if(this.getComputedTextLength() > self.thumbWidth){
				var csize = Math.ceil(this.getComputedTextLength()/this.textContent.length);
				var c = Math.floor(self.thumbWidth / csize) - 3;
				var words = this.textContent.split(" ");
				var word = words[0];
				for(var w = 1; w < words.length; w++){
					if((word.length + words[w].length + 1) > c){
						word += "..."
						break;
					} else {
						word += " " + words[w];
					}
				}
				d3.select(this).text(word);
			}

		}

		//función auxiliar que filtra las rows del fichero CSV que se ha leído
		function type(d){
			if(typeof self.targetColumn == 'string'){ //un único campo
				d.size = +d[self.targetColumn];
			} else { //lista de campos, size = SUM(fields)
				d.size = 0.0;
				self.targetColumn.forEach(function(e,ind,arr){d.size += +d[e];});
			}

			if(d.id.length > 3){d.id = d.id.replace(".","");}

			if((self.abbrs == null) || !(d.cuenta in self.abbrs)){ //Bien no existen abreviaciones o para esta cuenta no existe
				d.abbr = undefined;
			} else {
				d.abbr = self.abbrs[d.cuenta];
			}
			return d;
		}
	
		//función auxiliar que transforma la estructura del CSV leído con D3 
		//en un objeto anidado tipo árbol, adecuado para el layout treemap de D3
		function csvToTree(csvInfo){
			
			var csvUseful = csvInfo.filter(function(d){return d.size > 0;});

			var a1 = csvUseful.filter(function(d){return d.id.length == 1;});
		    for(var i = 0; i < a1.length; i++){
		    	var a2 = csvUseful.filter(function(d){return (d.id.length == 2) && (d.id.substr(0,1) == a1[i].id);});
		    	if(a2.length > 0){
		        	a1[i].children = a2; 
		         	for(var j = 0; j < a2.length; j++){
		           		var a3 = csvUseful.filter(function(d){return (d.id.length == 3) && (d.id.substr(0,2) == a2[j].id);});
		           		if(a3.length > 0){
		             		a1[i].children[j].children = a3; 
		             		for(var k = 0; k < a3.length; k++){
		               			var a5 = csvUseful.filter(function(d){return (d.id.length == 5) && (d.id.substr(0,3) == a3[k].id);});
		               			if(a5.length > 0){
		                 			a1[i].children[j].children[k].children = a5; 
		               			}
		             		}
		           		}
		         	}
		       	}
		    }
		    
		    var treeData = {"id":"root", "children":a1};
		    return treeData;
		}
	}

	// initialization
	this.configure(configuration);
}

/***************************************************************/
/*                        Objeto AreaCircle                    */
/***************************************************************/
function AreaCircle(placeholderName, configuration)
{
	this.placeholderName = placeholderName;
	
	var self = this;  // para tener referencia al objeto en funciones internas de d3

	var parse2Dec = esLocale.numberFormat(",." + configuration.dec + "f"),
		parseSuff = function(s){return parse2Dec(s)+configuration.typeData},
		parsePercent = d3.format("." + configuration.dec + "%");
	var color = function(c){return configuration.colors[c];};

	//método configure, que da valor a las propiedades del gráfico
	this.configure = function(configuration)
	{
		this.config = configuration;
		
		this.margin = configuration.margin;
		this.width = this.config.width - this.config.margin.right - this.config.margin.left;
		this.height = this.config.height - this.config.margin.top - this.config.margin.bottom;

		this.data = configuration.data;
		this.orientation = configuration.orientation;
		this.tooltipOffset = configuration.tooltipOffset;
		this.circleMaxWidth = this.width / this.data.length;
		this.config.transitionDuration = configuration.transitionDuration || 750; //duración de la transición, por defecto medio segundo
	}

	//método draw, que crea e instancia el gráfico dados los datos configurados inicialmente
	this.draw = function()
	{
		
		var diam = d3.scale.linear().range([0, this.circleMaxWidth]);

		this.body = d3.select("#" + this.placeholderName).append("svg")
			.attr("class", "areaCircle") //con clase areaCircle
			.attr("width", this.width + this.margin.right + this.margin.left)
			.attr("height", this.height + this.margin.top + this.margin.bottom)
		  .append("g")
		  	.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

		this.tooltip = d3.select("#" + this.placeholderName).append("div")
		    .attr("class", "tooltip")
			.style("opacity", 0)
			.style("left", this.tooltipOffset+"px");

		var limit = d3.max(this.data, function(d){return d.value;});
		diam.domain([0,limit]);


		var circles = this.body.selectAll(".circle")
			.data(this.data)
		  .enter().append("g")
		  	.attr("class", "circle")
		  	.attr("transform", function(d, i){return "translate(" + (self.circleMaxWidth*i) + ", 0)";});

		circles.append("circle")
			.attr("class", function(d){return (d.value > 0) ? "circle positive" : "circle null";})
		  	.attr("cx", this.circleMaxWidth/2)
		  	.attr("cy", this.circleMaxWidth/2)
		  	.attr("r", function(d){ return diam(d.value)/2;})
		  	.style("fill", function(d, i){return color(i);})
			.on("mouseover", function(d,i){return (d.value > 0) ? mouseOver(d,i) : null;})
			.on("mousemove", function(d,i){return (d.value > 0) ? mouseMove(d,i) : null;})
			.on("mouseout", function(d,i){return (d.value > 0) ? mouseOut(d,i) : null;});


		circles.append("text")
			.attr("class", function(d){return (d.value > 0) ? "text positive" : "text null";})
			.attr("x", this.circleMaxWidth/2)
			.attr("y", this.circleMaxWidth/2)
			.attr("dy", ".35em")
			.style("text-anchor", "middle")
			.style("stroke-width", "2px")
			.text("S/D");

		


		//método redraw, que actualiza el gráfico dados nuevos datos
		this.redraw = function(dataInfo, transitionDuration){
			transitionDuration = undefined != transitionDuration ? transitionDuration : this.config.transitionDuration;
			this.data = dataInfo;
			this.circleMaxWidth = this.width / this.data.length;

			var limit = d3.max(this.data, function(d){return d.value;});
			
			diam.domain([0, limit]);
			

			var g = this.body.selectAll("g.circle")
				.data(this.data, function(d){ return d.name});

			var cs = g.enter().append("g")
			  	.attr("class", "circle")
			  	.attr("transform", function(d, i){ return "translate(" + (self.circleMaxWidth*i) + ", 0)";});

			cs.append("circle")
			  	.style("fill", function(d, i){return color(i);})
			  	.style("opacity",0)
				.on("mouseover", function(d,i){return (d.value > 0) ? mouseOver(d,i) : null;})
				.on("mousemove", function(d,i){return (d.value > 0) ? mouseMove(d,i) : null;})
				.on("mouseout", function(d,i){return (d.value > 0) ? mouseOut(d,i) : null;});


			cs.append("text")
				.attr("dy", ".35em")
				.style("text-anchor", "middle")
				.style("stroke-width", "2px")
				.text("S/D");

			g.exit().transition()
				.duration(transitionDuration)
				.style("opacity", 0)
				.remove();

			var circleUpdate = g.transition()
				.duration(transitionDuration)
				.attr("transform", function(d, i){return "translate(" + (self.circleMaxWidth*i) + ", 0)";});

			
			circleUpdate.select("circle")
				.attr("class", function(d){return (d.value > 0) ? "circle positive" : "circle null";})
				.attr("cx", this.circleMaxWidth/2)
			  	.attr("cy", this.circleMaxWidth/2)
		  		.attr("r", function(d){return (d.value > 0) ? diam(d.value)/2 : 18;})
		  		.style("opacity", 1);


		  	circleUpdate.select("text")
				.attr("class", function(d){return (d.value > 0) ? "text positive" : "text null";})
				.attr("x", this.circleMaxWidth/2)
				.attr("y", this.circleMaxWidth/2);



		}

		//función que se ejecuta al pasar el ratón sobre un cículo del AreaCircle,
		//dibujando y posicionando un tooltip con información
		function mouseOver(d, i){
			var coords = d3.mouse(self.body[0][0]);
			self.tooltip.transition()
				.duration(200)      
		        .style("opacity", .9)
		        .style("background-color", color(i));      
		    self.tooltip .html("<b>" +  parseSuff(d.value)+ "</b>")  
		        .style("left", (coords[0] + self.tooltipOffset) + "px")     
		        .style("top", coords[1] + "px");

		}

		//función que se ejecuta al mover el ratón sobre un cículo del AreaCircle,
		//reposicionando el tooltip con información correspondiente
		function mouseMove(d, i){
			var coords = d3.mouse(self.body[0][0]);
        	self.tooltip.style("left", (coords[0] + self.tooltipOffset) + "px")     
               .style("top", coords[1] + "px");
		}    

		//función que se ejecuta al salir el ratón de un cículo del AreaCircle,
		//haciendo desaparecer el tooltip con información	
		function mouseOut(d, i) {       
            self.tooltip.transition()        
                .duration(500)      
                .style("opacity", 0);   
        }
	}

	
	// initialization
	this.configure(configuration);
}

/***************************************************************/
/*                       Objeto ScatterPlot                    */
/***************************************************************/
function ScatterPlot(placeholderName, configuration)
{
	this.placeholderName = placeholderName;
	
	var self = this;  // para tener referencia al objeto en funciones internas de d3
	var parseDate = d3.time.format("%Y").parse;
	var color = function(c){return configuration.colors[c];};

	//método configure, que da valor a las propiedades del gráfico
	this.configure = function(configuration)
	{
		this.config = configuration;
		
		this.margin = configuration.margin;
		this.height = this.config.height - this.config.margin.top - this.config.margin.bottom;
		this.width = this.config.width - this.config.margin.left - this.config.margin.right;

		this.withLine = configuration.withLine;
		this.colorLine = configuration.colorLine;
		this.dataLine = [{'x': 0.0, 'y': 0.0},{'x': 0.0, 'y': 0.0}];

		this.data = configuration.data;
		this.labelX = configuration.labelX;
		this.labelY = configuration.labelY;
		this.legend = configuration.legend;
		this.ticks = configuration.ticks;
		this.dotRadius = configuration.dotRadius;

		this.config.transitionDuration = configuration.transitionDuration || 750; //duración de la transición, por defecto medio segundo
	}

	//método draw, que crea e instancia el gráfico dados los datos configurados inicialmente
	this.draw = function()
	{
		
		var x = d3.scale.linear() //escala lineal eje X
		    .range([0, this.width])
		    .domain(d3.extent(this.data, function(d) { return d.factorX; })).nice();;

		var y = d3.scale.linear() //escala lineal eje Y
		    .range([this.height, 0])
		    .domain(d3.extent(this.data, function(d) { return d.factorY; })).nice();;


		var line = d3.svg.line()
		    .x(function(d) { return x(d.x); })
		    .y(function(d) { return y(d.y); });   

		var xAxis = d3.svg.axis()
		    .scale(x)
		    .orient("bottom")
		    .ticks(this.ticks)
		    .tickFormat(esLocale.numberFormat(",.0d"));

		var yAxis = d3.svg.axis()
		    .scale(y)
		    .orient("left")
		    .ticks([this.ticks])
		    .tickFormat(esLocale.numberFormat(",.0d"));;

		this.body = d3.select("#" + this.placeholderName) //Se define la prop body, que es el SVG añadido al placeholder con id this.placeholderName
			.append("svg:svg") //se añade un svg
				.attr("class", "scatter-plot") //con clase line
				.attr("width", this.width + this.margin.left + this.margin.right)//se define su anchura
				.attr("height", this.height + this.margin.top + this.margin.bottom)//se define su altura
			.append("g") //Se añade un elemento G al SVG
				.attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")"); //Su punto de referencia esta en la esquina (top,left)

		this.tooltip = d3.select("#" + this.placeholderName)
		  .append("div")
		    .attr("class", "scatter-tooltip")
			.style("opacity", 0);
		
		this.body.append("g") //nuevo elemento g donde se integra el eje X
		      .attr("class", "x axis")
		      .attr("transform", "translate(0," + this.height + ")")
		      .call(xAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("x", this.width)
		      .attr("y", 50)
		      .style("text-anchor", "end")
		      .text(this.labelX);

		this.body.append("g") //nuevo elemento g donde se integra el eje Y
		      .attr("class", "y axis")
		      .call(yAxis)
		    .append("text")
		      .attr("class", "label")
		      .attr("transform", "rotate(-90)")
		      .attr("y", -80)//8)
		      .attr("dy", ".71em")
		      .style("text-anchor", "end")
		      .text(this.labelY);

		var grupos = this.data.map(function(d){return d.source;}).filter(function(d,i, s){return s.indexOf(d) == i;});
		this.body.append("g").attr("class", "gdots").selectAll(".dot")
		      .data(this.data)
		    .enter().append("circle")
		      .attr("class", "dot")
		      .attr("r", this.dotRadius)
		      .attr("cx", function(d) { return x(d.factorX); })
		      .attr("cy", function(d) { return y(d.factorY); })
		      .style("fill", function(d) { return color(grupos.indexOf(d.source)); })
		      .on("mouseover", mouseOver)
			  .on("mouseout", mouseOut);

		if(this.legend){ //Si legend es true se pinta la leyenda
	
			//atendiendo al dominio de la escala color se crean nuevos elementos g de clase leyenda
		    var legend = this.body.selectAll(".legend")
		        .data(grupos)
		      .enter().append("g")
		        .attr("class", "legend")
		        .attr("transform", function(d, i) {console.log(i); return "translate("+ (self.width+5) + "," + i * 20 + ")"; });
	
		    //Se añade elemento rect a g de clase leyenda
		    legend.append("rect")
		        .attr("class", "legend_rect")
		        .attr("width", 18)
		        .attr("height", 18)
		        .style("fill", function(d,i) { return color(i);});
	
		    //Se añade elemento text a g clase leyenda
		    legend.append("text")
		  	    .attr("class", "legend_text")
		        .attr("x", 20)
		        .attr("y", 9)
		        .attr("dy", ".35em")
		        .style("text-anchor", "start")
		        .text(function(d) { return d; });
	
		}

		if(this.withLine){
			
			this.body.append("g") //nuevo elemento g donde se integra la línea de tendencia
			 	.attr("class", 'gline')
			  .append("path").attr("class", "line")
			    .attr("d", line(this.dataLine))
			    .style("fill","none")
			    .style("stroke", this.colorLine)
			    .style("z-index", '100')
			    .style("stroke-width", "1.5px");
		}

		//método redraw, que actualiza el gráfico dados nuevos datos
		this.redraw = function(dataInfo, linePoints, labels, transitionDuration){
			transitionDuration = undefined != transitionDuration ? transitionDuration : this.config.transitionDuration;
			this.data = dataInfo;
			this.dataLine = linePoints;
			this.labelX = labels != undefined ? labels.x : this.labelX; 
			this.labelY = labels != undefined ? labels.y : this.labelY;

			grupos = this.data.map(function(d){return d.source;}).filter(function(d,i, s){return s.indexOf(d) == i;});

			x.domain(d3.extent(this.data, function(d) { return d.factorX; })).nice(); 
			y.domain(d3.extent(this.data, function(d) { return d.factorY; })).nice();
		
			// Selección de la sección en la que se quiere hacer cambios
			var g = this.body.transition();
			var points = this.body.select('.gdots').selectAll(".dot")
				.data(this.data);
			points.enter().append("circle")
			   	.attr("class", "dot")
			    .attr("r", this.dotRadius)
			    .attr("cx", function(d) { return x(d.factorX); })
			    .attr("cy", function(d) { return y(d.factorY); })
			    .style("fill", function(d) { return color(grupos.indexOf(d.source)); })
			    .on("mouseover", mouseOver)
			   	.on("mouseout", mouseOut);

			points.exit().remove();

			g.select(".x.axis") // actualizar eje x
			    .duration(transitionDuration)
			    .call(xAxis);
			g.select(".y.axis") // actualizar eje y
			    .duration(transitionDuration)
			    .call(yAxis);
			g.selectAll(".dot") //actualizar puntos
				.duration(transitionDuration)
				.attr("cx", function(d) { return x(d.factorX); })
		      	.attr("cy", function(d) { return y(d.factorY); })
		      	.style("fill", function(d) { return color(grupos.indexOf(d.source)); });

		    


			if(this.legend){
				var legends = this.body.selectAll(".legend")
				    .data(grupos);

				var legendNode = legends.enter().append("g")
				    .attr("class", "legend")
				    .attr("transform", function(d, i) { return "translate("+ (self.width+5) + "," + i * 20 + ")"; })
				    .style("opacity", 0);

				legendNode.append("rect")
					.attr("class", "legend_rect")
				    .attr("width", 18)
				    .attr("height", 18)
				    .style("fill", function(d,i) { return color(i);});

				legendNode.append("text")
					.attr("class", "legend_text")
				    .attr("x", 20)
				    .attr("y", 9)
				    .attr("dy", ".35em")
				    .style("text-anchor", "start")
				    .text(function(d) { return d; });

				legendNode.transition()
					.duration(transitionDuration)
					.style("opacity", 1);
				legends.exit().remove();

				g.select("legend")
		    		.attr("transform", function(d, i) { return "translate("+ (self.width+5) + "," + i * 20 + ")"; });
			}
			g.select(".x.axis text.label")
			  .duration(transitionDuration)
		      .text(this.labelX);
			g.select(".y.axis text.label")
			  .duration(transitionDuration)
		      .text(this.labelY);
		    if(this.withLine){
		    	if(this.dataLine.length > 0){	
				    g.select(".line")   
				        .duration(transitionDuration)
				        .style("opacity", 1)
				        .attr("d", line(linePoints));
		    	} else {
		    		g.select(".line")   
				        .duration(transitionDuration)
				        .style("opacity", 0);
		    	}
		    }

		} //fin de redraw

		//función que se ejecuta al mover el ratón sobre un punto del ScatterPlot,
		//reposicionando el tooltip con información correspondiente
		function mouseOver(d, i){
			var coords = d3.mouse(this);
			var xCoord = x(d.factorX) + self.margin.left; 
			var yCoord = y(d.factorY) + self.margin.top;
			self.tooltip.transition()
				.duration(200)      
		        .style("opacity", .9);      
		    self.tooltip .html("<b>" + d.name + "</b>")  
		        .style("left", xCoord + "px")     
		        .style("top", (yCoord-30) + "px");

		}                 
		
		//función que se ejecuta al salir el ratón de un punto del ScatterPlot,
		//haciendo desaparecer el tooltip con información
		function mouseOut(d, i) {       
            self.tooltip.transition()        
                .duration(500)      
                .style("opacity", 0);   
        }
	}
	
	
	// initialization
	this.configure(configuration);
}
