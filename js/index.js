main();

async function main() {
  layout();
  updateAspectMode();

  let chart = create_chart(
    "#main-chart > canvas",
    await prepare_data("./data/progress.json")
  );
  State.charts.push(chart);

  document.body.style.display = "block";
  window.addEventListener("resize", updateAspectMode);
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
      responsive: true,
      maintainAspectRatio: false,
      title: {
        display: true,
        position: Page.getTitlePosition(),
        text: "Number of localizable strings in mozilla-central",
        fontStyle: State.theme.title.font.weight,
        fontSize: Page.getTitleFontSize(),
        fontFamily: State.theme.main.font.family,
        fontColor: State.theme.main.font.color,
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
            gridLines: {
              display: false
            },
            ticks: {
              padding: Page.getYAxisPadding(),
              fontStyle: State.theme.main.font.weight,
              fontSize: Page.getChartFontSize(),
              fontFamily: State.theme.main.font.family,
              fontColor: "#909090"
            }
          },
          {
            stacked: true,
            id: "background-y-axis",
            display: false,
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
            labels: State.dashboard ? month_labels : all_labels,
            ticks: {
              lineHeight: 2.4,
              fontStyle: State.theme.main.font.weight,
              fontSize: Page.getChartFontSize(),
              fontFamily: State.theme.main.font.family,
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
          }
        ]
      },
      tooltips: {
        enabled: false
      },
      hover: State.dashboard ? false : {
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
          let [[x, y], [x2, y2]] = getBarPosition(this.chart, index);

          var boxHeight = (State.categories.length + 1) * 22.4;
          var boxHeightHalf = boxHeight / 2;
          let distance = Math.abs(y2 - y);
          if (boxHeight >= distance) {
            return;
          }

          let distanceHalf = distance / 2;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - distanceHalf + boxHeightHalf);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(x, y - distanceHalf - boxHeightHalf);
          ctx.lineTo(x, y - distance);
          ctx.lineWidth = 1;
          ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
          ctx.stroke();

          ctx.restore();
        },
      },
      elements: {
        point: {
          borderColor: "white",
          borderWidth: 2,
          hoverBorderWidth: 2,
          hoverRadius: 4,
          hoverBorderColor: "white",
          radius: 4
        }
      },
      legend: {
        display: Page.shouldDisplayLegend(),
        position: "bottom",
        labels: {
          filter: function(l) {
            return State.categories.includes(l.text);
          },
        },
      },
    }
  });
}
