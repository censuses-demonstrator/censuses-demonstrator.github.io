function objectEquals(x, y) {
    'use strict';

    if (x === null || x === undefined || y === null || y === undefined) { return x === y; }
    // after this just checking type of one would be enough
    if (x.constructor !== y.constructor) { return false; }
    // if they are functions, they should exactly refer to same one (because of closures)
    if (x instanceof Function) { return x === y; }
    // if they are regexps, they should exactly refer to same one (it is hard to better equality check on current ES)
    if (x instanceof RegExp) { return x === y; }
    if (x === y || x.valueOf() === y.valueOf()) { return true; }
    if (Array.isArray(x) && x.length !== y.length) { return false; }

    // if they are dates, they must had equal valueOf
    if (x instanceof Date) { return false; }

    // if they are strictly equal, they both need to be object at least
    if (!(x instanceof Object)) { return false; }
    if (!(y instanceof Object)) { return false; }

    // recursive object equality check
    var p = Object.keys(x);
    return Object.keys(y).every(function (i) { return p.indexOf(i) !== -1; }) &&
        p.every(function (i) { return objectEquals(x[i], y[i]); });
}

function levenshtein(a, b)
{
  function _min(d0, d1, d2, bx, ay)
  {
    return d0 < d1 || d2 < d1
        ? d0 > d2
            ? d2 + 1
            : d0 + 1
        : bx === ay
            ? d1
            : d1 + 1;
  }

  if (a === b) {
    return 0;
  }

  if (a.length > b.length) {
    var tmp = a;
    a = b;
    b = tmp;
  }

  var la = a.length;
  var lb = b.length;

  while (la > 0 && (a.charCodeAt(la - 1) === b.charCodeAt(lb - 1))) {
    la--;
    lb--;
  }

  var offset = 0;

  while (offset < la && (a.charCodeAt(offset) === b.charCodeAt(offset))) {
    offset++;
  }

  la -= offset;
  lb -= offset;

  if (la === 0 || lb < 3) {
    return lb;
  }

  var x = 0;
  var y;
  var d0;
  var d1;
  var d2;
  var d3;
  var dd;
  var dy;
  var ay;
  var bx0;
  var bx1;
  var bx2;
  var bx3;

  var vector = [];

  for (y = 0; y < la; y++) {
    vector.push(y + 1);
    vector.push(a.charCodeAt(offset + y));
  }

  var len = vector.length - 1;

  for (; x < lb - 3;) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    bx1 = b.charCodeAt(offset + (d1 = x + 1));
    bx2 = b.charCodeAt(offset + (d2 = x + 2));
    bx3 = b.charCodeAt(offset + (d3 = x + 3));
    dd = (x += 4);
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      ay = vector[y + 1];
      d0 = _min(dy, d0, d1, bx0, ay);
      d1 = _min(d0, d1, d2, bx1, ay);
      d2 = _min(d1, d2, d3, bx2, ay);
      dd = _min(d2, d3, dd, bx3, ay);
      vector[y] = dd;
      d3 = d2;
      d2 = d1;
      d1 = d0;
      d0 = dy;
    }
  }

  for (; x < lb;) {
    bx0 = b.charCodeAt(offset + (d0 = x));
    dd = ++x;
    for (y = 0; y < len; y += 2) {
      dy = vector[y];
      vector[y] = dd = _min(dy, d0, dd, bx0, vector[y + 1]);
      d0 = dy;
    }
  }

  return dd;
};
 
// Navigation

$("#query-btn").click(function() {
  $("#queryModal").modal("show");
  $(".navbar-collapse.in").collapse("hide");
  return false;
});

// Select year and load PDF

function addOption(year) {
  var optionElement = document.createElement("option");
  optionElement.setAttribute("value", String(year));
  optionElement.appendChild(document.createTextNode(String(year)));
  if (year == 1832) {
    optionElement.setAttribute("selected", true);
  }
  document.getElementById("select_year").appendChild(optionElement);
}

for (i=1805; i <= 1813; i++) { addOption(i); }
addOption(1832);
for (i=1835; i <= 1898; i++) { addOption(i); }

var currentPage = 1;
var numPages = 152;
var viewer = OpenSeadragon({
    id: "slide",
    tileSources: {
        type: 'image',
        url:  'https://raw.githubusercontent.com/censuses-demonstrator/censuses-demonstrator.github.io/master/data/jpg/1832-' + (currentPage-1).toString().padStart(3, "0") + '.jpg',
        crossOriginPolicy: 'RPetitpierre',
        ajaxWithCredentials: false
    },
    showNavigationControl: false,
    smoothTileEdgesMinZoom: 1,
    animationTime: 1,
    opacity: 1,
  });

function render() {
  viewer.open({
        type: 'image',
        url:  'https://raw.githubusercontent.com/censuses-demonstrator/censuses-demonstrator.github.io/master/data/jpg/1832-' + (currentPage-1).toString().padStart(3, "0") + '.jpg',
        crossOriginPolicy: 'RPetitpierre',
        ajaxWithCredentials: false
    });
}

