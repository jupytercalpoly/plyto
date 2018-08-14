import * as React from 'react';
import { CommandRegistry } from '@phosphor/commands';
import {
  progressBarStyle,
  buttonStyle,
  progessBarContainerStyle,
  progressContainerStyle,
  statusStyle,
  trainingCompleteStyle
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
        {!this.props.done &&
          this.props.overallComplete !== -1 && (
            <div className={progressContainerStyle}>
              <ProgressBar
                statName={'Overall'}
                stat={this.props.overallComplete}
              />
              <ProgressBar
                statName={'Epoch ' + this.props.epoch}
                stat={this.props.stepComplete}
              />
            </div>
          )}
        {this.props.done && (
          <div className={trainingCompleteStyle}>Training complete</div>
        )}
        {this.props.overallComplete === -1 && (
          <div className={trainingCompleteStyle}>Training interrupted</div>
        )}
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
