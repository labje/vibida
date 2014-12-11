<?php
/********************************************************************/
/* Fichero:     queries_BQ.php                                      */
/* Autor:       David Gracia Larrodé   dagrala@gmail.com            */
/* Descripción: Script php que realiza las consultas necesarias a   */
/*              BigQuery y devuelve el objeto resultado para poder  */
/*              construir el scatter plot de la sección 5 de la     */
/*              página ('RELACIÓN ENTRE DOS INDICADORES').          */ 
/********************************************************************/
  session_start();
  include_once "../templates/base.php";

  require_once 'Google/Client.php';
  require_once 'Google/Service/Bigquery.php';

  $client_id = '1048158064723-fqjr61ji1tc3ovt8bjlemdeshv992idq.apps.googleusercontent.com'; //Client ID
  $service_account_name = '1048158064723-fqjr61ji1tc3ovt8bjlemdeshv992idq@developer.gserviceaccount.com'; //Email Address 
  $key_file_location = '../private/VIBIDA-cfb182ed7e18.p12'; //key.p12

  //Se crea el cliente y el servicio
  $client = new Google_Client();
  $client->setApplicationName("Client_Library_Examples");
  $service = new Google_Service_Bigquery($client);

  //Se realiza la conexión al servicio
  if (isset($_SESSION['service_token'])) {
    $client->setAccessToken($_SESSION['service_token']);
  }
  $key = file_get_contents($key_file_location);
  $cred = new Google_Auth_AssertionCredentials(
      $service_account_name,
      array('https://www.googleapis.com/auth/bigquery'),
      $key
  );
  $client->setAssertionCredentials($cred);
  if($client->getAuth()->isAccessTokenExpired()) {
    $client->getAuth()->refreshTokenWithAssertion($cred);
  }
  $_SESSION['service_token'] = $client->getAccessToken();

  
  //nº de proyecto asociado a servicio BigQuery
  $projectNumber = '1048158064723';
  //Id del dataset donde residen las tablas a consultar
  $datasetId = 'XBRL_SET';
 
  //Se da valor a variables comunicadas por POST
  $factor1 = (!empty($_POST)) ? $_POST["factor1"] : 'Ingresos';
  $factor2 = (!empty($_POST)) ? $_POST["factor2"] : 'Ingresos';
  $rango = (!empty($_POST)) ? $_POST["rango"] : 'MUN';
  $periodo = (!empty($_POST)) ? $_POST["periodo"] : '2011';
  $poblacion = (!empty($_POST)) ? $_POST["poblacion"] : 50000;
  $minR2 = (!empty($_POST)) ? $_POST["minR2"] : 0.3;
  
  //Se define la tabla a la que se accedera según el periodo pasado como parámetro
  $tabla = ($periodo == '2012') ? 'FROM XBRL_SET.spainLiqPreData2012 ' : 'FROM XBRL_SET.spainLiqPreData2010_2011 ';

  //Se definen condiciones de rango y población 
  $cond_rango = ($rango == 'DIP') ? 'codigo_entidad contains "DD"': '(codigo_entidad contains "DD") = false';
  $cond_poblacion1 = 'WHERE A.poblacion < 5000';
  $cond_poblacion2 = 'WHERE A.poblacion <= 50000 AND A.poblacion > 5000';
  $cond_poblacion3 = 'WHERE A.poblacion > 50000';

  //Consultas diferenciadas por factor a comparar en el scatter plot
  $poblacionQuery = 'SELECT poblacion AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango .
                  ' GROUP BY codigo_entidad, suma, poblacion';

  $poblacionMilQuery = 'SELECT poblacion/1000 AS suma, codigo_entidad, poblacion ' .
                    $tabla .
                    'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango .
                    ' GROUP BY codigo_entidad, suma, poblacion';
  $ingresosQuery = 'SELECT sum(contexto1) AS suma, codigo_entidad, poblacion ' .
                    $tabla .
                    'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_I" AND LENGTH(id) = 1 ' .
                    'GROUP BY codigo_entidad, poblacion';
  
  $ingresosMillQuery = 'SELECT sum(contexto1)/1000000 AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_I" AND LENGTH(id) = 1 ' .
                  'GROUP BY codigo_entidad, poblacion';

  $gastosQuery = 'SELECT sum(contexto1) AS suma, codigo_entidad, poblacion ' .
                    $tabla .
                    'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_G" AND LENGTH(id) = 1 ' .
                    'GROUP BY codigo_entidad, poblacion';


  $gastosMillQuery = 'SELECT sum(contexto1)/1000000 AS suma, codigo_entidad, poblacion ' .
                    $tabla .
                    'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_G" AND LENGTH(id) = 1 ' .
                    'GROUP BY codigo_entidad, poblacion';


  $ingresos15Query = 'SELECT sum(contexto1) AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_I" AND (INTEGER(id) BETWEEN 1 AND 5) ' .
                  'GROUP BY codigo_entidad, poblacion';

  $ingresos17Query = 'SELECT sum(contexto1) AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_I" AND (INTEGER(id) BETWEEN 1 AND 7) ' .
                  'GROUP BY codigo_entidad, poblacion';

  $ingresos13Query = 'SELECT sum(contexto1) AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_I" AND (INTEGER(id) BETWEEN 1 AND 3) ' .
                  'GROUP BY codigo_entidad, poblacion';

  $gastos124Query = 'SELECT sum(contexto1) AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_G" AND ' . 
                  '((INTEGER(id) BETWEEN 1 AND 2) OR INTEGER(id) = 4) ' .
                  'GROUP BY codigo_entidad, poblacion';

  $gastos149Query = 'SELECT sum(contexto1) AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_G" AND ' . 
                  '((INTEGER(id) BETWEEN 1 AND 4) OR INTEGER(id) = 9) ' .
                  'GROUP BY codigo_entidad, poblacion';

  $gastos17Query = 'SELECT sum(contexto1) AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_G" AND (INTEGER(id) BETWEEN 1 AND 7) ' .
                  'GROUP BY codigo_entidad, poblacion';

  //Déficit/Superávit per cápita
  $ratio1Query = 'SELECT (I.suma-G.suma)/I.poblacion AS suma, I.codigo_entidad AS codigo_entidad, I.poblacion AS poblacion ' .
          'FROM (' . $ingresosQuery . ') AS I INNER JOIN (' . $gastosQuery . ') AS G ' .
          'ON I.codigo_entidad = G.codigo_entidad';

  //Ahorro neto per cápita
  $ratio2Query = 'SELECT (I.suma-G.suma)/I.poblacion AS suma, I.codigo_entidad AS codigo_entidad, I.poblacion AS poblacion ' .
          'FROM (' . $ingresos15Query . ') AS I INNER JOIN (' . $gastos149Query . ') AS G ' .
          'ON I.codigo_entidad = G.codigo_entidad';

  //Ahorro bruto per cápita
  $ratio3Query = 'SELECT (I.suma-G.suma)/I.poblacion AS suma, I.codigo_entidad AS codigo_entidad, I.poblacion AS poblacion ' .
          'FROM (' . $ingresos15Query . ') AS I INNER JOIN (' . $gastos124Query . ') AS G ' .
          'ON I.codigo_entidad = G.codigo_entidad';

  //Estabilidad presupuestaria
  $ratio4Query = 'SELECT (I.suma-G.suma)/I.poblacion AS suma, I.codigo_entidad AS codigo_entidad, I.poblacion AS poblacion ' .
          'FROM (' . $ingresos17Query . ') AS I INNER JOIN (' . $gastos17Query . ') AS G ' .
          'ON I.codigo_entidad = G.codigo_entidad';

  //Gasto público por habitante
  $ratio5Query = 'SELECT sum(contexto1)/poblacion AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_G" AND LENGTH(id) = 1 ' .
                  'GROUP BY codigo_entidad, poblacion';

  //Gastos de inversión per cápita
  $ratio6Query = 'SELECT sum(contexto1)/poblacion AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_G" AND (INTEGER(id) BETWEEN 6 AND 7) ' .
                  'GROUP BY codigo_entidad, poblacion';

  //Gastos de inversión directa per cápita
  $ratio7Query = 'SELECT sum(contexto1)/poblacion AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_G" AND INTEGER(id) = 6 ' .
                  'GROUP BY codigo_entidad, poblacion';

  //Ingresos fiscales por habitante
  $ratio8Query = 'SELECT sum(contexto1)/poblacion AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_I" AND (INTEGER(id) BETWEEN 1 AND 3) ' .
                  'GROUP BY codigo_entidad, poblacion';

  //Autonomía fiscal
  $ratio9Query = 'SELECT (I13.suma/IT.suma)*100 AS suma, I13.codigo_entidad AS codigo_entidad, I13.poblacion AS poblacion ' .
          'FROM (' . $ingresos13Query . ') AS I13 INNER JOIN (' . $ingresosQuery . ') AS IT ' .
          'ON I13.codigo_entidad = IT.codigo_entidad';

  //Incremento de Deuda per cápita
  $ratio10Query = 'SELECT sum(contexto1)/poblacion AS suma, codigo_entidad, poblacion ' .
                  $tabla .
                  'WHERE periodo = ' . $periodo . ' AND ' . $cond_rango . ' AND pre = "L_I" AND INTEGER(id) = 9 ' .
                  'GROUP BY codigo_entidad, poblacion';

  //variables que albergarán la consulta de cada factor a comparar
  $xQuery = '';
  $yQuery = '';

  //Indicadores financieros, posibles factores a comparar
  $ratio1 = 'Déficit/Superávit per cápita'; //'Déficit o superávit per cápita';  
  $ratio2 = 'Ahorro neto per cápita'; //'Ahorro neto per cápita';  
  $ratio3 = 'Ahorro bruto per cápita'; //'Ahorro bruto per cápita';  
  $ratio4 = 'Estabilidad presupuestaria'; //'Estabilidad presupuestaria';  
  $ratio5 = 'Gasto público por habitante'; //'Gasto público por habitante';  
  $ratio6 = 'Gasto de inversión por habitante'; //'Gastos de inversión per cápita';  
  $ratio7 = 'Gasto de inversión directo por habitante'; //'Gastos de inversión directa per cápita';  
  $ratio8 = 'Ingresos fiscales por habitante'; //'Ingresos fiscales por habitante';  
  $ratio9 = 'Autonomía fiscal'; //'Autonomía fiscal';  
  $ratio10 = 'Incremento de deuda per cápita'; // 'Incremento de Deuda per cápita';  

  //Se asigna la consulta del primer factor
  switch($factor1){
    case 'Población': $xQuery = $poblacionMilQuery;
                      break;
    case 'Ingresos':  $xQuery = $ingresosMillQuery;
                      break;
    case 'Gastos':    $xQuery = $gastosMillQuery;
                      break;
    case $ratio1:     $xQuery = $ratio1Query;
                      break;
    case $ratio2:     $xQuery = $ratio2Query;
                      break;
    case $ratio3:     $xQuery = $ratio3Query;
                      break;
    case $ratio4:     $xQuery = $ratio4Query;
                      break;
    case $ratio5:     $xQuery = $ratio5Query;
                      break;
    case $ratio6:     $xQuery = $ratio6Query;
                      break;
    case $ratio7:     $xQuery = $ratio7Query;
                      break;
    case $ratio8:     $xQuery = $ratio8Query;
                      break;
    case $ratio9:     $xQuery = $ratio9Query;
                      break;
    case $ratio10:    $xQuery = $ratio10Query;
                      break;
    default:          ;
  }

  //Se asigna la consulta del segundo factor
  switch($factor2){
    case 'Población': $yQuery = $poblacionMilQuery;
                      break;
    case 'Ingresos':  $yQuery = $ingresosMillQuery;
                      break;
    case 'Gastos':    $yQuery = $gastosMillQuery;
                      break;
    case $ratio1:     $yQuery = $ratio1Query;
                      break;
    case $ratio2:     $yQuery = $ratio2Query;
                      break;
    case $ratio3:     $yQuery = $ratio3Query;
                      break;
    case $ratio4:     $yQuery = $ratio4Query;
                      break;
    case $ratio5:     $yQuery = $ratio5Query;
                      break;
    case $ratio6:     $yQuery = $ratio6Query;
                      break;
    case $ratio7:     $yQuery = $ratio7Query;
                      break;
    case $ratio8:     $yQuery = $ratio8Query;
                      break;
    case $ratio9:     $yQuery = $ratio9Query;
                      break;
    case $ratio10:    $yQuery = $ratio10Query;
                      break;
    default:          ;
  }


