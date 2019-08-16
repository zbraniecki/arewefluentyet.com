function getDatasetIndexByLabel(chart, label) {
  for (let i in chart.data.datasets) {
    let dataset = chart.data.datasets[i];
    if (dataset.label == label) {
      return i;
    }
  }
  return null;
}

function getDatasetByLabel(chart, label) {
  for (let i in chart.data.datasets) {
    let dataset = chart.data.datasets[i];
    if (dataset.label == label) {
      return dataset;
    }
  }
  return null;
}

function getCategoryForLabel(label) {
  for (let cat in State.theme.categories.labels) {
    if (State.theme.categories.labels[cat] === label) {
      return cat;
    }
  }
  return null;
}

function getBarPosition(chart, index) {
  let x;
  let y;
  if (State.categoriesBar[0] === null) {
    let meta = chart.getDatasetMeta(0);
    x = meta.data[index]._model.x;
    y = chart.chartArea.bottom;
  } else {
    let idx0 = State.categoriesBar[0];
    let meta = chart.getDatasetMeta(idx0);
    x = meta.data[index]._model.x;
    y = meta.data[index]._model.y;
  }
  var meta2 = chart.getDatasetMeta(State.categoriesBar[1]);
  var x2 = meta2.data[index]._model.x;
  var y2 = meta2.data[index]._model.y;
  return [[x, y], [x2, y2]];
}

function getBarCategories(start = 0, end = 0) {
  let result = [];
  for (let idx in State.categories) {
    if ((State.categories[0] === null || idx >= State.categoriesBar[0] + start) && (State.categoriesBar[1] === null || idx < State.categoriesBar[1] + end)) {
      result.push(State.categories[idx]);
    }
  }
  return result;
}

function getPrevCategory(category) {
  let idx = State.categories.indexOf(category);
  if (idx <= 0) {
    return null;
  }
  return State.categories[idx - 1];
}