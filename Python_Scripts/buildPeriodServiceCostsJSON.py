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
	print "p95",len(nset)
	if len(nset)%2 == 0: #nº de elementos par
		i = ((len(nset)+1)*95)/100
		if i < len(nset):
			return (nset[i-1] + nset[i])/2.0
		else: 
			return nset[i-1]
	else: #nº de elementos impar
		i = ((len(nset)+1)*95)/100
		return nset[i-1]


def main(servFilesList, periodo):
	try:
		servFiles = open(servFilesList, 'r')
	except IOError:
		print 'ERROR: El fichero de lista de ficheros de costes de servicios no existe'
		sys.exit(0)

	munServices = {
		15: [],
		161: [],
		162: [],
		165: [],
		17: [],
		23: [],
		31: [],
		32: [],
		33: []
	}

	dipServices = {
		15: [],
		161: [],
		162: [],
		165: [],
		17: [],
		23: [],
		31: [],
		32: [],
		33: []
	}

	# label_services = {
	# 	15: "Vivienda y urbanismo",
	# 	161: "Saneamiento, abastecimiento y distribución de aguas.",
	# 	162: "Recogida, eliminación y tratamiento de residuos.",
	# 	165: "Alumbrado público",
	# 	17: "Medio ambiente",
	# 	23: "Servicios Sociales y promoción social",
	# 	31: "Sanidad",
	# 	32: "Educación",
	# 	33: "Cultura"
	# }
	# p = 0
	#Se recorren los ficheros para acumal toda la información
	for servFile in servFiles:
		try:
			reader = csv.DictReader(open(servFile.rstrip(), 'r'), delimiter=',')
		except IOError:
			print "Error: el fichero", servFile.rstrip(), "de la lista no existe"
			sys.exit(0)
		
		for r in reader:
			if r["periodo"] != periodo:
				print "Error: el fichero", servFile.rstrip(), "de la lista no pertenece al periodo", periodo, "sino al", r["periodo"]
				sys.exit(0)
			else:
				
				if "DD00" in r["entidad"] and float(r["valor"]) > 0.0:
					# print r['entidad']
					dipServices[int(r["id"])].append(float(r["valor"]))
				elif float(r["valor"]) > 0.0:
					munServices[int(r["id"])].append(float(r["valor"]))
					# p += 1
	# print "p",p
	#Se ordenan las listas de ratios
	for e in dipServices:
		dipServices[e].sort()
		# print "Dip", e, "len", len(dipServices[e])
	for e in munServices:
		munServices[e].sort()
		# print "Mun", e, "len", len(munServices[e])
	

	# header = ["pre","rango","periodo","id","servicio","min","max","q1","q3","p5","p95","med"]

	aMun = {"periodo":periodo, "rango":"MUN"}
	aDip = {"periodo":periodo, "rango":"DIP"}
	for i in [15,161,162,165,17,23,31,32,33]:
		# print "dip", i
		aMun[i] = {"min":"%.4f" % munServices[i][0],"max":"%.4f" % munServices[i][-1],"q1":"%.4f" % Q1(munServices[i]),"q3":"%.4f" % Q3(munServices[i]),"p5":"%.4f" % P5(munServices[i]),"p95":"%.4f" % P95(munServices[i]),"med":"%.4f" % MED(munServices[i])}
	for i in [15,161,162,165,17,23,31,32,33]:
		# print "mun", i
		aDip[i] = {"min":"%.4f" % dipServices[i][0],"max":"%.4f" % dipServices[i][-1],"q1":"%.4f" % Q1(dipServices[i]),"q3":"%.4f" % Q3(dipServices[i]),"p5":"%.4f" % P5(dipServices[i]),"p95":"%.4f" % P95(dipServices[i]),"med":"%.4f" % MED(dipServices[i])}

	jwriter = open(periodo + "-MUN-serv.json", 'wb')
	jwriter2 = open(periodo + "-DIP-serv.json", 'wb')

	jwriter.write(json.dumps(aMun))
	jwriter2.write(json.dumps(aDip))
	
	jwriter.close()
	jwriter2.close()

if __name__ == '__main__':
	if len(sys.argv) < 3:
		print "Error: Se deben introducir 2 argumentos: python buildPeriodServiceCostsJSON.py listaFichServiceCosts.txt Periodo"
	else:
		main(sys.argv[1], sys.argv[2])

#python buildPeriodServiceCostsJSON.py listaFichServiceCosts2011.txt 2011