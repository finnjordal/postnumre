$(function () {
/*	$('#topbar').scrollSpy();
	$('.content').hide();
	var hash= window.location.hash;
	if (hash) $(hash).show(); else $('#home').show();
	$('#topbar a').click(function(event){
		$('#topbar li').removeClass('active');
		$('.content').hide();
		var id= $(event.target).attr('href');
		$(id).show();
		var a= $('#topbar li a[href='+id+']')[0];
		var li= $(a).parent().addClass('active');
	}); */
		
	$.ajax({
	  url:'postnumre',
	  dataType: "json",
	  error: fejlihentallepostnumre,
		success: getpostnumre
	});
	
	$('#søg').click(function(event) {
		event.preventDefault();
		$('#advmessage').empty();
		$('#advresult').empty();
		$('#advmessage').hide();
		$('#tabel').hide();
		var arguments= {};
		var postnr= $.trim($('#postnr').val());
		if (postnr.length>0) arguments['postnr']= postnr;
		var navn= $.trim($('#navn').val());
		if (navn.length>0) arguments['navn']= navn;
		var gade= $.trim($('#gade').val());
		if (gade.length>0) arguments['gade']= gade;
		var firma= $.trim($('#firma').val());
		if (firma.length>0) arguments['firma']= firma;
		var land= $.trim($('#land').val());
		if (land.length>0) arguments['land']= land;
		$.ajax({
		  url:'postnumre',
			data: arguments,
		  dataType: "json",
		  error: fejlisøg,
			success: vispostnumre
		});
	});
	
	$('#reset').click(function(event) {
		$('#advmessage').hide();
		$('#tabel').hide();		
		$('#advmessage').empty();
		$('#advresult').empty();	
	});
	
		
	$('#advmessage').hide();
	$('#tabel').hide();
		
	$('#q').focus();
});


function vispostnumre(postnumre) {
	$('#advmessage').show();
	$('#tabel').show();
	$('#advmessage').empty().append('<p>'+postnumre.length+(postnumre.length==1?' resultat':' resultater')+'</p>');
	$.each(postnumre, function (i, postnummer) {
		$('#advresult').append('<tr><td>'+postnummer.postnr+'</td><td>'+postnummer.navn+'</td><td>'+postnummer.gade+'</td><td>'+postnummer.firma+'</td><td>'+postnummer.land+'</td></tr>');
 	});  
  
};

fejlisøg = function (xhr, status, errorThrown) {	
  var text= xhr.status + " " + xhr.statusText;
	$("#advmessage").empty().show().append("<div class='alert-message error' data-alert='alert'><a class='close' href='#'>×</a><p id='ajaxerror'>Kunne ikke hente postnumre (" + text +")</p></div>");		
};

function getpostnumre(postnumre) {
	var data = [];
	$.each(postnumre, function (i, postnummer) {
 		data[i] = postnummer.postnr + " " + postnummer.navn + (postnummer.gade.length > 0?", " + postnummer.gade:"") + (postnummer.firma.length > 0?", " + postnummer.firma:"") ;
	});  
  $('#q').autocomplete({
    source: data,
    minLength: 1,
    select: function (event, ui) {
      var reg= /(\d+) ([^,$]+)/;
      var result= reg.exec(ui.item.value);
      var postnr= $.trim(result[1]);
      var postnrnavn= $.trim(result[2]);
      $('#result').empty().append('<p>Postnummer: '+postnr+'</p>').append('<p>Postnummernavn: '+postnrnavn+'</p>');
    }
	});
};

fejlihentallepostnumre = function (xhr, status, errorThrown) {	
  var text= xhr.status + " " + xhr.statusText;
	$("#søgmessage").append("<div class='alert-message error' data-alert='alert'><a class='close' href='#'>×</a><p id='ajaxerror'>Kunne ikke hente postnumre (" + text +")</p></div>");		
};
