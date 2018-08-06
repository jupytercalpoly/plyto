import * as React from 'react';
import { CommandRegistry } from '@phosphor/commands';
import {
  ProgressBarStyle,
  ButtonStyle,
  ProgessBarContainerStyle,
  ProgressContainerStyle,
  StatusStyle
} from '../componentStyle/StatusStyle';

export interface IStatusProps {
  overallComplete: number;
  epochComplete: number;
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
      <div className={StatusStyle}>
        <div className={ProgressContainerStyle}>
          <ProgressBar statName={'Overall'} stat={this.props.overallComplete} />
          <ProgressBar
            statName={'Epoch ' + this.props.epoch}
            stat={this.props.epochComplete}
          />
        </div>
        <button
          className={ButtonStyle}
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
      <div className={ProgessBarContainerStyle}>
        <div className="label">{this.props.statName}</div>
        <div className={ProgressBarStyle(this.props.stat)}>
          <div className="progress" />
        </div>
      </div>
    );
  }
}
