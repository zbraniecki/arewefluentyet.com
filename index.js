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
    bar: [],
    dtd: [],
    ftl: [],
    properties: []
  };
  let month_labels = [];
  let month_points = {
    bar: [],
    dtd: [],
    ftl: [],
    properties: []
  };
  let month_bars = [];

  let ext_re = /\.(\w+)$/;

  let i = 0;

  for (let { date, data } of snapshots) {
    i += 1;
    let total = 0;
    let snapshot = {
      properties: 0,
      dtd: 0,
      ftl: 0
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

    let quarter = 1000 * 60 * 60 * 24 * 30 * 3;

    if (
      i == snapshots.length ||
      (month_labels.length < 1 ||
      month_labels[month_labels.length - 1].getTime() + quarter <=
        new_label.getTime())
    ) {
        if (i === snapshots.length) {
            month_labels.pop();
            month_points['dtd'].pop();
            month_points['properties'].pop();
            month_points['ftl'].pop();
            month_bars.pop();
        }
      month_labels.push(new_label);
      for (let [format, count] of Object.entries(snapshot)) {
        month_points[format].push(count);
      }
        month_bars.push([
          snapshot["dtd"],
          snapshot["dtd"] + snapshot["properties"] + snapshot["ftl"],
          new_label,
          snapshot["dtd"],
          snapshot["properties"],
          snapshot["ftl"]
        ]);
    }
  }

  return {
    all_labels: all_labels,
    month_labels: month_labels,
    data: {
      datasets: [
        // Data
        {
          type: "line",
          label: "DTD",
          backgroundColor: "#ED0083",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          yAxisID: "background-y-axis",
          xAxisID: "background-x-axis",
          data: all_points["dtd"],
          datalabels: {
            display: false
          },
          pointRadius: 0,
          pointHoverRadius: 0
        },
        {
          type: "line",
          label: "Properties",
          backgroundColor: "#45A1FF",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          yAxisID: "background-y-axis",
          xAxisID: "background-x-axis",
          data: all_points["properties"],
          datalabels: {
            display: false
          },
          pointRadius: 0,
          pointHoverRadius: 0
        },
        {
          type: "line",
          label: "Fluent",
          backgroundColor: "#3BDDAA",
          borderColor: "rgba(0,0,0,0)",
          borderWidth: 0,
          yAxisID: "background-y-axis",
          xAxisID: "background-x-axis",
          data: all_points["ftl"],
          datalabels: {
            display: false
          },
          pointRadius: 0,
          pointHoverRadius: 0
        },
        // Dots
        {
          type: "line",
          label: "DTD",
          backgroundColor: "#ED0083",
          borderColor: "white",
          pointRadius: 4,
          pointHoverRadius: 4,
          showLine: false,
          tooltips: {
            enabled: false
          },
          data: month_points["dtd"],
          fill: false,
          yAxisID: "main-y-axis",
          xAxisID: "main-x-axis",
          datalabels: {
            display: false
          }
        },
        {
          type: "line",
          label: "Properties",
          backgroundColor: "#45A1FF",
          borderColor: "white",
          pointRadius: 4,
          pointHoverRadius: 4,
          showLine: false,
          tooltips: {
            enabled: false
          },
          data: month_points["properties"],
          fill: false,
          yAxisID: "main-y-axis",
          xAxisID: "main-x-axis",
          datalabels: {
            display: false
          }
        },
        {
          type: "line",
          label: "Fluent",
          backgroundColor: "#3BDDAA",
          borderColor: "white",
          pointRadius: 4,
          pointHoverRadius: 4,
          showLine: false,
          tooltips: {
            enabled: false
          },
          data: month_points["ftl"],
          fill: false,
          yAxisID: "main-y-axis",
          xAxisID: "main-x-axis",
          datalabels: {
            display: false
          }
        },
        {
          type: "line",
          label: "Fake one to make shadow work",
          backgroundColor: "rgba(0,0,0,0)",
          borderColor: "rgba(0,0,0,0)",
          pointRadius: 5,
          pointHoverRadius: 5,
          showLine: false,
          tooltips: {
            enabled: false
          },
          data: [],
          fill: false,
          yAxisID: "main-y-axis",
          xAxisID: "main-x-axis",
          datalabels: {
            display: false
          }
        },
        // Bars
        {
          type: "bar",
          label: "Average",
          yAxisID: "main-y-axis",
          xAxisID: "main-x-axis",
          backgroundColor: "rgba(255,255,255,0.9)",
          hoverBackgroundColor: "rgba(255,255,255,0.9)",
          borderWidth: 0,
          data: month_bars,
          datalabels: {
            display: true,
            anchor: 'center',
            align: ['right', 'center', 'center', 'center', 'center', 'center', 'center',  'left', 'left'],
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
            formatter: function(value, context) {
              if (value === null) {
                return "";
              }
              let result = value[2].toLocaleString("en-US", {
                month: "short",
                year: "numeric"
              });
              result += "\n";
              result += `!F\u2B24 ${value[5]}\n`;
              result += `!P\u2B24 ${value[4]}\n`;
              result += `!D\u2B24 ${value[3]}`;
              return result;
            }
          }
        },
      ]
    }
  };
}

function create_chart(selector, { all_labels, month_labels, data }) {
  let draw = Chart.controllers.line.prototype.draw;
  Chart.controllers.line = Chart.controllers.line.extend({
    draw: function(ease) {
      draw.call(this, ease);
      let ctx = this.chart.chart.ctx;
      let _stroke = ctx.stroke;
      ctx.stroke = function() {
        ctx.save();
        // Points are white
        if (this.strokeStyle == "#ffffff") {
          ctx.shadowColor = "rgba(0, 0, 0, 0.22)";
          ctx.shadowBlur = 1;
          ctx.shadowOffsetX = 1;
          ctx.shadowOffsetY = 1;
        }
        _stroke.apply(this, arguments);
        ctx.restore();
      };
    }
  });

  let ctx = document.querySelector(selector).getContext("2d");
  return new Chart(ctx, {
    data: data,
    options: {
      title: {
        display: true,
        position: "left",
        text: "Number of localizable strings in mozilla-central",
        fontStyle: 500,
        fontSize: 16,
        fontFamily: "Fira Sans",
        fontColor: "#828282"
      },
      animation: {
        duration: 0
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
              fontColor: "#909090",
            }
          },
          {
            stacked: true,
            id: "background-y-axis",
            display: false,
            color: "#ffffff"
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
            labels: month_labels,
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
          },
          {
            display: false,
            id: "background-x-axis",
            type: "time",
            time: {
              unit: "month",
              stepSize: 3
            },
            labels: all_labels
          }
        ]
      },
      tooltips: {
        enabled: false
      },
      elements: {
        point: {
          borderColor: "#ffffff",
          borderWidth: 2,
          hoverBorderWidth: 2,
          hoverRadius: 5,
          hoverBorderColor: "#ffffff",
          radius: 0
        }
      },
      legend: {
        display: false
      }
    }
  });
}
