async function prepare_data(url) {
  let response = await fetch(url);
  let snapshots = await response.json();

  let all_labels = [];
  let all_points = {
    bar: [],
  };
  for (let category of State.categories) {
    all_points[category] = [];
  }
  let month_labels = [];
  let month_points = {
    bar: [],
  };
  for (let category of State.categories) {
    month_points[category] = [];
  }
  let month_bars = [];

  let ext_re = /\.(\w+)$/;

  let categoriesWithData = new Set();

  let i = 0;

  for (let { date, data } of snapshots) {
    i += 1;
    let total = 0;
    let snapshot = {};
    for (let category of State.categories) {
      snapshot[category] = 0;
    }

    for (let platform of data) {
      for (let [path, count] of Object.entries(platform)) {
        total += count;

        let match = ext_re.exec(path);
        if (match === null) {
          continue;
        }
        let [_, extension] = match;
        if (State.categories.includes(extension)) {
          categoriesWithData.add(extension);
          snapshot[extension] += count;
        }
      }
    }
    let new_label = new Date(date);
    all_labels.push(new_label);
    for (let [format, count] of Object.entries(snapshot)) {
      all_points[format].push(count);
    }

    let quarter = 1000 * 60 * 60 * 24 * 30 * 3;

    if (
      i == snapshots.length ||
      (month_labels.length < 1 ||
        month_labels[month_labels.length - 1].getTime() + quarter <=
          new_label.getTime())
    ) {
      if (i === snapshots.length) {
        month_labels.pop();
        for (let category of Object.values(month_points)) {
          category.pop();
        }
        month_bars.pop();
      }
      month_labels.push(new_label);
      for (let [format, count] of Object.entries(snapshot)) {
        month_points[format].push(count);
      }

      let barCategories = getBarCategories();
      if (State.categoriesBar[0] !== null) {
        barCategories = barCategories.slice(1);
      }
      let barStart = 0;
      let barEnd = 0;
      let inBar = false;
      for (let category of State.categories) {
        if (!inBar && !barCategories.includes(category)) {
          barStart += snapshot[category];
          barEnd += snapshot[category];
        } else if (barCategories.includes(category)) {
          barEnd += snapshot[category];
          inBar = true;
        }
      }
      month_bars.push([
        barStart,
        barEnd,
        new_label,
      ]);
    }
  }

  for (let name in all_points) {
    if (!categoriesWithData.has(name)) {
      delete all_points[name];
    }
  }

  let datasets = [];
  let barCategories = getBarCategories(null, 1);
  for (category of State.categories) {
    let datalabels =
      State.dashboard || category !== "ftl"
        ? { display: false }
        : {
            display: function(context) {
              return context.active;
            },
            anchor: "center",
            align: "start",
            offset: function(t) {
              let index = t.dataIndex;

              let idx = State.categories.indexOf("ftl");
              let meta = t.chart.getDatasetMeta(idx);
              let ftlY = meta.data[index]._model.y

              let [[x, y], [x2, y2]] = getBarPosition(t.chart, index);
              let distance = Math.abs(y2 - y);
              var boxHeight = (State.categories.length + 1) * 22.4;
              let value = Math.round((y - ftlY) - distance / 2 - boxHeight / 2);
              return value;
            },
            backgroundColor: State.theme.datalabels.background,
            borderRadius: State.theme.datalabels.border.radius,
            padding: {
              left: 8,
              right: 8
            },
            color: State.theme.main.font.color,
            font: {
              family: State.theme.main.font.family,
              style: State.theme.main.font.weight,
              size: 14,
              lineHeight: 1.6
            },
            formatter: function(value, ctx) {
              let chart = ctx.chart;
              let index = ctx.dataIndex;
              let label = ctx.chart.data.labels[index];
              let result = label.toLocaleString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });
              result += "\n";
              let values = [];
              for (let category of State.categories) {
                if (!categoriesWithData.has(category)) {
                  continue;
                }
                let label = State.theme.categories.labels[category];
                let value = getDatasetByLabel(ctx.chart, label).data[index];
                values.push(`! \u2B24 ${label}|${value}`);
              }
              result += values.reverse().join("\n");
              return result;
            }
          };
    datasets.push({
      type: "line",
      label: State.theme.categories.labels[category],
      backgroundColor: State.theme.categories.colors[category],
      borderWidth: 0,
      borderColor: "rgb(0,0,0,0)",
      yAxisID: "main-y-axis",
      xAxisID: "background-x-axis",
      data: all_points[category],
      datalabels: datalabels,
      pointRadius: 0,
      pointHoverRadius: State.dashboard || !barCategories.includes(category) ? 0 : 4
    });
  }

  if (State.dashboard) {
    if (State.categoriesBar[0] === null) {
      datasets.push({
        type: "line",
        label: `start Dots`,
        backgroundColor: State.theme.categories.colors[State.categories[0]],
        borderColor: "white",
        showLine: false,
        tooltips: {
          enabled: false
        },
        data: Array(month_labels.length).fill(0),
        fill: false,
        yAxisID: "background-y-axis",
        xAxisID: "main-x-axis",
        datalabels: {
          display: false
        }
      });
    }
    let barCategories = getBarCategories();
    for (let idx in State.categories) {
      let category = State.categories[idx];
      let inBar = barCategories.includes(category);
      datasets.push({
        type: "line",
        label: `${category} Dots`,
        backgroundColor: inBar ? State.theme.categories.colors[category] : "rgba(0,0,0,0)",
        borderWidth: inBar ? State.theme.points.border.width : 0,
        borderColor: State.theme.points.color,
        showLine: false,
        tooltips: {
          enabled: false
        },
        data: month_points[category],
        fill: false,
        yAxisID: "background-y-axis",
        xAxisID: "main-x-axis",
        datalabels: {
          display: false
        }
      });
    }

    let aligns = ["right"];
    for (let i = 0; i < month_labels.length - 2; i++) {
      aligns.push("center");
    }
    aligns.push("left");
    datasets.push({
      type: "bar",
      label: "Average",
      yAxisID: "main-y-axis",
      xAxisID: "main-x-axis",
      backgroundColor: State.theme.bar.color,
      hoverBackgroundColor: State.theme.bar.color,
      borderWidth: 0,
      data: month_bars,
      datalabels: {
        display: "auto",
        anchor: "center",
        align: aligns,
        backgroundColor: State.theme.datalabels.background,
        borderRadius: State.theme.datalabels.border.radius,
        color: State.theme.main.font.color,
        font: {
          family: State.theme.main.font.family,
          style: State.theme.main.font.weight,
          size: 14,
          lineHeight: 1.6
        },
        padding: {
          left: 8,
        },
        formatter: function(value, ctx) {
          if (value === null) {
            return "";
          }
          let result = value[2].toLocaleString("en-US", {
            month: "short",
            year: "numeric"
          });
          result += "\n";
          let values = [];
          for (let i in State.categories) {
            let category = State.categories[i];
            if (!categoriesWithData.has(category)) {
              continue;
            }
            let label = State.theme.categories.labels[category];
            let value = getDatasetByLabel(ctx.chart, `${category} Dots`).data[ctx.dataIndex];
            values.push(`! \u2B24 ${i}|${value}`);
          }
          result += values.reverse().join("\n");
          return result;
        }
      }
    });
  }

  return {
    all_labels: all_labels,
    month_labels: month_labels,
    data: {
      labels: all_labels,
      datasets: datasets
    }
  };
}
