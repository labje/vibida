# *-* coding: utf-8 *-*

import csv, sys
import xml.etree.ElementTree as ET

NS = {
	"xlink":"http://www.w3.org/1999/xlink",
	"lenloc2-anexo2":"http://www.meh.es/taxonomias/lenloc2-anexo2",
	"xsi":"http://www.w3.org/2001/XMLSchema-instance",
	"iso4217":"http://www.xbrl.org/2003/iso4217",
	"lenloc2-onp-importes":"http://www.meh.es/taxonomias/lenloc2-onp-importes",
	"lenloc2-exist":"http://www.meh.es/taxonomias/lenloc2-exist",
	"xbrli":"http://www.xbrl.org/2003/instance",
	"lenloc2-prog":"http://www.meh.es/taxonomias/lenloc2-prog",
	"lenloc2-anexo5":"http://www.meh.es/taxonomias/lenloc2-anexo5",
	"lenloc2-econ-gast-abierta":"http://www.meh.es/taxonomias/lenloc2-econ-gast-abierta",
	"lenloc2-prog-abierta":"http://www.meh.es/taxonomias/lenloc2-prog-abierta",
	"lenloc2-econ-ingr-importes":"http://www.meh.es/taxonomias/lenloc2-econ-ingr-importes",
	"lenloc2-prog-cuentas-econ-cruzadas":"http://www.meh.es/taxonomias/lenloc2-prog-cuentas-econ-cruzadas",
	"lenloc2-anexo1":"http://www.meh.es/taxonomias/lenloc2-anexo1",
	"lenloc2-prog-cuentas":"http://www.meh.es/taxonomias/lenloc2-prog-cuentas",
	"lenloc2-econ-gast":"http://www.meh.es/taxonomias/lenloc2-econ-gast",
	"lenloc2-onp-deudores-acreedores":"http://www.meh.es/taxonomias/lenloc2-onp-deudores-acreedores",
	"lenloc2-anexo4":"http://www.meh.es/taxonomias/lenloc2-anexo4",
	"lenloc2-econ-gast-cuentas":"http://www.meh.es/taxonomias/lenloc2-econ-gast-cuentas",
	"lenloc2-econ-ingr-cuentas":"http://www.meh.es/taxonomias/lenloc2-econ-ingr-cuentas",
	"lenloc2-onp":"http://www.meh.es/taxonomias/lenloc2-onp",
	"lenloc2-econ-ingr-abierta":"http://www.meh.es/taxonomias/lenloc2-econ-ingr-abierta",
	"lenloc2-econ-gast-importes":"http://www.meh.es/taxonomias/lenloc2-econ-gast-importes",
	"xbrldt":"http://xbrl.org/2005/xbrldt",
	"lenloc2":"http://www.meh.es/taxonomias/lenloc2",
	"lenloc2-anexo3":"http://www.meh.es/taxonomias/lenloc2-anexo3",
	"xbrldi":"http://xbrl.org/2006/xbrldi",
	"lenloc2-econ-ingr":"http://www.meh.es/taxonomias/lenloc2-econ-ingr",
	"link":"http://www.xbrl.org/2003/linkbase",
	"lenloc2-resultp":"http://www.meh.es/taxonomias/lenloc2-resultp",
	"lenloc2-ref":"http://www.meh.es/taxonomias/lenloc2-ref",
	"lenloc2-remt":"http://www.meh.es/taxonomias/lenloc2-remt"
	}

context_prefix = {
	"L_G": "lenloc2-econ-gast-importes",
	"L_I": "lenloc2-econ-ingr-importes"
}

label_prefix = {
	"L_G": "lenloc2-econ-gast-cuentas",
	"L_I": "lenloc2-econ-ingr-cuentas"
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
		# if definition.get('{'+NS["xlink"]+'}from') == 'EconomicaGastos':
		contextos.append(context_prefix[pre] + ':' + definition.get('{'+NS["xlink"]+'}to'))

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

	header = ['pre','id','Cuenta','Lenloc_Label']
	for index, con in enumerate(contextos):
		header.append('Lenloc_context' + str(index))
	csv_file = x_la_name.split('.')[0] + '.csv'
	writer = csv.writer(open(csv_file, 'wb'), delimiter=",")
	writer.writerow(header)
	for row in labels:
		writer.writerow([pre, row['id'], row['Cuenta'], row['label']]+contextos)


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
#	python lenlocGastIngrMap.py lenloc2-econ-gast-importes-definition.xml lenloc2-econ-gast-cuentas-label.xml L_G
#	python lenlocGastIngrMap.py lenloc2-econ-ingr-importes-definition.xml lenloc2-econ-ingr-cuentas-label.xml L_I


#Hay un pequeño error en igresos pero es por el XML de labels donde nombre nombra "TransferenciaCorrientes" en vez
#de "TransferenciasCorrientes" (cuenta 4), que es como además se encuentra en los XBRL 