import COLORS from "./colors.js";

main();

async function main() {
  create_chart(
    "#strings-chart > canvas",
    await prepare_data("./data/progress.json")
  );
}

async function prepare_data(url) {
  let response = await fetch(url);
  let snapshots = await response.json();

  let all_labels = [];
  let all_points = {
    dtd: [],
    ftl: [],
    inc: [],
    ini: [],
    properties: []
  };

  let ext_re = /\.(\w+)$/;

  let i = 0;

  for (let { date, data } of snapshots) {
    i += 1;
    let total = 0;
    let snapshot = {
      properties: 0,
      dtd: 0,
      ftl: 0,
      inc: 0,
      ini: 0,
    };

    for (let platform of data) {
      for (let [path, count] of Object.entries(platform)) {
        total += count;

        let match = ext_re.exec(path);
        if (match === null) {
          continue;
        }
        let [_, extension] = match;
        if (snapshot.hasOwnProperty(extension)) {
          snapshot[extension] += count;
        }
      }
    }
    let new_label = new Date(date);
    all_labels.push(new_label);
    for (let [format, count] of Object.entries(snapshot)) {
      all_points[format].push(count);
    }
  }

  return {
    data: {
      labels: all_labels,
      datasets: [
        // Data
        {
          type: "line",
          label: ".inc",
          backgroundColor: "purple",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          data: all_points["inc"],
          datalabels: {
            display: false
          }
        },
        {
          type: "line",
          label: ".ini",
          backgroundColor: "brown",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          data: all_points["ini"],
          datalabels: {
            display: false
          }
        },
        {
          type: "line",
          label: "DTD",
          backgroundColor: "#ED0083",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          data: all_points["dtd"],
          datalabels: {
            display: false
          }
        },
        {
          type: "line",
          label: "Properties",
          backgroundColor: "#45A1FF",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          data: all_points["properties"],
          datalabels: {
            display: false
          }
        },
        {
          type: "line",
          label: "Fluent",
          backgroundColor: "#3BDDAA",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          data: all_points["ftl"],

          datalabels: {
            display: function(context) {
              return context.active;
            },
            anchor: 'center',
            align: 'start',
            offset: function(t) {
              let ctx = t.chart.ctx;
              let index = t.dataIndex;
              var meta = t.chart.getDatasetMeta(4);
              var x = meta.data[index]._model.x;
              var y = meta.data[index]._model.y;
              var meta2 = t.chart.getDatasetMeta(2);
              var boxHeight = 6 * 22.4;
              var y2 = meta2.data[index]._model.y;
              let value = Math.round((y2 - y)/2 - (boxHeight/2));
              return value;
            },
            backgroundColor: "white",
            borderRadius: 5,
            padding: {
              left: 8,
              right: 8
            },
            color: "#343434",
            font: {
              family: "Fira Sans",
              style: 400,
              size: 14,
              lineHeight: 1.6
            },
            formatter: function(value, ctx) {
              let chart = ctx.chart;
              let index = ctx.dataIndex;
              let label = ctx.chart.data.labels[index];
              let incVal = ctx.chart.data.datasets[0].data[index];
              let iniVal = ctx.chart.data.datasets[1].data[index];
              let dtdVal = ctx.chart.data.datasets[2].data[index];
              let propVal = ctx.chart.data.datasets[3].data[index];
              let fluentVal = ctx.chart.data.datasets[4].data[index];
              let result = label.toLocaleString("en-US", {
                day: "numeric",
                month: "short",
                year: "numeric"
              });
              result += "\n";
              result += `!F\u2B24 Fluent - ${fluentVal}\n`;
              result += `!P\u2B24 Properties - ${propVal}\n`;
              result += `!D\u2B24 DTD - ${dtdVal}\n`;
              result += `!I\u2B24 .ini - ${iniVal}\n`;
              result += `!C\u2B24 .inc - ${incVal}`;
              return result;
            }
          },
        },
      ]
    }
  };
}

function create_chart(selector, { all_labels, data }) {
  let ctx = document.querySelector(selector).getContext("2d");
  return new Chart(ctx, {
    type: "line",
    data: data,
    options: {
      title: {
        display: true,
        position: "top",
        text: "Number of localizable strings in mozilla-central",
        fontStyle: 500,
        fontSize: 16,
        fontFamily: "Fira Sans",
        fontColor: "#828282"
      },
      scales: {
        yAxes: [
          {
            stacked: true,
            id: "main-y-axis",
            display: true,
            color: "#ffffff",
            gridLines: {
              display: false
            },
            ticks: {
              padding: 15,
              fontStyle: "400",
              fontSize: 15,
              fontFamily: "Fira Sans",
              fontColor: "#909090"
            }
          }
        ],
        xAxes: [
          {
            display: true,
            id: "main-x-axis",
            barThickness: 1,
            type: "time",
            time: {
              unit: "month",
              stepSize: 3
            },
            ticks: {
              lineHeight: 2.4,
              fontStyle: "500",
              fontSize: 16,
              fontFamily: "Fira Sans",
              fontColor: "#909090"
            },
            gridLines: {
              display: false
            }
          }
        ]
      },
      tooltips: {
        enabled: false,
      },
      hover: {
        mode: "index",
        axis: "x",
        intersect: false,
        animationDuration: 0,
        onHover: function(event, elements) {
          if (elements.length == 0) {
            return;
          }
          let index = elements[0]._index;
          let ctx = this.chart.ctx;
          var meta = this.chart.getDatasetMeta(4);
          var x = meta.data[index]._model.x;
          var y = meta.data[index]._model.y;
          var meta2 = this.chart.getDatasetMeta(2);
          var y2 = meta2.data[index]._model.y;

          var boxHeight = 6 * 22.4;
          var boxHeightHalf = boxHeight / 2;
          let distance = y2 - y;

          let distanceHalf = distance / 2;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + distanceHalf - boxHeightHalf);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x, y + distanceHalf + boxHeightHalf);
          ctx.lineTo(x, y + distance);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "#ffffff";
          ctx.stroke();

          ctx.restore();
        },
      },
      elements: {
        point: {
          borderColor: "#ffffff",
          borderWidth: 0,
          hoverBorderWidth: 2,
          hoverRadius: 5,
          hoverBorderColor: "#ffffff",
          radius: 0
        }
      },
      legend: {
        display: false,
      }
    }
  });
}
