<?php 
	if(!isset($_SESSION)){
        session_start();        
    }
	include_once('../../admin/class.php');
	$class = new constante();
	$fecha = $class->fecha_hora();

	// contador tipo impuesto
	$id_tarifa_retencion = 0;
	$resultado = $class->consulta("SELECT max(id) FROM tarifa_retencion");
	while ($row = $class->fetch_array($resultado)) {
		$id_tarifa_retencion = $row[0];
	}
	$id_tarifa_retencion++;
	// fin

	if ($_POST['oper'] == "add") {
		$resultado = $class->consulta("SELECT count(*) FROM tarifa_retencion WHERE codigo = '$_POST[codigo]'");
		while ($row = $class->fetch_array($resultado)) {
			$data = $row[0];
		}

		if ($data != 0) {
			$data = "3";
		} else {
			$resp = $class->consulta("INSERT INTO tarifa_retencion VALUES ('$id_tarifa_retencion','$_POST[tipo_impuesto]','$_POST[codigo]','$_POST[nombre_tarifa_retencion]','$_POST[descripcion]','1','$fecha')");
			$data = "1";
		}
	} else {
	    if ($_POST['oper'] == "edit") {
	    	$resultado = $class->consulta("SELECT count(*) FROM tarifa_retencion WHERE codigo = '$_POST[codigo]' AND id NOT IN ('$_POST[id]')");
			while ($row = $class->fetch_array($resultado)) {
				$data = $row[0];
			}

			if ($data != 0) {
			 	$data = "3";
			} else {
				$resp = $class->consulta("UPDATE tarifa_retencion SET id_tipo_impuesto = '$_POST[tipo_impuesto]',codigo = '$_POST[codigo]',nombre_tarifa_retencion = '$_POST[nombre_tarifa_retencion]',descripcion = '$_POST[descripcion]',fecha_creacion = '$fecha' WHERE id = '$_POST[id]'");
	    		$data = "2";
			}
	    } else {
	    	if ($_POST['oper'] == "del") {
	    		$resp = $class->consulta("UPDATE tarifa_retencion SET estado = '0' WHERE id = '$_POST[id]'");
	    		$data = "4";	
	    	}
	    }
	}

	echo $data;
?>