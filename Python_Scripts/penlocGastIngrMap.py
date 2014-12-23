# *-* coding: utf-8 *-*

import csv, sys
import xml.etree.ElementTree as ET
from operator import itemgetter

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

context_prefix = {
	"P_G": "penloc2-econ-gast-importes",
	"P_I": "penloc2-econ-ingr-importes"
}

label_prefix = {
	"P_G": "penloc2-econ-gast-cuentas",
	"P_I": "penloc2-econ-ingr-cuentas"
}

label_context = {
	"P_G": "CreditosDefinitivosDelEjercicioCorriente",
	"P_I": "PrevisionDefinivaDelEjercicioCorriente"
}

def xml_parser_csv(pre, x_importes, x_labels):

	#Primero se obtiene la lista de posibles contextos
	try:
		tree = ET.parse(x_importes)
	except IOError:
		print 'ERROR: El fichero XBRL de contextos no existe'
		sys.exit(0)

	root = tree.getroot()
	# x_im_name = x_importes.split('\\')[-1]
	# xmlns_c = '-'.join(x_im_name.split('-')[:-1])
	contextos = []
	for definition in root.iter(tag='{'+NS["link"]+'}loc'):
		if definition.get('{'+NS["xlink"]+'}label') == label_context[pre]:
			contextos.append(context_prefix[pre] + ':' + definition.get('{'+NS["xlink"]+'}href').split("_")[-1])

	#Segundo se recorre el XBRL de labels para ir formando el CSV query correspondiente
	try:
		tree = ET.parse(x_labels)
	except IOError:
		print 'ERROR: El fichero XBRL de etiquetas no existe'
		sys.exit(0)

	# w = open("lista_contestos.txt", "w")
	# for c in contextos:
	# 	w.write(c + "\n")
	# w.close()

	root = tree.getroot()
	x_la_name = x_labels.split('\\')[-1]
	# xmlns_l = '-'.join(x_la_name.split('-')[:-1])
	labels = []
	data = root.find('{'+NS['link']+ '}labelLink')
	r = {}
	for index, child in enumerate(data):
		if index > 2: #Primera terna de hijos no hacen falta 
			if child.tag == '{'+NS['link']+'}loc':
				r["label"] = label_prefix[pre] + ':' + child.get('{'+NS['xlink']+'}label')
			elif child.tag == '{'+NS['link']+'}label':
				if ':' in child.text:
					r["id"] = child.text.split(':')[0]
					r["Cuenta"] = child.text.split(':')[1].strip().encode('utf-8')
					labels.append(r)
					r = {}
				else:
					r = {}

	result = []
	header = ['pre','id','Cuenta','Penloc_Label']
	for index, con in enumerate(contextos):
		header.append('Penloc_context' + str(index))
	csv_file = x_la_name.split('.')[0] + '.csv'
	writer = csv.writer(open(csv_file, 'wb'), delimiter=",")
	writer.writerow(header)
	for row in labels:
		# writer.writerow([pre, row['id'], row['Cuenta'], row['label']]+contextos)
		result.append([pre, row['id'], row['Cuenta'], row['label']]+contextos)
	
	sortedList = sorted(result, cmp=lambda x,y: cmp(x.lower(), y.lower()), key=itemgetter(header.index("id")))
	writer.writerows(sortedList)


def main():
	if len(sys.argv) < 4:
		print 'Se esperan 3 argumentos (faltan %d)' % (4-len(sys.argv))
	else:
		#Parametro 1 -> fichero XBRL contextos
		xbrl_importes = sys.argv[1]
		#Parametro 2 -> fichero XBRL labels
		xbrl_labels = sys.argv[2]
		#Parametro 3 -> prefijo diferenciador
		pre = sys.argv[3]
		xml_parser_csv(pre, xbrl_importes, xbrl_labels)

if __name__ == "__main__":
	main()

#Un ejemplo de ejecución sería:
#	python penlocGastIngrMap.py penloc2-econ-gast-importes-definition.xml penloc2-econ-gast-cuentas-label.xml P_G
#	python penlocGastIngrMap.py penloc2-econ-ingr-importes-definition.xml penloc2-econ-ingr-cuentas-label.xml P_I
 
#	python penlocGastIngrMap.py C:\Users\david\Dropbox\VIBIDA\xbrls_definiciones\penloc2-econ-gast-importes-definition.xml C:\Users\david\Dropbox\VIBIDA\xbrls_definiciones\penloc2-econ-gast-cuentas-label.xml P_G
#	python penlocGastIngrMap.py C:\Users\david\Dropbox\VIBIDA\xbrls_definiciones\penloc2-econ-ingr-importes-definition.xml C:\Users\david\Dropbox\VIBIDA\xbrls_definiciones\penloc2-econ-ingr-cuentas-label.xml P_I