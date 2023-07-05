var tables = document.querySelectorAll('table[id^="table"]');
var categoryFilters = document.querySelectorAll('select[id^="categoryFilter"]');
const sortableColumns = document.querySelectorAll(".sortable");

for (var i = 0; i < categoryFilters.length; i++) {
  categoryFilters[i].addEventListener(
    "change",
    filterTableD.bind(null, tables[i], categoryFilters[i])
  );
}

function filterTableD(table, categoryFilter) {
  var categoryValue = categoryFilter.value;
  var rows = table.getElementsByTagName("tr");

  for (var i = 1; i < rows.length; i++) {
    var row = rows[i];
    var category = row.getElementsByTagName("td")[1].textContent;

    if (categoryValue === "" || category === categoryValue) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  }
}

function updateCategoryFilterOptions(table, categoryFilter) {
  var categoryOptions = new Set();

  var rows = table.getElementsByTagName("tr");
  for (var i = 1; i < rows.length; i++) {
    var category = rows[i].getElementsByTagName("td")[1].textContent;
    categoryOptions.add(category);
  }
  categoryFilter.innerHTML = '<option value="">Levels</option>';
  categoryOptions.forEach(function (category) {
    var option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

for (var i = 0; i < tables.length; i++) {
  var table = tables[i];
  var categoryFilter = table.querySelector('select[id^="categoryFilter"]');
  updateCategoryFilterOptions(table, categoryFilter);
}

sortableColumns.forEach((column) => {
  column.addEventListener("click", () => {
    sortTable(column);
  });
});
function sortTable(column) {
  const table = column.closest("table");
  const tbody = table.tBodies[0];
  const rows = Array.from(tbody.querySelectorAll("tr"));

  const sortOrder = column.getAttribute("data-sort");

  const columnIndex = Array.from(column.parentNode.children).indexOf(column);

  rows.sort((rowA, rowB) => {
    const cellA = parseFloat(rowA.cells[columnIndex].textContent.trim());
    const cellB = parseFloat(rowB.cells[columnIndex].textContent.trim());

    if (sortOrder === "asc") {
      return cellA - cellB;
    } else {
      return cellB - cellA;
    }
  });

  rows.forEach((row) => {
    tbody.removeChild(row);
  });

  rows.forEach((row) => {
    tbody.appendChild(row);
  });

  column.setAttribute("data-sort", sortOrder === "asc" ? "desc" : "asc");

  const columns = table.querySelectorAll(".sortable");
  columns.forEach((col) => {
    col.classList.remove("asc", "desc");
  });

  column.classList.add(sortOrder === "asc" ? "asc" : "desc");
}
