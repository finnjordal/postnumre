$(function () {
	var url = 'postnumre';
	$.getJSON(url, function (postnumre) {
		var data = [];
  	$.each(postnumre, function (i, postnummer) {
   		data[i] = postnummer.postnr + " " + postnummer.navn + (postnummer.gade.length > 0?", " + postnummer.gade:"") + (postnummer.firma.length > 0?", " + postnummer.firma:"") ;
 		});  
	  $('#q').autocomplete({
	    source: data,
	    minLength: 1
		});
	});
});