//Se gener la query combinada  
$comboQuery = 'SELECT A.suma AS factorX, B.suma AS factorY, A.poblacion, A.codigo_entidad ' .
          'FROM (' . $xQuery . ') AS A INNER JOIN (' . $yQuery . ') AS B ' .
          'ON A.codigo_entidad = B.codigo_entidad ' .
          'ORDER BY A.poblacion';
//Se genera una query diferente por intervalo de población
$comboQueryR1 = str_replace(', A.poblacion, A.codigo_entidad', '', str_replace('ORDER BY A.poblacion', $cond_poblacion1, $comboQuery));
$comboQueryR2 = str_replace(', A.poblacion, A.codigo_entidad', '', str_replace('ORDER BY A.poblacion', $cond_poblacion2, $comboQuery));
$comboQueryR3 = str_replace(', A.poblacion, A.codigo_entidad', '', str_replace('ORDER BY A.poblacion', $cond_poblacion3, $comboQuery));

  //Se prepara la query
  $query = new Google_Service_Bigquery_QueryRequest();
  $query->setQuery($comboQuery);
  $query->setTimeoutMs(10000);
  $defaultDataset = new Google_Service_Bigquery_DatasetReference();
  $defaultDataset->setDatasetId($datasetId);
  $defaultDataset->setProjectId($projectNumber);
  $query->setDefaultDataset($defaultDataset);
  $jobs = $service->jobs;
  //Se ejecuta la query
  $results = $jobs->query($projectNumber, $query);
  
  //Se tratan los resultados, para que se devuelva los puntos, población y código para row
  $lista = array();
  foreach ($results->rows as $item) {
    $lista[] = array('factor1' => $item->f[0]->v, 'factor2' => $item->f[1]->v, 'poblacion' => $item->f[2]->v, 'codigo' => $item->f[3]->v);
  }

  $minPoblation = $lista[0]['poblacion']; //mínima población obtenida de la anterior consulta
  $endPoints = end($lista);
  $maxPoblation = $endPoints['poblacion']; //máxima población obtenida de la anterior consulta



