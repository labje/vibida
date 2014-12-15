# *-* coding: utf-8 *-*

import csv, sys, json, decimal

islas_keys = {
	"07001DD00":["07026AA00","07046AA00","07048AA00","07050AA00","07054AA00"], #Islas Baleares: Consejo Insular de Ibiza
	"07002DD00":["07001AA00","07003AA00","07004AA00","07005AA00","07006AA00","07007AA00","07008AA00","07009AA00","07010AA00","07011AA00","07012AA00","07013AA00","07014AA00","07016AA00","07017AA00","07018AA00","07019AA00","07020AA00","07021AA00","07022AA00","07025AA00","07027AA00","07028AA00","07029AA00","07030AA00","07031AA00","07033AA00","07034AA00","07035AA00","07036AA00","07038AA00","07039AA00","07040AA00","07041AA00","07042AA00","07043AA00","07044AA00","07045AA00","07047AA00","07049AA00","07051AA00","07053AA00","07055AA00","07056AA00","07057AA00","07058AA00","07059AA00","07060AA00","07061AA00","07062AA00","07063AA00","07065AA00","07901AA00"], #Islas Baleares: Consejo Insular de Mallorca
	"07003DD00":["07002AA00","07015AA00","07023AA00","07032AA00","07037AA00","07052AA00","07064AA00","07902AA00"], #Islas Baleares: Consejo Insular de Menorca
	"07004DD00":["07024AA00"], #Islas Baleares: Consejo Insular de Formentera?, no había info pero exsite diferenciado del de Ibiza esde 2007
	"35001DD00":["35003AA00","35007AA00","35014AA00","35015AA00","35017AA00","35030AA00"], #Las Palmas: Cabildo Insular de Fuerteventura
	"35002DD00":["35001AA00","35002AA00","35005AA00","35006AA00","35008AA00","35009AA00","35011AA00","35012AA00","35013AA00","35016AA00","35019AA00","35020AA00","35021AA00","35022AA00","35023AA00","35025AA00","35026AA00","35027AA00","35031AA00","35032AA00","35033AA00"], #Las Palmas: Cabildo Insular de Gran Canaria
	"35003DD00":["35004AA00","35010AA00","35018AA00","35024AA00","35028AA00","35029AA00","35034AA00"], #Las Palmas: Cabildo Insular de Lanzarote
	"38001DD00":["38002AA00","38003AA00","38021AA00","38036AA00","38049AA00","38050AA00"], #Santa Cruz de Tenerife: Cabildo Insular de La Gomera
	"38002DD00":["38013AA00","38048AA00","38901AA00"], #Santa Cruz de Tenerife: Cabildo Insular de El Hierro
	"38003DD00":["38007AA00","38008AA00","38009AA00","38014AA00","38016AA00","38024AA00","38027AA00","38029AA00","38030AA00","38033AA00","38037AA00","38045AA00","38047AA00","38053AA00"], #Santa Cruz de Tenerife: Cabildo Insular de La Palma
	"38004DD00":["38001AA00","38004AA00","38005AA00","38006AA00","38010AA00","38011AA00","38012AA00","38015AA00","38017AA00","38018AA00","38019AA00","38020AA00","38022AA00","38023AA00","38025AA00","38026AA00","38028AA00","38031AA00","38032AA00","38034AA00","38035AA00","38038AA00","38039AA00","38040AA00","38041AA00","38042AA00","38043AA00","38044AA00","38046AA00","38051AA00","38052AA00"]  #Santa Cruz de Tenerife: Cabildo Insular de Tenerife
}

services = ["15","161","162","165","17","23","31","32","33"]

def main(d1, js):
	csv1 = csv.DictReader(open(d1, "rb"), delimiter=",") #Clasificación por programa
	# csv2 = csv.DictReader(open(d2, "rb"), delimiter=",") #Gastos
	js1 = json.load(open(js)) #Población
	programa = {}
	# ingresos = {}
	# gastos = {}
	entidad = ""
	periodo = ""
	# g_entidad = ""
	# g_periodo = ""
	poblacion = 0

	for index, row in enumerate(csv1):
		if index == 0: 
			entidad = row["entidad"]
			periodo = row["periodo"]
		if row["id"] in services: #dentro de la info de servicio a recoger
			print row["id"]
			programa[row["id"]] = {"cuenta": row["cuenta"], "val": sum([float(row[e]) for e in row if row[e] != "" and e.startswith("Lenloc_context")])}
			print row["id"], programa[row["id"]]["val"]

	
	if periodo != str(js1["periodo"]):
		print "Error: Fichero JSON de poblacion de distinto periodo que el XBRL."
		sys.exit(0)

	if "DD00" in entidad: #Diputacion, sumar todas las poblaciones de provincia
		pre_islas = ["07","35", "38"]
		if entidad[:2] in pre_islas: #Se trata de islas, con cabildos y consejos insulares
			keys = islas_keys[entidad]
		else: #Diputación peninsular
			keys = [k for k in js1["datos"].keys() if k.startswith(entidad[:2])]
			
		for k in keys:
			poblacion += float(js1["datos"][k])
	else: 
		poblacion = float(js1["datos"][entidad])
	
	#print poblacion
	writer = csv.writer(open(periodo + "-" + entidad + "-serv.csv","wb"), delimiter=",")
	writer.writerow(["pre", "entidad", "periodo", "id", "servicio", "valor"])
	for i in services:
		data = programa[i]["val"]/poblacion
		writer.writerow(["SERV", entidad, periodo, i, programa[i]["cuenta"], "%.2f" % data])
	


if __name__ == '__main__':
	if len(sys.argv) < 3:
		print "Error: Se deben introducir 2 argumentos: python buildServiceCosts.py fichProg.csv poblacionPeriodo.json"
	else:
		main(sys.argv[1], sys.argv[2])

#python buildServiceCosts.py Liq2011\Liquidacion_2011_Ente_01002AA00_lenloc2-prog-cuentas-label_DATA_2.csv C:\Users\david\Dropbox\VIBIDA\info_poblacion_INE\pobmun11.json