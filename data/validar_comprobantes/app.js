app.controller('validar_comprobantesController', function ($scope, $route,$http) {

	$scope.$route = $route;
	$("#loading2").css("display","none");
	var d = new Date();
	var currDate = d.getDate();
	var currMonth = d.getMonth() + 1;
	var currYear = d.getFullYear();
	var dateStr = currDate + "/" + currMonth + "/" + currYear;
	
	jQuery(function($) {
		// tooltip
		$('[data-toggle="tooltip"]').tooltip();
		// fin

		// estilos select2
		$(".select2").css({
			width: '100%',
		    allow_single_deselect: true,
		    no_results_text: "No se encontraron resultados",
		}).select2().on("change", function(e) {
			$(this).closest('form').validate().element($(this));
	    });

		$("#select_Estados").select2({
		  	allowClear: true 
		});
		// fin

		if(!ace.vars['touch']) {			
			$('.chosen-select').chosen({allow_single_deselect:true}); 
			$(window)
			.off('resize.chosen')
			.on('resize.chosen', function() {
				$('.chosen-select').each(function() {
					var $this = $(this);
					$this.next().css({'width': $this.parent().width()});
				})
			}).trigger('resize.chosen');
			$(document).on('settings.ace.chosen', function(e, event_name, event_val) {
				if(event_name != 'sidebar_collapsed') return;
				$('.chosen-select').each(function() {
					var $this = $(this);
					$this.next().css({'width': $this.parent().width()});
				})
			});				
		}
	
		var grid_selector = "#grid-table";
	    var pager_selector = "#grid-pager";
	    
	    $(window).on('resize.jqGrid', function() {		    	
	        $(grid_selector).jqGrid('setGridWidth', $(".widget-main").width());
	    });
	    //cambiar el tamaño de la barra lateral collapse/expand
	  	var parent_column = $(grid_selector).closest('[class*="col-"]');
	    $(document).on('settings.ace.jqGrid', function(ev, event_name, collapsed) {
	        if(event_name === 'sidebar_collapsed' || event_name === 'main_container_fixed') {
	            //para dar tiempo a los cambios de DOM y luego volver a dibujar!!!
	            setTimeout(function() {
	                $(grid_selector).jqGrid('setGridWidth', parent_column.width());
	            }, 0);
	        }
	    });

    	jQuery(grid_selector).jqGrid({
	        datatype: "xml",
			colNames:['ID','NUMERO AUTORIZACIÓN','ACCIONES','ESTADO','FECHA EMISION','USUARIO','OFICINA','FECHA AUTORIZACIÓN','RAZON SOCIAL','IDENTIFICACION'],
			colModel:[
				{name:'id',index:'id', align:'left',search:false,editable: true, hidden: true, editoptions: {readonly: 'readonly'}},
				{name:'autorizacion',index:'autorizacion',width:10, hidden:true,search:false},
				{name:'acciones',index:'acciones',align:'center',width:140,frozen:true,search:false},
				{name:'estado',index:'estado',width:200,frozen:true,search:false},					
				{name:'fechaCreacion',index:'fechaCreacion',width:140,align:'center',search:false},
				{name:'usuario',index:'usuario',width:150,search:false},
				{name:'empresa',index:'empresa',width:100},					
				{name:'fechaAutorizacion',index:'fechaAutorizacion', hidden: true,align:'center',width:170,search:false},
				{name:'razonSocial',index:'razonSocial', editrules:{edithidden:true},editable:true, width:180},
				{name:'identificacion',index:'identificacion', align:'center',editrules:{edithidden:true},editable:true, width:100},
			],
			rowNum:10,
	       	height: 410, 
	        rowList:[10,20,30],
	        pager : pager_selector,
	        sortname: 'id',
	        sortorder: 'asc',
	        rownumbers: true,
	        shrinkToFit: true,
	        scrollerbar:true,
	        autoencode: false,
	        altRows: true,		       
	        viewrecords: true,
	        loadComplete: function() {
	            var table = this;
	            setTimeout(function() {
	                styleCheckbox(table);
	                updateActionIcons(table);
	                updatePagerIcons(table);
	                enableTooltips(table);
	                fn_click();		                
	            }, 0);
	        }, 
	    });
   		$(window).triggerHandler('resize.jqGrid'); // cambiar el tamaño para hacer la rejilla conseguir el tamaño correcto
	    function aceSwitch(cellvalue, options, cell) {
	        setTimeout(function() {
	            $(cell).find('input[type=checkbox]')
	            .addClass('ace ace-switch ace-switch-5')
	            .after('<span class="lbl"></span>');
	        }, 0);
	    }
    	//enable datepicker
	    function pickDate(cellvalue, options, cell) {
	        setTimeout(function() {
	            $(cell).find('input[type=text]')
	            .datepicker({format:'yyyy-mm-dd' , autoclose:true}); 
	        }, 0);
	    }
    	//navButtons
    	jQuery(grid_selector).jqGrid('navGrid',pager_selector, {   //navbar options
	        edit: false,
	        editicon: 'ace-icon fa fa-pencil blue',
	        add: false,
	        addicon: 'ace-icon fa fa-plus-circle purple',
	        del: false,
	        delicon: 'ace-icon fa fa-trash-o red',
	        search: true,
	        searchicon: 'ace-icon fa fa-search orange',
	        refresh: true,
	        refreshicon: 'ace-icon fa fa-refresh green',
	        view: true,
	        viewicon: 'ace-icon fa fa-search-plus grey'
	    },
	    {
	    	closeAfterEdit: true,
	        recreateForm: true,
	        viewPagerButtons: false,
	        //overlay:false,
	        beforeShowForm: function(e) {
	            var form = $(e[0]);
	            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
	            style_edit_form(form);
	        },
	        afterSubmit: function(response) {},
	    },
	    {
	        closeAfterAdd: true,
	        recreateForm: true,
	        viewPagerButtons: false,
	        //overlay:false,
	        beforeShowForm: function(e) {
	            var form = $(e[0]);
	            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar')
	            .wrapInner('<div class="widget-header" />')
	            style_edit_form(form);
	        },
	        afterSubmit: function(response) {},
	    },
	    {
	        //delete record form
	        recreateForm: true,
	        //overlay:false,
	        beforeShowForm: function(e) {
	            var form = $(e[0]);
	            if(form.data('styled')) return false;
	            form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
	            style_delete_form(form);
	            form.data('styled', true);
	        },
	        onClick: function(e) {}
	    },
	    {
	        recreateForm: true,
	        //overlay:false,	        
	        afterShowSearch: function(e) {
	            var form = $(e[0]);
	            form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
	            style_search_form(form);
	        },
	        afterRedraw: function(){
	            style_search_filters($(this));
	        },
	        multipleSearch: false,
	        //overlay: false,
	        sopt: ['eq', 'cn'],
	        defaultSearch: 'eq', 
	    },
	    {
	        recreateForm: true,
	        //overlay:false,
	        width: 700,		       
	        beforeShowForm: function(e) {
	            var form = $(e[0]);
	          	form.closest('.ui-jqdialog').find('.ui-jqdialog-title').wrap('<div class="widget-header" />')
	        }
	    })

	    function style_edit_form(form) {
	        form.find('input[name=sdate]').datepicker({format:'yyyy-mm-dd' , autoclose:true})
	        form.find('input[name=stock]').addClass('ace ace-switch ace-switch-5').after('<span class="lbl"></span>'); 

	        var buttons = form.next().find('.EditButton .fm-button');
	        buttons.addClass('btn btn-sm').find('[class*="-icon"]').hide();//ui-icon, s-icon
	        buttons.eq(0).addClass('btn-primary').prepend('<i class="ace-icon fa fa-check"></i>');
	        buttons.eq(1).prepend('<i class="ace-icon fa fa-times"></i>')			        
	        buttons = form.next().find('.navButton a');
	        buttons.find('.ui-icon').hide();
	        buttons.eq(0).append('<i class="ace-icon fa fa-chevron-left"></i>');
	        buttons.eq(1).append('<i class="ace-icon fa fa-chevron-right"></i>');       
	    }

	    function style_delete_form(form) {
	        var buttons = form.next().find('.EditButton .fm-button');
	        buttons.addClass('btn btn-sm btn-white btn-round').find('[class*="-icon"]').hide();//ui-icon, s-icon
	        buttons.eq(0).addClass('btn-danger').prepend('<i class="ace-icon fa fa-trash-o"></i>');
	        buttons.eq(1).addClass('btn-default').prepend('<i class="ace-icon fa fa-times"></i>')
	    }

	    function style_search_filters(form) {
	        form.find('.delete-rule').val('X');
	        form.find('.add-rule').addClass('btn btn-xs btn-primary');
	        form.find('.add-group').addClass('btn btn-xs btn-success');
	        form.find('.delete-group').addClass('btn btn-xs btn-danger');
	    }

	    function style_search_form(form) {
	        var dialog = form.closest('.ui-jqdialog');
	        var buttons = dialog.find('.EditTable')
	        buttons.find('.EditButton a[id*="_reset"]').addClass('btn btn-sm btn-info').find('.ui-icon').attr('class', 'ace-icon fa fa-retweet');
	        buttons.find('.EditButton a[id*="_query"]').addClass('btn btn-sm btn-inverse').find('.ui-icon').attr('class', 'ace-icon fa fa-comment-o');
	        buttons.find('.EditButton a[id*="_search"]').addClass('btn btn-sm btn-purple').find('.ui-icon').attr('class', 'ace-icon fa fa-search');
	    }

	    function beforeDeleteCallback(e) {
	        var form = $(e[0]);
	        if(form.data('styled')) return false;			        
	        form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
	        style_delete_form(form);			        
	        form.data('styled', true);
	    }

	    function beforeEditCallback(e) {
	        var form = $(e[0]);
	        form.closest('.ui-jqdialog').find('.ui-jqdialog-titlebar').wrapInner('<div class="widget-header" />')
	        style_edit_form(form);
	    }

    	function styleCheckbox(table) {}

    	function updateActionIcons(table) {}

    	function updatePagerIcons(table) {
       		var replacement = {
	            'ui-icon-seek-first' : 'ace-icon fa fa-angle-double-left bigger-140',
	            'ui-icon-seek-prev' : 'ace-icon fa fa-angle-left bigger-140',
	            'ui-icon-seek-next' : 'ace-icon fa fa-angle-right bigger-140',
	            'ui-icon-seek-end' : 'ace-icon fa fa-angle-double-right bigger-140'
	        };
	        $('.ui-pg-table:not(.navtable) > tbody > tr > .ui-pg-button > .ui-icon').each(function() {
	            var icon = $(this);
	            var $class = $.trim(icon.attr('class').replace('ui-icon', ''));
	            
	            if($class in replacement) icon.attr('class', 'ui-icon '+replacement[$class]);
	        })
    	}
	    function enableTooltips(table) {
	        $('.navtable .ui-pg-button').tooltip({container:'body'});
	        $(table).find('.ui-pg-div').tooltip({container:'body'});
	    }
	    $(document).one('ajaxloadstart.page', function(e) {
	        $(grid_selector).jqGrid('GridUnload');
	        $('.ui-jqdialog').remove();
	    });
	});

	function fn_click() {	    	
    	$("button.boton").click(function() {
    		id = $(this)['context'].id;	    			    		
    		ids = $(this)['context']['dataset'].ids;
    		idxml = $(this)['context']['dataset'].xml;

    		if(id == "btn_1") {	    			
    			window.open('data/facturacion/comprobantesRetencion/generarPDF.php?id='+ids, '_blank');
    		} else {
    			if(id == "btn_2") {	
    				window.open('data/facturacion/comprobantesRetencion/comprobantes/'+idxml+'.xml','_blank');
    			} else {
    				if(id == "btn_3") {	
    					$("#loading2").css("display","block");

    					$.ajax({
					        type: "POST",
					        url: 'data/facturacion/comprobantesRetencion/validarComprobantes/app.php',
					        data: {
								reenviarCorreo:'reenviarCorreo',
								id: ids,
								aut: idxml
							},
					        dataType: 'json',	
					        success: function(response) {         
					        	if(response == 1) {
					        		$("#loading2").css("display","none");
					        		$('#grid-table').trigger( 'reloadGrid');

					        		$.gritter.add({
										title: 'Mensaje de Información',
										text: '	<span class="fa fa-shield"></span>'
													+' <span> Correo Enviado <span class="text-succes fa fa-spinner fa-spin"></span>',
										image: 'dist/images/email.png', 
										sticky: false,
										time: 3000,												
									});	
					        		$('#grid-table').trigger( 'reloadGrid' );
					        	}		
					        }  					        
					    });  	
    				} else {
    					if(id == "btn_4") {	
    						$("#loading2").css("display","block");

	    					$.ajax({
						        type: "POST",
						        url: 'data/facturacion/comprobantesRetencion/validarComprobantes/app.php',
						        data: {
									generarArchivos:'generarArchivos',
									id: ids,
									aut: idxml
								},
						        dataType: 'json',
						        success: function(response) {         
						        	$("#loading2").css("display","none");
						        	$('#grid-table').trigger( 'reloadGrid');

						        	if(response == 1) {										        		
						        		$.gritter.add({
											title: 'Mensaje de Información',
											text: '	<span class="fa fa-shield"></span>'
													+' <span> Información Enviada <span class="text-succes fa fa-spinner fa-spin"></span>',
											image: 'dist/images/email.png', 
											sticky: false,
											time: 3000,												
										});	
						        	}else{
						        		$.gritter.add({
											title: 'Mensaje de Información',
											text: '	<span class="fa fa-shield"></span>'
													+' <span> Documentos no Generados <span class="text-succes fa fa-spinner fa-spin"></span>',
											image: 'dist/images/file_error.png', 
											sticky: false,
											time: 3000,												
										});		
						        	}		
						        }        
						    });  	
	    				} else {
	    					if(id == "btn_5") {	
	    						$("#loading2").css("display","block");

		    					$.ajax({
							        type: "POST",
							        url: 'data/facturacion/comprobantesRetencion/validarComprobantes/app.php',
							        data: {
										reenviarCorreo:'reenviarCorreo',
										id: ids,
										aut: idxml
									},
							        dataType: 'json',
							        success: function(response) {   
							        	$("#loading2").css("display","none");

							        	if(response == 1) {	
							        		$.gritter.add({
												title: 'Mensaje de Información',
												text: '	<span class="fa fa-shield"></span>'
														+' <span> Correo Enviado <span class="text-succes fa fa-spinner fa-spin"></span>',
												image: 'dist/images/email.png', 
												sticky: false,
												time: 3000,												
											});	
							        		$('#grid-table').trigger('reloadGrid');
							        	}		
							        }        
							    });  	
		    				} else {
		    					if(id == "btn_6") {
			    					$("#loading2").css("display","block");

			    					$.ajax({
								        type: "POST",
								        url: 'data/facturacion/comprobantesRetencion/validarComprobantes/app.php',
								        data: {
											volverValidar:'volverValidar',
											id: ids,
											aut: idxml
										},
								        dataType: 'json',
								        success: function(response) {         
								        	$("#loading2").css("display","none");
								        	$('#grid-table').trigger( 'reloadGrid');

								        	if(response == 1) {							        		
								        		$.gritter.add({
													title: 	'Mensaje de Información',
													text: 	'<span class="fa fa-shield"></span>'+' <span> Información Enviada <span class="text-succes fa fa-spinner fa-spin"></span>',
													image: 	'dist/images/email.png', 
													sticky: false,
													time: 3000,												
												});	
								        	} else {
								        		if(response == 2) {							        		
									        		$.gritter.add({
														title: 	'Mensaje de Información',
														text: 	'<span class="fa fa-shield"></span>'+' <span> Documentos no Generados <span class="text-succes fa fa-spinner fa-spin"></span>',
														image: 	'dist/images/file_error.png', 
														sticky: false,
														time: 3000,												
													});	
									        	} else {
									        		if(response == 3) {							        		
										        		$.gritter.add({
															title: 	'Mensaje de Información',
															text: 	'<span class="fa fa-shield"></span>'+' <span> Correo no Enviado <span class="text-succes fa fa-spinner fa-spin"></span>',
															image: 	'dist/images/mail_warning.png', 
															sticky: false,
															time: 3000,												
														});	
										        	} else {
										        		if(response == 4) {							        		
											        		$.gritter.add({
																title: 	'Mensaje de Información',
																text: 	'<span class="fa fa-shield"></span>'+' <span> Archivo Rechazado Vuelva a firmar <span class="text-succes fa fa-spinner fa-spin"></span>',
																image: 	'dist/images/error_file.png', 
																sticky: false,
																time: 3000,												
															});	
											        	} else {										        								        		
											        		$.gritter.add({
																title: 	'Mensaje de Error',
																text: 	'<span class="fa fa-shield"></span>'+' <span> Error en la base de Datos. Contacte al Administrador <span class="text-succes fa fa-spinner fa-spin"></span>',
																image: 	'dist/images/error_file.png', 
																sticky: false,
																time: 3000,												
															});												        	
											        	}
										        	}
									        	}	
								        	}	
								        }         
								    }); 	
		    					} else {
		    						if(id == "btn_7") {
		    							$("#loading2").css("display","block");

				    					$.ajax({
									        type: "POST",
									        url: 'data/facturacion/comprobantesRetencion/validarComprobantes/app.php',
									        data: {
												errorWebService:'errorWebService',
												id: ids,
												aut: idxml
											},
									        dataType: 'json',
									        success: function(response) {   
									        	$("#loading2").css("display","none");
									        	$('#grid-table').trigger('reloadGrid');

									        	if(response == 1) {							        		
									        		$.gritter.add({
														title: 	'Mensaje de Información',
														text: 	'<span class="fa fa-shield"></span>'+' <span> Información Enviada <span class="text-succes fa fa-spinner fa-spin"></span>',
														image: 'dist/images/email.png', 
														sticky: false,
														time: 3000,												
													});	
									        	} else {
									        		if(response == 2) {							        		
										        		$.gritter.add({
															title: 	'Mensaje de Información',
															text: 	'<span class="fa fa-shield"></span>'+' <span> Documentos no Generados <span class="text-succes fa fa-spinner fa-spin"></span>',
															image: 	'dist/images/file_error.png', 
															sticky: false,
															time: 3000,												
														});	
										        	} else {
										        		if(response == 3) {							        		
											        		$.gritter.add({
																title: 	'Mensaje de Información',
																text: 	'<span class="fa fa-shield"></span>'+' <span> Correo no Enviado <span class="text-succes fa fa-spinner fa-spin"></span>',
																image: 	'dist/images/mail_warning.png', 
																sticky: false,
																time: 3000,												
															});	
											        	} else {
											        		if(response == 4) {							        		
												        		$.gritter.add({
																	title: 	'Mensaje de Información',
																	text: 	'<span class="fa fa-shield"></span>'+' <span> Archivo Rechazado Vuelva a firmar <span class="text-succes fa fa-spinner fa-spin"></span>',
																	image: 	'dist/images/error_file.png', 
																	sticky: false,
																	time: 3000,												
																});	
												        	} else {											        		
												        		$.gritter.add({
																	title: 	'Mensaje de Error',
																	text: 	'<span class="fa fa-shield"></span>'+' <span> Error en la base de Datos. Contacte al Administrador <span class="text-succes fa fa-spinner fa-spin"></span>',
																	image: 	'dist/images/error_file.png', 
																	sticky: false,
																	time: 3000,												
																});													        	
												        	}
											        	}
										        	}	
									        	}	
									        }        
									    }); 
		    						} else {
		    							if(id ="btn_9") {
		    								$("#loading2").css("display","block");

					    					$.ajax({
										        type: "POST",
										        url: 'data/facturacion/comprobantesRetencion/validarComprobantes/app.php',
										        data: {
													generarFirma:'generarFirma',
													id: ids,
													aut: idxml
												},
										        dataType: 'json',
										        success: function(response) {         
										        	$("#loading2").css("display","none");
										        	$('#grid-table').trigger('reloadGrid');

										        	if(response == 1) {							        		
										        		$.gritter.add({
															title: 	'Mensaje de Información',
															text: 	'<span class="fa fa-shield"></span>'+' <span> Información Enviada <span class="text-succes fa fa-spinner fa-spin"></span>',
															image: 	'dist/images/email.png', 
															sticky: false,
															time: 3000,												
														});	
										        	} else {
										        		if(response == 2){							        		
											        		$.gritter.add({
																title: 	'Mensaje de Información',
																text: 	'<span class="fa fa-shield"></span>'+' <span> Documentos no Generados <span class="text-succes fa fa-spinner fa-spin"></span>',
																image: 	'dist/images/file_error.png', 
																sticky: false,
																time: 3000,												
															});	
											        	} else {
											        		if(response == 3) {							        		
												        		$.gritter.add({
																	title: 	'Mensaje de Información',
																	text: 	'<span class="fa fa-shield"></span>'+' <span> Correo no Enviado <span class="text-succes fa fa-spinner fa-spin"></span>',
																	image: 'dist/images/mail_warning.png', 
																	sticky: false,
																	time: 3000,												
																});	
												        	} else {
												        		if(response == 4) {							        		
													        		$.gritter.add({
																		title: 	'Mensaje de Información',
																		text: 	'<span class="fa fa-shield"></span>'+' <span> Archivo Rechazado Vuelva a firmar <span class="text-succes fa fa-spinner fa-spin"></span>',
																		image: 	'dist/images/error_file.png', 
																		sticky: false,
																		time: 3000,												
																	});	
													        	} else {										        								        		
													        		$.gritter.add({
																		title: 	'Mensaje de Error',
																		text: 	'<span class="fa fa-shield"></span>'+' <span> Error en la base de Datos. Contacte al Administrador <span class="text-succes fa fa-spinner fa-spin"></span>',
																		image: 	'dist/images/error_file.png', 
																		sticky: false,
																		time: 3000,												
																	});												        	
													        	}
												        	}
											        	}	
										        	}	
										        }         
										    }); 
				    					}			    							
		    						}	
		    					}
		    				}
	    				}
    					
    				}	
    			}	
    		}
    	});	    	
    }

    $("#btn_buscar").on("click",function() {
		jQuery("#grid-table").jqGrid('setGridParam',{url:"data/validar_comprobantes/xml_comprobantes.php?estado="+$("#select_Estados").val(),page:1}).trigger("reloadGrid");
	});
});