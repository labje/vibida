# *-* coding: utf-8 *-*

import csv, sys, json
#from operator import itemgetter
import xml.etree.ElementTree as ET


def getXBRLData(xbrlFile, csvFile, dsFile, op):

	try:
		tree = ET.parse(xbrlFile)
	except IOError:
		print 'ERROR: El fichero XBRL no existe'
		sys.exit(0)
	# tree = ET.parse(xbrlFile)
	root = tree.getroot()

	try:
		reader = csv.DictReader(open(csvFile, 'r'), delimiter=',')
		writer = csv.writer(open(xbrlFile.split('\\')[-1].split('.')[0] + "_" + csvFile.split('\\')[-1].split('.')[0] + "_DATA_2.csv", 'wb'), delimiter=',')
	except IOError:
		print 'ERROR: El fichero CSV no existe'
		sys.exit(0)

	try:
		NS = json.load(open(dsFile))
	except IOError:
		print 'ERROR: el fichero de dominio de nombres no existe'
		sys.exit(0)
	
	con = []
	numContextos = len(reader.fieldnames) - 4 #numero de contextos
	for c in range(numContextos):
		con.append("Penloc_context"+str(c))

	writer.writerow(["pre", "entidad", "periodo", "id", "cuenta"]+con)
	
	entidad = root.find('./{'+NS["xbrli"]+'}context/{'+NS["xbrli"]+'}entity/{'+NS["xbrli"]+'}identifier').text
	periodo = root.find('./{'+NS["xbrli"]+'}context/{'+NS["xbrli"]+'}period/{'+NS["xbrli"]+'}instant').text.split('-')[0]
	
	for row in reader:
		lista = [];
		for contexto in root.iter(tag='{'+NS["xbrli"]+'}context'):
			try:
				miembro = contexto.find('{'+NS["xbrli"]+'}entity').find('{'+NS["xbrli"]+'}segment').find('{'+NS["xbrldi"]+'}explicitMember')
				if miembro == None:#Perteneciente al anexo5, habra que hacer un tratamiento especial más adelante
					miembro = contexto.find('{'+NS["xbrli"]+'}entity').find('{'+NS["xbrli"]+'}segment').find('{'+NS["xbrldi"]+'}typedMember')[0]
				else:
					if miembro.text == row["Penloc_Label"]:
						lista.append(contexto.get('id'))
			except AttributeError:
				pass #Contexro mal formado

		contextos = ["{" + NS[row["Penloc_context"+ str(n)].split(":")[0]]+"}" + row["Penloc_context"+ str(n)].split(":")[1] for n in range(numContextos)]
		cantidad = 0
		
		if(len(lista) > 0):
			importes = ['0.0' for n in range(numContextos)]
			linea = []
			linea.append(row["pre"])
			linea.append(entidad)
			linea.append(periodo)
			linea.append(row["id"])
			linea.append(row["Cuenta"])
			for rContext in lista:
				if op == '1:1': 
					elm = root.find('.//*[@contextRef=' + '\"'+rContext+'\"'+ ']')
					if elm.tag in contextos:
						importes[contextos.index(elm.tag)] = elm.text
				else: #1:N
					for elm in root.findall('.//*[@contextRef=' + '\"'+rContext+'\"'+ ']'):
						if elm.tag in contextos:
							importes[contextos.index(elm.tag)] = elm.text

			linea += importes
			writer.writerow(linea)
		else: #No hay entrada para la cuenta
			linea = []
			linea.append(row["pre"])
			linea.append(entidad)
			linea.append(periodo)
			linea.append(row["id"])
			linea.append(row["Cuenta"])
			for i in range(numContextos):
				linea.append(None)
			writer.writerow(linea)
	print 'Proceso terminado'


def main():
	if len(sys.argv) < 5:
		print 'Se esperan 4 argumentos (faltan %d)' % (5-len(sys.argv))
	else:
		#Parametro 1 -> fichero con lista de ficheros XBRL
		listXBRLfile = sys.argv[1]
		#Parametro 2 -> fichero CSV con datos a extraer
		csvFile = sys.argv[2]#"gastos_excel_xbrl.csv"
		#Parametro 3 -> fichero JSON con dominio de nombres 
		dsFile = sys.argv[3]
		#Parametro 4 -> opcion de definición de contextos '1:1' o '1:N'
		op = sys.argv[4]
		try:
			lXBRL = open(listXBRLfile, 'r')
		except IOError:
			print 'ERROR: El fichero de lista de XBRLs no existe'
			sys.exit(0)
		for xbrlFile in lXBRL:
			print "Calculando:", xbrlFile
			getXBRLData(xbrlFile.rstrip(), csvFile, dsFile, op)
			

if __name__ == "__main__":
	main();

#Un ejemplo de ejecución
# python lenloc_csv_script_loop.py lista_fichs_xbrl.txt mapas_csv\penloc2-econ-ingr-cuentas-label.csv name-domain\name-domain-penloc2.json 1:N
# python lenloc_csv_script_loop.py lista_fichs_xbrl.txt mapas_csv\penloc2-econ-gast-cuentas-label.csv name-domain\name-domain-penloc2.json 1:N
# python lenloc_csv_script_loop.py lista_fichs_xbrl.txt mapas_csv\penloc2-prog-cuentas-label.csv name-domain\name-domain-penloc2.json 1:N