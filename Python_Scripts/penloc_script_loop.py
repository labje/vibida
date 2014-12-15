# *-* coding: utf-8 *-*

import csv, sys
#from operator import itemgetter
import xml.etree.ElementTree as ET

NS = {
	"xlink":"http://www.w3.org/1999/xlink",
	"xbrli":"http://www.xbrl.org/2003/instance",
	"penloc2-prog-cuentas-econ-cruzadas":"http://www.meh.es/taxonomias/penloc2-prog-cuentas-econ-cruzadas",
	"penloc2-econ-ingr-importes":"http://www.meh.es/taxonomias/penloc2-econ-ingr-importes",
	"penloc2-prog-abierta":"http://www.meh.es/taxonomias/penloc2-prog-abierta",
	"xbrldt":"http://xbrl.org/2005/xbrldt",
	"penloc2-ref":"http://www.meh.es/taxonomias/penloc2-ref",
	"penloc2-prog-cuentas":"http://www.meh.es/taxonomias/penloc2-prog-cuentas",
	"penloc2-econ-gast-cuentas":"http://www.meh.es/taxonomias/penloc2-econ-gast-cuentas",
	"penloc2-econ-gast-abierta":"http://www.meh.es/taxonomias/penloc2-econ-gast-abierta",
	"penloc2-econ-ingr":"http://www.meh.es/taxonomias/penloc2-econ-ingr",
	"xbrldi":"http://xbrl.org/2006/xbrldi",
	"penloc2-prog":"http://www.meh.es/taxonomias/penloc2-prog",
	"penloc2-econ-ingr-cuentas":"http://www.meh.es/taxonomias/penloc2-econ-ingr-cuentas",
	"penloc2-ord":"http://www.meh.es/taxonomias/penloc2-ord",
	"link":"http://www.xbrl.org/2003/linkbase",
	"xsi":"http://www.w3.org/2001/XMLSchema-instance",
	"penloc2-econ-ingr-abierta":"http://www.meh.es/taxonomias/penloc2-econ-ingr-abierta",
	"iso4217":"http://www.xbrl.org/2003/iso4217",
	"penloc2-econ-gast-importes":"http://www.meh.es/taxonomias/penloc2-econ-gast-importes",
	"penloc2-econ-gast":"http://www.meh.es/taxonomias/penloc2-econ-gast"
	}


def getXBRLData(xbrlFile, csvFile):

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
			miembro = contexto.find('{'+NS["xbrli"]+'}entity').find('{'+NS["xbrli"]+'}segment').find('{'+NS["xbrldi"]+'}explicitMember')
			if miembro == None:#Perteneciente al anexo5, habra que hacer un tratamiento especial más adelante
				miembro = contexto.find('{'+NS["xbrli"]+'}entity').find('{'+NS["xbrli"]+'}segment').find('{'+NS["xbrldi"]+'}typedMember')[0]
			else:
				if miembro.text == row["Penloc_Label"]:
					lista.append(contexto.get('id'))

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
				elm = root.find('.//*[@contextRef=' + '\"'+rContext+'\"'+ ']')
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
	if len(sys.argv) < 3:
		print 'Se esperan 2 argumentos (faltan %d)' % (3-len(sys.argv))
	else:
		#Parametro 1 -> fichero con lista de ficheros XBRL
		listXBRLfile = sys.argv[1]
		#Parametro 2 -> fichero CSV con datos a extraer
		csvFile = sys.argv[2]#"gastos_excel_xbrl.csv"
		try:
			lXBRL = open(listXBRLfile, 'r')
		except IOError:
			print 'ERROR: El fichero de lista de XBRLs no existe'
			sys.exit(0)
		for xbrlFile in lXBRL:
			print "Calculando:", xbrlFile
			getXBRLData(xbrlFile.rstrip(), csvFile)
			

if __name__ == "__main__":
	main();