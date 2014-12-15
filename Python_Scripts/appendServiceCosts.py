# -*- coding: utf-8 -*-
import csv, sys

label_servicios = {
	15: "Vivienda y urbanismo",
	161: "Saneamiento, abastecimiento y distribución de aguas.",
	162: "Recogida, eliminación y tratamiento de residuos.",
	165: "Alumbrado público",
	17: "Medio ambiente",
	23: "Servicios Sociales y promoción social",
	31: "Sanidad",
	32: "Educación",
	33: "Cultura"
}

def main(servFile):
	try:
		reader = csv.DictReader(open(servFile, 'r'), delimiter=',')
	except IOError:
		print 'El fichero', servFile, 'no existe'
		sys.exit(0)

	#se obtienen los valores de los ratios
	new_column = []
	for index, row in enumerate(reader):
		if index == 0:
			new_column.append(row["periodo"])
			new_column.append(row["valor"])
		else:
			new_column.append(row["valor"])
	# 	print row["id"], row["valor"]

	# for i, e in enumerate(new_column):
	# 	print i, e
	

	aFile = '-'.join(servFile.split('-')[1:])
	print servFile
	print "aFile:",aFile
	fileCreated = False
	try:
		reader = csv.reader(open(aFile, 'r'), delimiter=',')
		fileCreated = True
		print 'el fichero ya estaba creado'
	except IOError:
		print 'El fichero', aFile, 'no existe, hay que crearlo'
		
	header = ["pre","entidad","id","servicio"]
	entidad = aFile.split('-')[0]
	preData = []
	if fileCreated:
		preData = list(reader)
		if(new_column[0] in preData[0][4:]):
			print "Error: Se esta intentando añadir una columna de un periodo ya existente ->", new_column[0]
			sys.exit(0)
	else:
		preData.append(header)
		for i in [15,161,162,165,17,23,31,32,33]:
			preData.append(["SERV", entidad, str(i), label_servicios[i]])

	#Escribir/reescribir fichero, ojo hacer copia previa
	writer = csv.writer(open(aFile, 'wb'), delimiter=',')
	for index, elem in enumerate(preData):
		writer.writerow(elem + [new_column[index]])


if __name__ == '__main__':
	if len(sys.argv) < 1:
		print "Error: Se debe introducir 1 argumento: python appendServiceCosts.py periodo-entidad-serv.csv"
	else:
		main(sys.argv[1])

#python appendServiceCosts.py 2010-01002AA00-serv.csv