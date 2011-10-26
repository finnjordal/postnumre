$(function () {
	$('#topbar').scrollSpy();
	$('.content').hide();
	$('#home').show();
	$('#topbar a').click(function(event){
		$('#topbar li').removeClass('active');
		$('.content').hide();
		var id= $(event.target).attr('href');
		$(id).show();
		var a= $('#topbar li a[href='+id+']')[0];
		var li= $(a).parent().addClass('active');
	});
	
	$.ajax({
	  url:'postnumre',
	  dataType: "jsonp",
	  error: fejlikommunikation,
	  jsonpCallback: 'getpostnumre'
	});
});

function getpostnumre(postnumre) {
	var data = [];
	$.each(postnumre, function (i, postnummer) {
 		data[i] = postnummer.postnr + " " + postnummer.navn + (postnummer.gade.length > 0?", " + postnummer.gade:"") + (postnummer.firma.length > 0?", " + postnummer.firma:"") ;
	});  
  $('#q').autocomplete({
    source: data,
    minLength: 1
	});
};

fejlikommunikation = function (xhr, status, errorThrown) {
  alert('Timeout fra postnumreservicen');
};
