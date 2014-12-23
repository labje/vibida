:: 0 - Generar ficheros lista de XBRL
@echo off
echo Liquidacion_%2_Ente_%1.xbrl > listaLenloc.txt
echo Presupuesto_%2_Ente_%1.xbrl > listaPenloc.txt

:: 1 - Generar ficheros CSV de Ingresos, Gastos y Clasificación por Programa
:: LENLOC
python lenloc_csv_script_loop.py listaLenloc.txt mapas_csv\lenloc%3-econ-ingr-cuentas-label.csv name-domain\name-domain-lenloc%3.json %4
python lenloc_csv_script_loop.py listaLenloc.txt mapas_csv\lenloc%3-econ-gast-cuentas-label.csv name-domain\name-domain-lenloc%3.json %4
python lenloc_csv_script_loop.py listaLenloc.txt mapas_csv\lenloc%3-prog-cuentas-label.csv name-domain\name-domain-lenloc%3.json %4

:: PENLOC
python penloc_csv_script_loop.py listaPenloc.txt mapas_csv\penloc%5-econ-ingr-cuentas-label.csv name-domain\name-domain-penloc%5.json %6
python penloc_csv_script_loop.py listaPenloc.txt mapas_csv\penloc%5-econ-gast-cuentas-label.csv name-domain\name-domain-penloc%5.json %6
python penloc_csv_script_loop.py listaPenloc.txt mapas_csv\penloc%5-prog-cuentas-label.csv name-domain\name-domain-penloc%5.json %6

:: 2 - Generar ficheros CSV de Indicadores financieros y Gasto de Servicios
python buildIndicators.py Liquidacion_%2_Ente_%1_lenloc%3-econ-ingr-cuentas-label_DATA_2.csv Liquidacion_%2_Ente_%1_lenloc%3-econ-gast-cuentas-label_DATA_2.csv datos-poblacion\pobmun%2.json
python buildServiceCosts.py Liquidacion_%2_Ente_%1_lenloc%3-prog-cuentas-label_DATA_2.csv datos-poblacion\pobmun%2.json

:: 3 - Fusionar ficheros LENLOC y PENLOC generados en el paso 1
python mergeLenlocPenlocCsvs.py Liquidacion_%2_Ente_%1_lenloc%3-econ-ingr-cuentas-label_DATA_2.csv Presupuesto_%2_Ente_%1_penloc%5-econ-ingr-cuentas-label_DATA_2.csv
python mergeLenlocPenlocCsvs.py Liquidacion_%2_Ente_%1_lenloc%3-econ-gast-cuentas-label_DATA_2.csv Presupuesto_%2_Ente_%1_penloc%5-econ-gast-cuentas-label_DATA_2.csv
python mergeLenlocPenlocProgCsvs.py Liquidacion_%2_Ente_%1_lenloc%3-prog-cuentas-label_DATA_2.csv Presupuesto_%2_Ente_%1_penloc%5-prog-cuentas-label_DATA_2.csv

:: 4 - Crear información de indicadores y servicios generada en el paso 2 para crear un fichero con columnas de periodos. Colocar en la carpeta, si existe, 
:: los ficheros generados con anterioridad con información de otros periodos ('codEntidad'-indi.csv, 'codEntidad'-serv.csv). Si existían ficheros previos, 
:: se añade una nueva columna con información del nuevo periodo, si no, se crean nuevos ficheros.
python appendIndicators.py %2-%1-indi.csv
python appendServiceCosts.py %2-%1-serv.csv