import * as React from 'react';
import { CommandRegistry } from '@phosphor/commands';
import {
  progressBarStyle,
  buttonStyle,
  progessBarContainerStyle,
  progressContainerStyle,
  statusStyle
} from '../componentStyle/statusStyle';

export interface IStatusProps {
  overallComplete: number;
  stepComplete: number;
  done: boolean;
  epoch: number;
  commands: CommandRegistry;
}

export class Status extends React.Component<IStatusProps, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={statusStyle}>
        <div className={progressContainerStyle}>
          <ProgressBar statName={'Overall'} stat={this.props.overallComplete} />
          <ProgressBar
            statName={'Epoch ' + this.props.epoch}
            stat={this.props.stepComplete}
          />
        </div>
        <button
          className={buttonStyle}
          onClick={() =>
            this.props.commands.execute('machinelearning:open-new')
          }
        />
      </div>
    );
  }
}

export interface IProgressBarProps {
  statName: string;
  stat: number;
}

export class ProgressBar extends React.Component<IProgressBarProps, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={progessBarContainerStyle}>
        <div className="label">{this.props.statName}</div>
        <div className={progressBarStyle(this.props.stat)}>
          <div className="progress" />
        </div>
      </div>
    );
  }
}