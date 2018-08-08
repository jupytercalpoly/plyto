import * as React from "react";
import {
  statContainerStyle,
  labelStyle,
  statStyle
} from "../componentStyle/graphStyle";

export interface IStatProps {
  statName: string;
  stat: number;
  done: boolean;
}

export class Stat extends React.Component<IStatProps, {}> {
  render() {
    return (
      <div className={statContainerStyle} key={this.props.statName}>
        <div className={labelStyle}>
          {this.props.statName
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ")}
        </div>
        <div className={statStyle}>
          <div className="stat">
            {!isNaN(this.props.stat)
              ? this.props.statName === "accuracy"
                ? Number(this.props.stat * 100).toFixed(2)
                : Number(this.props.stat).toFixed(2)
              : "NaN"}
          </div>
          {!isNaN(this.props.stat) &&
            this.props.statName === "accuracy" && <div>%</div>}
        </div>
      </div>
    );
  }
}