//Se prepara las consultas para el cálculo de coeficientes de deteminacion (R2) dentro de cada rango de población
  $r2s = array(
    'r2_1' => null,
    'r2_2' => null,
    'r2_3' => null
  );

  if($minPoblation <= 5000){ //rango inferior
    $r2Query = 'SELECT POW(CORR(factorX,factorY), 2) ' .
        'FROM (' . $comboQueryR1 . ')';
    $query->setQuery($r2Query);
    //Se ejecuta la query
    $results = $jobs->query($projectNumber, $query);
    //Se almacena el coeficiente para el rango de población inferior
    $r2s['r2_1'] = $results->rows[0]->f[0]->v;
  }

  if(($minPoblation <= 5001) or ($maxPoblation >= 50000)){ //rango medio
    $r2Query = 'SELECT POW(CORR(factorX,factorY), 2) ' .
        'FROM (' . $comboQueryR2 . ')';
    $query->setQuery($r2Query);
    //Se ejecuta la query
    $results = $jobs->query($projectNumber, $query);
    //Se almacena el coeficiente para el rango de población medio
    $r2s['r2_2'] = $results->rows[0]->f[0]->v;
  }

  if($maxPoblation > 50000){ //rango superior
    $r2Query = 'SELECT POW(CORR(factorX,factorY), 2) ' .
        'FROM (' . $comboQueryR3 . ')';
    $query->setQuery($r2Query);
    //Se ejecuta la query
    $results = $jobs->query($projectNumber, $query);
    //Se almacena el coeficiente para el rango de población superior
    $r2s['r2_3'] = $results->rows[0]->f[0]->v;
  }

  //Se prepara las consultas para el cálculo de regresiones lineales dentro de cada rango 
  //de población con coeficientes de determinación no nulos
  $regressions = array(
    'reg1' => null,
    'reg2' => null,
    'reg3' => null
  );

  if(($r2s['r2_1'] != null) and ($r2s['r2_1'] >= $minR2)){ //rango inferior
    $regQuery = 'SELECT covar_pop(factorX,factorY)/var_pop(factorX) as beta, ' .
          'avg(factorY) - (covar_pop(factorX,factorY)/var_pop(factorX)) * avg(factorX) as alpha ' .
        'FROM (' . $comboQueryR1 . ')';
    $query->setQuery($regQuery);
    //Se ejecuta la query
    $results = $jobs->query($projectNumber, $query);
    //Se almacena el alpha y beta de la función de regresión lineal obtenida para el rango de población inferior
    $regressions['reg1'] = array('beta' => $results->rows[0]->f[0]->v, 'alpha' => $results->rows[0]->f[1]->v);
  }

  if(($r2s['r2_2'] != null) and ($r2s['r2_2'] >= $minR2)){ //rango medio
    $regQuery = 'SELECT covar_pop(factorX,factorY)/var_pop(factorX) as beta, ' .
              'avg(factorY) - (covar_pop(factorX,factorY)/var_pop(factorX)) * avg(factorX) as alpha ' .
            'FROM (' . $comboQueryR2 . ')';
        $query->setQuery($regQuery);
        //Se ejecuta la query
        $results = $jobs->query($projectNumber, $query);
        //Se almacena el alpha y beta de la función de regresión lineal obtenida para el rango de población medio
        $regressions['reg2'] = array('beta' => $results->rows[0]->f[0]->v, 'alpha' => $results->rows[0]->f[1]->v);
  }

  if(($r2s['r2_3'] != null) and ($r2s['r2_3'] >= $minR2)){ //rango superior
    $regQuery = 'SELECT covar_pop(factorX,factorY)/var_pop(factorX) as beta, ' .
              'avg(factorY) - (covar_pop(factorX,factorY)/var_pop(factorX)) * avg(factorX) as alpha ' .
            'FROM (' . $comboQueryR3 . ')';
        $query->setQuery($regQuery);
        //Se ejecuta la query
        $results = $jobs->query($projectNumber, $query);
        //Se almacena el alpha y beta de la función de regresión lineal obtenida para el rango de población superior
        $regressions['reg3'] = array('beta' => $results->rows[0]->f[0]->v, 'alpha' => $results->rows[0]->f[1]->v);
  }


  //Se construye el objeto respuesta y se envia al cliente
  $resp = array(
    'lista' => $lista,
    'r2s' => $r2s,
    'regressions' => $regressions
  );
  echo json_encode($resp);
  ?>