async function loadFile() {
  let response = await fetch(`./data/snapshot.json`);
  let snapshot = await response.json();

  document.getElementById("meta-date").textContent = snapshot.date;
  document.getElementById("meta-rev").textContent = snapshot.revision;

  return prepareData(snapshot.data);
}

function normalizePath(path) {
  let idx = path.indexOf("en-US/");
  if (idx === -1) {
    return path;
  }
  return path.substring(idx + 6);
}

function getTypeFromPath(path) {
  if (path.endsWith(".properties")) {
    return "properties";
  } else if (path.endsWith(".ftl")) {
    return "ftl";
  } else if (path.endsWith(".dtd")) {
    return "DTD";
  } else if (path.endsWith(".ini")) {
    return "ini";
  } else if (path.endsWith(".inc")) {
    return "inc";
  } else {
    throw new Error(`Unknown type for ${path}`);
  }
}

function prepareData(data) {
  let result = {
    data: [],
    columns: [],
    order: null
  };

  for (let entry of data) {
    result.data.push({
      type: getTypeFromPath(entry.file),
      file: normalizePath(entry.file),
      count: entry.count,
    });
  }
  result.columns = [
    { title: "Type", data: "type" },
    { title: "File", data: "file" },
    { title: "Count", data: "count" },
  ];
  result.order = [[2, "desc"]]
  return result;
}

$(document).ready(async function() {
  let { data, columns, order } = await loadFile();
  $("#example").DataTable({
    data,
    columns,
    order,
    pageLength: 25,
    destroy: true
  });
});
