# *-* coding: utf-8 *-*

import csv, sys
import xml.etree.ElementTree as ET
from operator import itemgetter

NS = {
	"iso4217":"http://www.xbrl.org/2003/iso4217",
	"lenloc3":"http://www.meh.es/taxonomias/lenloc3",
	"lenloc3-anexo1":"http://www.meh.es/taxonomias/lenloc3-anexo1",
	"lenloc3-anexo3":"http://www.meh.es/taxonomias/lenloc3-anexo3",
	"lenloc3-anexo5":"http://www.meh.es/taxonomias/lenloc3-anexo5",
	"lenloc3-econ-gast":"http://www.meh.es/taxonomias/lenloc3-econ-gast",
	"lenloc3-econ-gast-cuentas":"http://www.meh.es/taxonomias/lenloc3-econ-gast-cuentas",
	"lenloc3-econ-gast-importes":"http://www.meh.es/taxonomias/lenloc3-econ-gast-importes",
	"lenloc3-econ-ingr":"http://www.meh.es/taxonomias/lenloc3-econ-ingr",
	"lenloc3-econ-ingr-cuentas":"http://www.meh.es/taxonomias/lenloc3-econ-ingr-cuentas",
	"lenloc3-econ-ingr-importes":"http://www.meh.es/taxonomias/lenloc3-econ-ingr-importes",
	"lenloc3-prog":"http://www.meh.es/taxonomias/lenloc3-prog",
	"lenloc3-prog-cuentas":"http://www.meh.es/taxonomias/lenloc3-prog-cuentas",
	"lenloc3-prog-cuentas-econ-cruzadas":"http://www.meh.es/taxonomias/lenloc3-prog-cuentas-econ-cruzadas",
	"lenloc3-ref":"http://www.meh.es/taxonomias/lenloc3-ref",
	"lenloc3-remt":"http://www.meh.es/taxonomias/lenloc3-remt",
	"lenloc3-resultp":"http://www.meh.es/taxonomias/lenloc3-resultp",
	"link":"http://www.xbrl.org/2003/linkbase",
	"penloc2-econ-gast":"http://www.meh.es/taxonomias/penloc2-econ-gast",
	"penloc2-econ-gast-abierta":"http://www.meh.es/taxonomias/penloc2-econ-gast-abierta",
	"penloc2-econ-gast-cuentas":"http://www.meh.es/taxonomias/penloc2-econ-gast-cuentas",
	"penloc2-econ-gast-importes":"http://www.meh.es/taxonomias/penloc2-econ-gast-importes",
	"penloc2-econ-ingr":"http://www.meh.es/taxonomias/penloc2-econ-ingr",
	"penloc2-econ-ingr-abierta":"http://www.meh.es/taxonomias/penloc2-econ-ingr-abierta",
	"penloc2-econ-ingr-cuentas":"http://www.meh.es/taxonomias/penloc2-econ-ingr-cuentas",
	"penloc2-econ-ingr-importes":"http://www.meh.es/taxonomias/penloc2-econ-ingr-importes",
	"penloc2-ord":"http://www.meh.es/taxonomias/penloc2-ord",
	"penloc2-prog":"http://www.meh.es/taxonomias/penloc2-prog",
	"penloc2-prog-abierta":"http://www.meh.es/taxonomias/penloc2-prog-abierta",
	"penloc2-prog-cuentas":"http://www.meh.es/taxonomias/penloc2-prog-cuentas",
	"penloc2-prog-cuentas-econ-cruzadas":"http://www.meh.es/taxonomias/penloc2-prog-cuentas-econ-cruzadas",
	"penloc2-ref":"http://www.meh.es/taxonomias/penloc2-ref",
	"xbrldi":"http://xbrl.org/2006/xbrldi",
	"xbrldt":"http://xbrl.org/2005/xbrldt",
	"xbrli":"http://www.xbrl.org/2003/instance",
	"xlink":"http://www.w3.org/1999/xlink",
	"xsi":"http://www.w3.org/2001/XMLSchema-instance"
	}

context_prefix = {
	"L_PR": "lenloc3-econ-gast-cuentas",
	"P_PR": "penloc2-econ-gast-cuentas"
} 
label_prefix = {
	"L_PR": "lenloc3-prog-cuentas",
	"P_PR": "penloc2-prog-cuentas"
}
h_label = {
	"L_PR": "Lenloc_Label",
	"P_PR": "Penloc_Label"
}
h_context = {
	"L_PR": "Lenloc_context",
	"P_PR": "Penloc_context"
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
	for definition in root.iter(tag='{'+NS["link"]+'}definitionArc'):
		if definition.get('{'+NS["xlink"]+'}from') == 'EconomicaGastos':
			contextos.append(context_prefix[pre] + ':' + definition.get('{'+NS["xlink"]+'}to'))

	#Segundo se recorre el XBRL de labels para ir formando el CSV query correspondiente
	try:
		tree = ET.parse(x_labels)
	except IOError:
		print 'ERROR: El fichero XBRL de etiquetas no existe'
		sys.exit(0)

	root = tree.getroot()
	x_la_name = x_labels.split('\\')[-1]
	# xmlns_l = '-'.join(x_la_name.split('-')[:-1])
	labels = []
	data = root.find('{'+NS['link']+ '}labelLink')
	r = {}
	for index, child in enumerate(data):
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
	header = ['pre','id','Cuenta',h_label[pre]]
	for index, con in enumerate(contextos):
		header.append(h_context[pre] + str(index))
	csv_file = x_la_name.split('.')[0] + '.csv'
	writer = csv.writer(open(csv_file, 'wb'), delimiter=",")
	writer.writerow(header)
	# result.append(header)
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
#	python xbrlProgMap.py lenloc2-econ-gast-cuentas-definition.xml lenloc2-prog-cuentas-label.xml L_PR
#	python xbrlProgMap.py penloc2-econ-gast-cuentas-definition.xml penloc2-prog-cuentas-label.xml P_PR
 
#	python xbrlProgMap.py C:\Users\david\Dropbox\VIBIDA\xbrls_definiciones\lenloc2-econ-gast-cuentas-definition.xml C:\Users\david\Dropbox\VIBIDA\xbrls_definiciones\lenloc2-prog-cuentas-label.xml L_PR
#	python xbrlProgMap.py C:\Users\david\Dropbox\VIBIDA\xbrls_definiciones\penloc2-econ-gast-cuentas-definition.xml C:\Users\david\Dropbox\VIBIDA\xbrls_definiciones\penloc2-prog-cuentas-label.xml P_PR