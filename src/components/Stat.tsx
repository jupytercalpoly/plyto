import * as React from 'react';
import {
  StatContainerStyle,
  LabelStyle,
  StatStyle
} from '../componentStyle/GraphStyle';

export interface IStatProps {
  statName: string;
  stat: number;
  done: boolean;
}

export class Stat extends React.Component<IStatProps, {}> {
  render() {
    return (
      <div className={StatContainerStyle} key={this.props.statName}>
        <div className={LabelStyle}>
          {this.props.statName
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')}
        </div>
        <div className={StatStyle}>
          <div className="stat">
            {!isNaN(this.props.stat)
              ? this.props.statName === 'accuracy'
                ? Number(this.props.stat * 100).toFixed(2)
                : Number(this.props.stat).toFixed(2)
              : 'NaN'}
          </div>
          {!isNaN(this.props.stat) &&
            this.props.statName === 'accuracy' && <div>%</div>}
        </div>
      </div>
    );
  }
}
