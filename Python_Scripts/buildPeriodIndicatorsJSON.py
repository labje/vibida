# *-* coding: utf-8 *-*

import csv, sys, math, json

def Q1(number_set):
	nset = sorted(number_set)
	
	if len(nset)%2 == 0: #nº de elementos par
		i = (len(nset)+1)/4
		return (nset[i-1] + nset[i])/2.0
	else: #nº de elementos impar
		i = (len(nset)+1)/4
		return nset[i-1]

def Q3(number_set):
	nset = sorted(number_set)

	if len(nset)%2 == 0: #nº de elementos par
		i = ((len(nset)+1)*3)/4
		return (nset[i-1] + nset[i])/2.0
	else: #nº de elementos impar
		i = ((len(nset)+1)*3)/4
		return nset[i-1]

def P5(number_set):
	nset = sorted(number_set)

	if len(nset)%2 == 0: #nº de elementos par
		i = ((len(nset)+1)*5)/100
		return (nset[i-1] + nset[i])/2.0
	else: #nº de elementos impar
		i = ((len(nset)+1)*5)/100
		return nset[i-1]

def MED(number_set):
	nset = sorted(number_set)

	if len(nset)%2 == 0: #nº de elementos par
		i = ((len(nset)+1)*50)/100
		return (nset[i-1] + nset[i])/2.0
	else: #nº de elementos impar
		i = ((len(nset)+1)*50)/100
		return nset[i-1]

def P95(number_set):
	nset = sorted(number_set)

	if len(nset)%2 == 0: #nº de elementos par
		i = ((len(nset)+1)*95)/100
		return (nset[i-1] + nset[i])/2.0
	else: #nº de elementos impar
		i = ((len(nset)+1)*95)/100
		return nset[i-1]


def main(indFilesList, periodo):
	try:
		indFiles = open(indFilesList, 'r')
	except IOError:
		print 'ERROR: El fichero de lista de ficheros de indicadores no existe'
		sys.exit(0)

	munRatios = {
		1: [],
		2: [],
		3: [],
		4: [],
		5: [],
		6: [],
		7: [],
		8: [],
		9: [],
		10: []
	}

	dipRatios = {
		1: [],
		2: [],
		3: [],
		4: [],
		5: [],
		6: [],
		7: [],
		8: [],
		9: [],
		10: []
	}

	# label_ratios = {
	# 	1: "Déficit/Superávit per cápita",
	# 	2: "Ahorro neto per cápita",
	# 	3: "Ahorro bruto per cápita",
	# 	4: "Elasticidad presupuestaria",
	# 	5: "Gasto público por habitante",
	# 	6: "Gasto de inversión per cápita",
	# 	7: "Gasto de inversión directa per cápita",
	# 	8: "Presion fiscal",
	# 	9: "Autonomía fiscal",
	# 	10: "Incremento de deuda per cápita"
	# }

	#Se recorren los ficheros para acumal toda la información
	for indFile in indFiles:
		try:
			reader = csv.DictReader(open(indFile.rstrip(), 'r'), delimiter=',')
		except IOError:
			print "Error: el fichero", indFile.rstrip(), "de la lista no existe"
			sys.exit(0)

		for r in reader:
			if r["periodo"] != periodo:
				print "Error: el fichero", indFile.rstrip(), "de la lista no pertenece al periodo", periodo, "sino al", r["periodo"]
				sys.exit(0)
			else:
				if "DD00" in r["entidad"]:
					dipRatios[int(r["id"])].append(float(r["valor"]))
				else:
					munRatios[int(r["id"])].append(float(r["valor"]))

	#Se ordenan las listas de ratios
	for e in dipRatios:
		dipRatios[e].sort()
	for e in munRatios:
		munRatios[e].sort()

	header = ["pre","rango","periodo","id","indicador","min","max","q1","q3","p5","p95","med"]

	aMun = {"periodo":periodo, "rango":"MUN"}
	aDip = {"periodo":periodo, "rango":"DIP"}
	for i in range(1,11):
		aMun[i] = {"min":"%.4f" % munRatios[i][0],"max":"%.4f" % munRatios[i][-1],"q1":"%.4f" % Q1(munRatios[i]),"q3":"%.4f" % Q3(munRatios[i]),"p5":"%.4f" % P5(munRatios[i]),"p95":"%.4f" % P95(munRatios[i]),"med":"%.4f" % MED(munRatios[i])}
	for i in range(1,11):
		aDip[i] = {"min":"%.4f" % dipRatios[i][0],"max":"%.4f" % dipRatios[i][-1],"q1":"%.4f" % Q1(dipRatios[i]),"q3":"%.4f" % Q3(dipRatios[i]),"p5":"%.4f" % P5(dipRatios[i]),"p95":"%.4f" % P95(dipRatios[i]),"med":"%.4f" % MED(dipRatios[i])}

	jwriter = open(periodo + "-MUN-indi.json", 'wb')
	jwriter2 = open(periodo + "-DIP-indi.json", 'wb')

	jwriter.write(json.dumps(aMun))
	jwriter2.write(json.dumps(aDip))
	
	jwriter.close()
	jwriter2.close()

if __name__ == '__main__':
	if len(sys.argv) < 3:
		print "Error: Se deben introducir 2 argumentos: python buildPeriodIndicatorsJSON.py listaFichIndicadores.txt Periodo"
	else:
		main(sys.argv[1], sys.argv[2])

#python buildPeriodIndicatorsJSON.py listaFichIndicadores2011.txt 2011