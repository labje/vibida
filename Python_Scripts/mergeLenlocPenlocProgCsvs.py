# *-* coding: utf-8 *-*

import csv, sys

def isNotEmpty(lista):
	return len([s for s in lista if s != ""]) > 0

def merge(d1, d2):
	data1 = csv.reader(open(d1, "rb"), delimiter=',') #Liquidación
	data2 = csv.reader(open(d2, "rb"), delimiter=',') #Presupuesto
	w_name = '-'.join([d1.split("_")[1]] + [d1.split("_")[3]] + [d1.split("_")[-3].split('-')[1]]) + ".csv"
	writer = csv.writer(open(w_name, "wb"), delimiter=',')

	lista2 = list(data2)
	for indice, row in enumerate(data1):
		if indice == 0: #cabecera
			contextos = len(row) - 5
			writer.writerow(row[:5] + ["contexto_lenloc" + str(n) for n in range(contextos)] + ["contexto_penloc" + str(n) for n in range(contextos)])
		else:
			if isNotEmpty(row[5:]) or isNotEmpty(lista2[indice][5:]):
				writer.writerow(["LP_" + row[0].split("_")[-1]] + row[1:] + lista2[indice][5:])

def alone(d1, pre):
	data1 = csv.reader(open(d1, "rb"), delimiter=',') #Liquidación o Presupuesto
	w_name = '-'.join([d1.split("_")[1]] + [d1.split("_")[3]] + [d1.split("_")[-3].split('-')[1]]) + ".csv"
	writer = csv.writer(open(w_name, "wb"), delimiter=',')

	for indice, row in enumerate(data1):
		contextos = len(row) - 5
		if indice == 0: #cabecera
			writer.writerow(row[:5] + ["contexto_lenloc" + str(n) for n in range(contextos)] + ["contexto_penloc" + str(n) for n in range(contextos)])
		else:
			if pre == "L_" and isNotEmpty(row[5:]):
				 writer.writerow(["L_" + row[0].split("_")[-1]] + row[1:] + ["" for s in range(contextos)])
			elif pre == "P_" and isNotEmpty(row[5:]):
				writer.writerow(["P_" + row[0].split("_")[-1]] + row[1:5] + ["" for s in range(contextos)] + row[5:])




if __name__ == '__main__':
	if len(sys.argv) == 3:
		print "dos"
		if 'Liquidacion' in sys.argv[1] and 'Presupuesto' in sys.argv[2]:
			merge(sys.argv[1], sys.argv[2])
		elif 'Liquidacion' in sys.argv[2] and 'Presupuesto' in sys.argv[1]:
			merge(sys.argv[2], sys.argv[1])
		else:
			print "Error: los CSV introducidos deben incluir 'Liquidacion' y 'Presupuesto' en sus nombres respectivamente."
	elif len(sys.argv) == 2:
		print "1"
		if 'Liquidacion' in sys.argv[1]:
			alone(sys.argv[1], "L_")
		elif 'Presupuesto' in sys.argv[1]:
			alone(sys.argv[1], "P_")
		else:
			print "Error: el CSV introducido debe incluir 'Liquidacion' o 'Presupuesto' en su nombre."
	else:
		print "Error: Faltan argumentos."