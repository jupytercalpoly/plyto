import { style } from "typestyle";

export const widgetStyle = style({
  backgroundColor: "var(--jp-layout-color0)",
  overflowY: "scroll"
});

export const modelViewerStyle = style({
  display: "flex",
  flexWrap: "wrap",
  fontFamily: "var(--jp-ui-font-family)",
  fontSize: "var(--jp-content-font-size1)",
  color: "var(--jp-content-font-color0)",

  $nest: {
    "& .before": {
      display: "block",
      width: "100%",
      height: "var(--jp-toolbar-micro-height)",
      background: "var(--jp-toolbar-background)",
      borderBottom: "1px solid var(--jp-toolbar-border-color)",
      boxShadow: "var(--jp-toolbar-box-shadow)",
      zIndex: 1
    }
  }
});

export const graphsStyle = style({
  display: "flex",
  flexWrap: "wrap",
  width: "100%"
});

export const statStyle = style({
  display: "inline-flex",
  margin: "5px 5%",

  $nest: {
    "& span": {
      width: "50%"
    }
  }
});

export const runTimeStyle = style({
  marginLeft: "75px",
  fontSize: "var(--jp-content-font-size2)",
  marginTop: "10px"
});

export const iconClass = style({
  backgroundImage: "var(--jp-icon-machinelearning)",
  backgroundRepeat: "no-repeat",
  backgroundSize: "14px"
});

export const emptyPanelStyle = style({
  textAlign: "center"
});