function selectYearUpdate() {
  
  let selectedYear = document.getElementById("select_year")[document.getElementById("select_year").selectedIndex]['label'];
  render();
}

selectYearUpdate();

// Change page

document.getElementById('go_previous')
  .addEventListener('click', (e) => {
  if(currentPage == 1) 
  return;
      
  currentPage -= 1;
  document.getElementById("current_page").value = currentPage;
  render();
});


document.getElementById('go_next')
  .addEventListener('click', (e) => {
  if(currentPage > numPages-1) 
  return;
        
  currentPage += 1;
  document.getElementById("current_page").value = currentPage;
  render();
});


function changePage(desiredPage) {

  if(desiredPage >= 1 && desiredPage <= numPages) {
    currentPage = desiredPage;
    document.getElementById("current_page").value = desiredPage;
    render();
  }
}

document.getElementById('current_page')
  .addEventListener('keypress', (e) => {

  // Get key code
  var code = (e.keyCode ? e.keyCode : e.which);

  // If key code matches that of the Enter key
  if(code == 13) {
    var desiredPage = document.getElementById('current_page').valueAsNumber;                
    changePage(desiredPage)
  }
});

function capitalize(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function autocomplete(inp, arr) {
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/
  inp.addEventListener("input", function(e) {
      var a, b, i, val = this.value;
      /*close any already open lists of autocompleted values*/
      closeAllLists();
      if (!val) { return false;}
      currentFocus = -1;
      /*create a DIV element that will contain the items (values):*/
      a = document.createElement("DIV");
      a.setAttribute("id", this.id + "autocomplete-list");
      a.setAttribute("class", "autocomplete-items");
      /*append the DIV element as a child of the autocomplete container:*/
      this.parentNode.appendChild(a);
      /*for each item in the array...*/

      let maxDisplay = 10;
      let counter = 0;
      for (i = 0; i < arr.length; i++) {
        /*check if the item starts with the same letters as the text field value:*/
        if ((arr[i].substr(0, val.length).toLowerCase() == val.toLowerCase()) && (counter < maxDisplay)) {
          /*create a DIV element for each matching element:*/
          b = document.createElement("DIV");
          /*make the matching letters bold:*/
          b.innerHTML = "<strong>" + capitalize(arr[i].substr(0, val.length)) + "</strong>";
          b.innerHTML += arr[i].substr(val.length);
          /*insert a input field that will hold the current array item's value:*/
          b.innerHTML += "<input type='hidden' value='" + capitalize(arr[i]) + "'>";
          /*execute a function when someone clicks on the item value (DIV element):*/
          b.addEventListener("click", function(e) {
            /*insert the value for the autocomplete text field:*/
            inp.value = this.getElementsByTagName("input")[0].value;
            /*close the list of autocompleted values,
            (or any other open lists of autocompleted values:*/
            closeAllLists();
          });
          a.appendChild(b);
          ++counter;
        }
      }
  });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function(e) {
      var x = document.getElementById(this.id + "autocomplete-list");
      if (x) x = x.getElementsByTagName("div");
      if (e.keyCode == 40) {
        /*If the arrow DOWN key is pressed,
        increase the currentFocus variable:*/
        currentFocus++;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 38) { //up
        /*If the arrow UP key is pressed,
        decrease the currentFocus variable:*/
        currentFocus--;
        /*and and make the current item more visible:*/
        addActive(x);
      } else if (e.keyCode == 13) {
        /*If the ENTER key is pressed, prevent the form from being submitted,*/
        e.preventDefault();
        if (currentFocus > -1) {
          /*and simulate a click on the "active" item:*/
          if (x) x[currentFocus].click();
        }
      }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    var x = document.getElementsByClassName("autocomplete-items");
    for (var i = 0; i < x.length; i++) {
      if (elmnt != x[i] && elmnt != inp) {
      x[i].parentNode.removeChild(x[i]);
    }
  }
}
/*execute a function when someone clicks in the document:*/
document.addEventListener("click", function (e) {
    closeAllLists(e.target);
});
}

function initRequest(requestURL) {

  var request = new XMLHttpRequest();
  request.open('GET', requestURL);
  request.responseType = 'json';
  request.send();

  return request;
}

var request_completion = initRequest('http://127.0.0.1:8080/data/completion.json');
request_completion.onload = function() {
  var jsonObject = request_completion.response;
  autocomplete(document.getElementById("streetInput"), jsonObject['streets']);
  autocomplete(document.getElementById("ownerInput"), jsonObject['names']);
  autocomplete(document.getElementById("surnameInput"), jsonObject['surnames']);
  autocomplete(document.getElementById("lastnameInput"), jsonObject['names']);
  autocomplete(document.getElementById("birthNameInput"), jsonObject['names']);
  autocomplete(document.getElementById("vocationInput"), jsonObject['vocation']);
  autocomplete(document.getElementById("originInput"), jsonObject['origins']);
}

var query_form = document.getElementById('queryForm');
var request_censuses = initRequest('http://127.0.0.1:8080/data/censuses.json');
var correspondances = {'nom_rue': 2, 'no_maison': 3, 'proprietaire_nom': 4, 'chef_prenom': 5, 'chef_nom': 6, 'chef_annee_naissance': 8, 'epouse_nom': 7, 'epouse_annee_naissance': 8, 'enfants_dans_la_commune_prenom': 5, 'enfants_annee_naissance': 8, 'chef_origine': 10, 'chef_vocation': 9, 'pensionnaires_prenom': 5, 'pensionnaires_nom': 6, 'pensionnaires_origine': 10, 'pensionnaires_condition': 9}
var columns = Object.keys(correspondances);
var results_span = document.getElementById('queryResults');

function processForm(e) {
    if (e.preventDefault) e.preventDefault();

    let jsonObject = request_censuses.response;

    let subset = $.grep(jsonObject, function( n, i ) {
      return ((n.Year >= query_form[0].value) && (n.Year <= query_form[1].value));
    });

    let score = {};

    for (let k=0; k < columns.length; k++) {
      let col = columns[k];
      let query_value = query_form[correspondances[col]].value.toLowerCase();

      score[col] = $.map(subset, function( n, i ) {

        if (query_value == "") {
          return 0;
        } else {
          let item_score = [];
          for (let j=0; j < n[col].length; j++) {
            if (n[col][j] !== '·') {
              item_score.push(levenshtein(n[col][j], query_value));
            } else {
              item_score.push(6)
            }
          }
          return Math.min(...item_score);
        }        
      });
    }

    let address = score['nom_rue'].map(function (n, i) {
      return n + score['no_maison'][i] + score['proprietaire_nom'][i];
    });

    let family = address.map(function (n, i) {
      return n + score['chef_nom'][i] + score['chef_origine'][i] + score['chef_vocation'][i];
    });

    let parent = family.map(function (n, i) {
      return n + score['chef_prenom'][i] + score['epouse_nom'][i];
    });

    let him = parent.map(function (n, i) {
      return n + score['chef_annee_naissance'][i];
    });

    let her = parent.map(function (n, i) {
      return n + score['epouse_annee_naissance'][i];
    });

    let children = family.map(function (n, i) {
      return n + score['enfants_dans_la_commune_prenom'][i] + score['enfants_annee_naissance'][i];
    });

    let pensioners = address.map(function (n, i) {
      return n + score['pensionnaires_condition'][i] + score['pensionnaires_origine'][i] + score['pensionnaires_nom'][i] + score['pensionnaires_prenom'][i];
    });

    let threshold = 1+(1.5*Math.min(Math.min(...him),Math.min(...her),Math.min(...children),Math.min(...pensioners)));
    $.map(subset, function( n, i ) {
      n['score'] = Math.min(her[i], him[i], children[i], pensioners[i]);
    });
    
    let result_subset = $.grep(subset, function( n, i ) {
      return n.score <= threshold;
    });

    let unique_result = [];
    for (let i=0; i<result_subset.length; i++) {
      let alreadyIn = false;
      for (let j=0; (j<unique_result.length) && (!alreadyIn); j++) {
        if (objectEquals(result_subset[i], unique_result[j])) {
          alreadyIn = true;
        }
      }
      if (!alreadyIn) {
        unique_result.push(result_subset[i]);
      }
    }

    let sorted_result = unique_result.sort(function(a, b) {
      return parseFloat(a.score) - parseFloat(b.score);
    });

    while(results_span.firstChild) {
      results_span.removeChild(results_span.firstChild);
    }

    let text = "<p id=\"resultcount\">" + String(sorted_result.length) + " résultat(s). " + Math.min(sorted_result.length, 100) + " affiché(s).<br></p>";

    for (let i=0; i < Math.min(sorted_result.length, 100); i++) {
      text += "<button id=\"resultbox\" onclick=\"goToEntry(" + String(sorted_result[i].Year) + ',' + String(sorted_result[i].Page) + ")\"><b>" + String(sorted_result[i].Year) + " p. " + String(sorted_result[i].Page + 1) + "</b><br>";
      text += capitalize(String(sorted_result[i].nom_rue[0])) + " " + String(sorted_result[i].no_maison[0]) + "<br>";
      text += capitalize(String(sorted_result[i].chef_prenom[0])) + " " + capitalize(String(sorted_result[i].chef_nom[0])) + "</button>";
    }

    text += '<br><br><br>'

    results_span.innerHTML = text;

    $('#queryModal').modal('hide');

    // You must return false to prevent the default form behavior
    return false;
}

if (query_form.attachEvent) {
    query_form.attachEvent("submit", processForm);
} else {
    query_form.addEventListener("submit", processForm);
}

function goToEntry(year, page) {
  if (page > numPages-1 || page < 1)
  return;

  currentPage = page+1;
  document.getElementById("current_page").value = currentPage;
  render();
}

