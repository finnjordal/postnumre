$(function () {

  var parametre = {};
  parametre.land = "danmark";
  $.ajax({
    url: 'postnumre',
    data: parametre,
    dataType: "json",
    error: postnumrefejl,
    success: vispostnumre
  });

  function vispostnumre (postnumre) {
    $("#postnumre").empty();
    $.each(postnumre, function (i, postnummer) {
      var s = "<li><h3>" + postnummer.postnr + " " + postnummer.navn + "</h3>";
      if (postnummer.gade.length > 0) s += "<p><strong>" + postnummer.gade + "</strong><p>";
      if (postnummer.firma.length > 0) s += "<p>" + postnummer.firma + "<p>";
      $("#postnumre").append(s);
     
    });
    $('#postnumre').listview();
    $('#postnumre').listview('refresh');
  };


  function postnumrefejl (xhr, status, errorThrown) {
    alert("Fejl ved hentning af postnumre: " + xhr.status);
  };

});