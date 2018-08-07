import { style } from "typestyle";

export const statusStyle = style({
  height: "24px",
  display: "flex",
  fontSize: "var(--jp-content-font-size0)",
  color: "#EEEEEE"
});

export const progressContainerStyle = style({
  display: "block"
});

export const progessBarContainerStyle = style({
  display: "flex",
  fontSize: "var(--jp-content-font-size0)",

  $nest: {
    "& .label": {
      width: "50px",
      fontSize: "9px"
    }
  }
});

export function progressBarStyle(stat: number) {
  if (stat < 95) {
    return style({
      width: "42px",
      backgroundColor: "var(--jp-content-font-color0)",
      borderRadius: "4px",
      height: "8px",
      marginTop: "3px",

      $nest: {
        "& .progress": {
          width: stat * 0.4,
          backgroundColor: "var(--jp-brand-color2)",
          height: "6px",
          borderRadius: "3px 0px 0px 3px",
          marginTop: "1.5px",
          marginLeft: "1px"
        }
      }
    });
  } else {
    return style({
      width: "42px",
      backgroundColor: "var(--jp-content-font-color0)",
      borderRadius: "4px",
      height: "8px",
      marginTop: "3px",

      $nest: {
        "& .progress": {
          width: stat * 0.4,
          backgroundColor: "var(--jp-brand-color2)",
          height: "6px",
          borderRadius: "3px",
          marginTop: "1.5px",
          marginLeft: "1px"
        }
      }
    });
  }
}

export const buttonStyle = style({
  backgroundImage: "var(--jp-icon-machinelearning)",
  backgroundRepeat: "no-repeat",
  backgroundSize: "100%",
  backgroundColor: "#757575",
  width: "20px",
  height: "20px",
  border: "none",
  outline: "none",
  marginLeft: "13.5px",
  marginTop: "2px"
});

export const trainingCompleteStyle = style({
  marginTop: "3px"
});
