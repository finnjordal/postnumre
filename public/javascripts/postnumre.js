$(function () {
	var url = 'http://127.0.0.1:3000/postnumre';
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
