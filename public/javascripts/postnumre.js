$(function () {
	var url = 'http://localhost:3000/postnumre';
	$.getJSON(url, function (postnumre) {
		var data = [];
  	$.each(postnumre, function (i, postnummer) {
   		data[i] = postnummer.navn;
 		});  
	  $('#q').autocomplete({
	    source: data,
	    minLength: 1
		});
	});
});
