const isDashboard = (new URL(document.location)).searchParams.has("dashboard");

const State = {
  aspectMode: null,
  sizeMode: "large",
  dashboard: isDashboard,
  theme: {
    main: {
      font: {
        family: "Fira Sans",
        color: "#343434",
        weight: 400,
      },
      background: "white",
    },
    categories: {
      colors: {
        ftl: "#3bddaa",
        dtd: "#ed0083",
        properties: "#45a1ff",
        ini: "brown",
        inc: "purple",
      },
      labels: {
        ftl: "Fluent",
        dtd: "DTD",
        properties: "Properties",
        ini: ".ini",
        inc: ".inc",
      },
    },
    axes: {
      font: {
        size: {
          small: 12,
          large: 16
        },
        color: "#909090",
      },
      padding: {
        y: {
          large: 7,
          small: 5,
        },
        x: 0,
      },
    },
    title: {
      font: {
        size: {
          large: 17,
          weight: 500,
          color: "#737373",
        }
      }
    },
    datalabels: {
      title: {
        font: {
          size: {
            large: 15,
            small: 11,
          },
          style: 500,
        },
      },
      labels: {
        font: {
          size: {
            large: 14,
            small: 10,
          },
          style: 400,
        },
      },
      background: "white",
      border: {
        radius: 5,
      }
    },
    points: {
      color: "#ffffff",
      shadow: {
        color: "rgba(0, 0, 0, 0.22)",
        blur: 7,
        offsetX: 1,
        offsetY: 1,
      },
      border: {
        width: 2,
      },
      radius: 4,
    },
    bar: {
      color: "rgba(255, 255, 255, 0.7)",
      width: 1,
    }
  },
  categories: isDashboard ? ["dtd", "properties", "ftl"] : ["ini", "inc", "dtd", "properties", "ftl"],
  // categories: ["dtd", "ftl"],
  categoriesBar: isDashboard ? [0, 3] : [2, 4],
  // categoriesBar: [null, 1],
  charts: []
};

const Page = {
  getTitlePosition(aspectMode = State.aspectMode, sizeMode = State.sizeMode) {
    return State.dashboard && (sizeMode == "large" || aspectMode == "heightLimited")
      ? "left"
      : "top";
  },
  getTitleFontSize(aspectMode = State.aspectMode, sizeMode = State.sizeMode) {
    return State.theme.title.font.size.large;
  },
  getYAxisPadding(aspectMode = State.aspectMode, sizeMode = State.sizeMode) {
    return sizeMode == "large" ? State.theme.axes.padding.y.large : State.theme.axes.padding.y.small;
  },
  getChartFontSize(aspectMode = State.aspectMode, sizeMode = State.sizeMode) {
    return sizeMode == "large"
      ? State.theme.axes.font.size.large
      : State.theme.axes.font.size.small;
  },
  getDatalabelsTitleFontSize(aspectMode = State.aspectMode, sizeMode = State.sizeMode) {
    return sizeMode == "large"
      ? State.theme.datalabels.title.font.size.large
      : State.theme.datalabels.title.font.size.small;
  },
  getDatalabelsLabelFontSize(aspectMode = State.aspectMode, sizeMode = State.sizeMode) {
    return sizeMode == "large"
      ? State.theme.datalabels.labels.font.size.large
      : State.theme.datalabels.labels.font.size.small;
  },
  shouldDisplayLegend(aspectMode = State.aspectMode, sizeMode = State.sizeMode) {
    return sizeMode == "small";
  }
};

function layout() {
  let side = document.getElementById("side");
  let footer = document.getElementById("footer");

  let desc = document.getElementById("desc");

  if (State.dashboard) {
    side.prepend(desc);
    document.body.classList.add("dashboard");
  } else {
    footer.prepend(desc);
    document.body.classList.remove("dashboard");
  }
}

function updateAspectMode() {
  let vwRatio = window.innerWidth / window.innerHeight;
  let vmin = Math.min(window.innerWidth, window.innerHeight);

  let newSizeMode = vmin < 500 ? "small" : "large";
  let newAspectMode = vwRatio >= 2 ? "heightLimited" : "widthLimited";

  if (State.sizeMode !== newSizeMode) {
    updateFontSize(newSizeMode);
    document.body.classList.remove(State.sizeMode);
    document.body.classList.add(newSizeMode);
    State.sizeMode = newSizeMode;
  }

  if (State.sizeMode !== newSizeMode || State.aspectMode !== newAspectMode) {
    updateChart(newAspectMode, newSizeMode);
  }

  if (State.aspectMode !== newAspectMode) {
    document.body.classList.remove(State.aspectMode);
    document.body.classList.add(newAspectMode);
    State.aspectMode = newAspectMode;
  }
}

function updateChart(aspectMode, sizeMode) {
  for (var x in State.charts) {
    State.charts[x].options.title.position = Page.getTitlePosition(aspectMode, sizeMode);
    State.charts[
      x
    ].options.scales.yAxes[0].ticks.padding = Page.getYAxisPadding(aspectMode, sizeMode);
    State.charts[x].update();
  }
}

function updateFontSize(sizeMode) {
  let fontSize = Page.getChartFontSize(undefined, sizeMode);
  for (var x in State.charts) {
    // set/change the font-size
    State.charts[x].options.scales.xAxes[0].ticks.minor.fontSize = fontSize;
    State.charts[x].options.scales.yAxes[0].ticks.minor.fontSize = fontSize;

    // set proper spacing for resized font
    State.charts[x].options.scales.xAxes[0].ticks.fontSize = fontSize;
    State.charts[x].options.scales.yAxes[0].ticks.fontSize = fontSize;
  }
}