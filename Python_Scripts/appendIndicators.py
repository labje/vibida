# -*- coding: utf-8 -*-
import csv, sys

label_ratios = {
	1: "Déficit/Superávit per cápita",
	2: "Ahorro neto per cápita",
	3: "Ahorro bruto per cápita",
	4: "Elasticidad presupuestaria",
	5: "Gasto público por habitante",
	6: "Gasto de inversión per cápita",
	7: "Gasto de inversión directa per cápita",
	8: "Presion fiscal",
	9: "Autonomía fiscal",
	10: "Incremento de deuda per cápita"
}

def main(indFile):
	try:
		reader = csv.DictReader(open(indFile, 'r'), delimiter=',')
	except IOError:
		print 'El fichero', indFile, 'no existe'
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
	

	aFile = '-'.join(indFile.split('-')[1:])
	print indFile
	print "aFile:",aFile
	fileCreated = False
	try:
		reader = csv.reader(open(aFile, 'r'), delimiter=',')
		fileCreated = True
		print 'el fichero ya estaba creado'
	except IOError:
		print 'El fichero', aFile, 'no existe, hay que crearlo'
		
	header = ["pre","entidad","id","indicador"]
	entidad = aFile.split('-')[0]
	preData = []
	if fileCreated:
		preData = list(reader)
		if(new_column[0] in preData[0][4:]):
			print "Error: Se esta intentando añadir una columna de un periodo ya existente ->", new_column[0]
			sys.exit(0)
	else:
		preData.append(header)
		for i in range(1,11):
			preData.append(["IND", entidad, str(i), label_ratios[i]])

	#Escribir/reescribir fichero, ojo hacer copia previa
	writer = csv.writer(open(aFile, 'wb'), delimiter=',')
	for index, elem in enumerate(preData):
		writer.writerow(elem + [new_column[index]])


if __name__ == '__main__':
	if len(sys.argv) < 1:
		print "Error: Se debe introducir 1 argumento: python appendIndicators.py periodo-entidad-indi.csv"
	else:
		main(sys.argv[1])

#python appendIndicators.py 2010-01002AA00-indi.csv