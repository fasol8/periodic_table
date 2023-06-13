var ascending = true;

function sortTable(columnIndex) {
  var table, rows, switching, i, x, y, shouldSwitch;
  table = document.getElementById("myTable");
  switching = true;

  while (switching) {
    switching = false;
    rows = table.rows;

    for (i = 1; i < (rows.length - 1); i++) {
      shouldSwitch = false;
      x = rows[i].getElementsByTagName("td")[columnIndex];
      y = rows[i + 1].getElementsByTagName("td")[columnIndex];

      var xValue = x.innerHTML.toLowerCase();
      var yValue = y.innerHTML.toLowerCase();

      if (ascending) {
        if (xValue > yValue) {
          shouldSwitch = true;
          break;
        }
      } else {
        if (xValue < yValue) {
          shouldSwitch = true;
          break;
        }
      }
    }

    if (shouldSwitch) {
      rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
      switching = true;
    }
  }

  // Remove existing sorting classes
  var headers = document.getElementsByClassName("sortable");
  for (var j = 0; j < headers.length; j++) {
    headers[j].classList.remove("asc", "desc");
  }

  // Add sorting class to the current header
  var currentHeader = headers[columnIndex];
  currentHeader.classList.add(ascending ? "asc" : "desc");

  ascending = !ascending; // Toggle the sorting order
}