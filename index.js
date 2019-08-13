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

  let max = 0;
  let labels = [
    new Date(2019, 4, 1),
    new Date(2019, 5, 1),
    new Date(2019, 6, 1),
    new Date(2019, 7, 1)
  ];
  let datasets = {
    dtd: {
      label: "DTD",
      backgroundColor: COLORS.dtd,
      data: [10, 10, 8, 5]
    },
    properties: {
      label: "Properties",
      backgroundColor: COLORS.properties,
      data: [10, 10, 10, 5]
    },
    ftl: {
      label: "Fluent",
      backgroundColor: COLORS.fluent,
      data: [0, 5, 5, 10]
    },
    datalabels: {
      color: "#FFCE56"
    }
  };

  return {
    max,
    labels,
    datasets: [
        {
            label: ["Foo", "Faa", "Fii", "Fee"],
            backgroundColor: 'rgb(255, 99, 132)',
            borderColor: 'rgb(255, 255, 255)',
            data: [0, 10, 5, 2]
        }
    ]
  };
}

function create_chart(selector, { max, ...data }) {
//   let draw = Chart.controllers.line.prototype.draw;
//   Chart.controllers.line = Chart.controllers.line.extend({
//     draw: function() {
//       draw.apply(this, arguments);
//       let ctx = this.chart.chart.ctx;
//       let _stroke = ctx.stroke;
//       ctx.stroke = function() {
//         ctx.save();
//         // Points are white
//         if (this.strokeStyle == "#ffffff") {
//           ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
//           ctx.shadowBlur = 5;
//           ctx.shadowOffsetX = 2;
//           ctx.shadowOffsetY = 5;
//         }
//         _stroke.apply(this, arguments);
//         ctx.restore();
//       };
//     }
//   });

  let ctx = document.querySelector(selector).getContext("2d");
  return new Chart(ctx, {
    type: "bar",
    data: {
        labels: ['Jan', 'Feb', 'March', 'April'],
        datasets: [
            {
                type: 'bar',
                label: 'Average',
                backgroundColor: "rgba(255,255,255,0.5)",
                borderWidth: 0,
                data: [[3956, 3956+8354+470], [3956, 3956+8354+470], [3956, 3956+8354+470], [3956, 3956+8354+470]],
                datalabels: {
                    display: true,
                },
            },
            {
                type: 'line',
                label: 'DTD',
                backgroundColor: '#eb3583',
                data: [3956, 3956, 3956, 3956],
                datalabels: {
                    display: false,
                },
            },
            {
                type: 'line',
                label: 'Properties',
                backgroundColor: '#47a0f8',
                data: [8354, 8354, 8354, 8354],
                datalabels: {
                    display: false,
                },
            },
            {
                type: 'line',
                label: 'Fluent',
                backgroundColor: '#66deaa',
                data: [470, 470, 470, 470],
                datalabels: {
                    display: false,
                },
            },
        ]
    },
    options: {
      plugins: {
        datalabels: {
          backgroundColor: 'white',
          borderRadius: 4,
          color: "black",
          font: {
            family: 'icomoon',
            size: 20
          },
          formatter: function(value, context) {
            return "Jan 2018\n\ue9e1 470\n\ue9e5 8354\n\ue9e7 3956";
          }
        }
      },
    //   annotation: {
    //     annotations: [
    //       {
    //         drawTime: "afterDatasetsDraw",
    //         type: "box",
    //         xMin: new Date(2019, 6, 1),
    //         xMax: new Date(2019, 6, 1),
    //         yMin: 8,
    //         yMax: 23,
    //         xScaleID: "x-axis-0",
    //         yScaleID: "y-axis-0",
    //         borderWidth: 5,
    //         borderColor: "rgba(255, 255, 255, 0.5)"
    //       }
    //     ]
    //   },
      animation: {
        duration: 0
      },
      scales: {
        yAxes: [
          {
            stacked: true,
            display: true,
            color: "#ffffff",
            lineWidth: 3,
          }
        ],
        xAxes: [
          {
            display: true,
            barThickness: 3,
            maxBarThickness: 3,
            // type: "time",
            // time: {
            //   unit: "month"
            // }
          }
        ]
      },
      tooltips: {
        enabled: false,
      },
      elements: {
        point: {
          borderColor: "#ffffff",
          borderWidth: 3,
          hoverBorderWidth: 3,
          hoverRadius: 5,
          hoverBorderColor: "#ffffff",
          radius: 5
        }
      }
    }
  });
}
