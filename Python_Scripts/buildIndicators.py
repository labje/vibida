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

def main(d1, d2, js):
	csv1 = csv.DictReader(open(d1, "rb"), delimiter=",") #Ingresos
	csv2 = csv.DictReader(open(d2, "rb"), delimiter=",") #Gastos
	js1 = json.load(open(js))
	ingresos = {}
	gastos = {}
	i_entidad = ""
	i_periodo = ""
	g_entidad = ""
	g_periodo = ""
	poblacion = 0

	for index, row in enumerate(csv1):
		if index == 0: 
			i_entidad = row["entidad"]
			i_periodo = row["periodo"]
		if len(row["id"]) == 1 and row["Lenloc_context1"] != "": #Capitulo y campo de derechos no vacio
			ingresos[row["id"]] = float(row["Lenloc_context1"])
		elif len(row["id"]) == 1 and row["Lenloc_context1"] == "":
			ingresos[row["id"]] = 0.0

	for index, row in enumerate(csv2):
		if index == 0: 
			g_entidad = row["entidad"]
			g_periodo = row["periodo"]
		if len(row["id"]) == 1 and row["Lenloc_context1"] != "": #Capitulo y campo de derechos no vacio
			gastos[row["id"]] = float(row["Lenloc_context1"])
		elif len(row["id"]) == 1 and row["Lenloc_context1"] == "":
			gastos[row["id"]] = 0.0

	if i_entidad != g_entidad:
		print "Error: Ficheros XBRL de distinta entidad."
		sys.exit(0)
	elif i_periodo != g_periodo:
		print "Error: Ficheros XBRL de distinto periodo."
		sys.exit(0)
	elif i_periodo != str(js1["periodo"]):
		print "Error: Fichero JSON de poblacion de distinto periodo que los XBRL."
		sys.exit(0)

	if "DD00" in i_entidad: #Diputacion, sumar todas las poblaciones de provincia
		pre_islas = ["07","35", "38"]
		if i_entidad[:2] in pre_islas: #Se trata de islas, con cabildos y consejos insulares
			keys = islas_keys[i_entidad]
		else: #Diputación peninsular
			keys = [k for k in js1["datos"].keys() if k.startswith(i_entidad[:2])]
			
		for k in keys:
			poblacion += float(js1["datos"][k])
	else: 
		poblacion = float(js1["datos"][i_entidad])
	
	#print poblacion
	writer = csv.writer(open(i_periodo + "-" + i_entidad + "-indi.csv","wb"), delimiter=",")
	writer.writerow(["pre", "entidad", "periodo", "id", "indicador", "valor"])

	ind1 = (sum(ingresos.values()) - sum(gastos.values()))/poblacion 
	writer.writerow(["IND", i_entidad, i_periodo, 1, "Déficit/Superávit per cápita", "%.4f" % ind1])
	ingr = sum([ingresos[str(n)] for n in range(1,6)])
	gast = sum([gastos[str(n)] for n in range(1,5)]) + gastos["9"]
	ind2 = (ingr - gast)/poblacion
	writer.writerow(["IND", i_entidad, i_periodo, 2, "Ahorro neto per cápita", "%.4f" % ind2])
	gast = gastos["1"] + gastos["2"] + gastos["4"]
	ind3 = (ingr - gast)/poblacion
	writer.writerow(["IND", i_entidad, i_periodo, 3, "Ahorro bruto per cápita", "%.4f" % ind3])
	ingr = sum([ingresos[str(n)] for n in range(1,8)])
	gast = sum([gastos[str(n)] for n in range(1,5)]) + gastos["6"] + gastos["7"]
	ind4 = (ingr - gast)/poblacion
	writer.writerow(["IND", i_entidad, i_periodo, 4, "Elasticidad presupuestaria", "%.4f" % ind4])
	gast = sum(gastos.values())
	ind5 = gast/poblacion
	writer.writerow(["IND", i_entidad, i_periodo, 5, "Gasto público por habitante", "%.4f" % ind5])
	gast = gastos["6"] + gastos["7"]
	ind6 = gast/poblacion
	writer.writerow(["IND", i_entidad, i_periodo, 6, "Gasto de inversión per cápita", "%.4f" % ind6])
	ind7 = gastos["6"]/poblacion
	writer.writerow(["IND", i_entidad, i_periodo, 7, "Gasto de inversión directa per cápita", "%.4f" % ind7])
	ingr = sum([ingresos[str(n)] for n in range(1,4)])
	ind8 = ingr/poblacion
	writer.writerow(["IND", i_entidad, i_periodo, 8, "Presion fiscal", "%.4f" % ind8])
	ind9 = ingr/sum(ingresos.values())
	writer.writerow(["IND", i_entidad, i_periodo, 9, "Autonomía fiscal", "%.4f" % ind9])
	ind10 = ingresos["9"]/poblacion
	writer.writerow(["IND", i_entidad, i_periodo, 10, "Incremento de deuda per cápita", "%.4f" % ind10])
	#print ind1, ind2, ind3, ind4, ind5, ind6, ind7, ind8, ind9, ind10
	


if __name__ == '__main__':
	if len(sys.argv) < 4:
		print "Error: Se deben introducir 3 argumentos: python buildIndicators.py fichIngresos.csv fichGastos.csv poblacionPeriodo.json"
	else:
		main(sys.argv[1], sys.argv[2], sys.argv[3])

#python buildIndicators.py Liq2011\Liquidacion_2011_Ente_01002AA00_lenloc2-econ-ingr-cuentas-label_DATA_2.csv Liq2011\Liquidacion_2011_Ente_01002AA00_lenloc2-econ-gast-cuentas-label_DATA_2.csv C:\Users\david\Dropbox\VIBIDA\info_poblacion_INE\pobmun11.json