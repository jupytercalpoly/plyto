import * as React from 'react';

import { Stat } from './Stat';

import {
  ModelViewerStyle,
  GraphsStyle,
  RunTimeStyle
} from '../componentStyle/ModelViewerStyle';

import { StatsContainerStyle, GraphStyle } from '../componentStyle/GraphStyle';

export interface IModelViewerProps {
  spec: Object[];
  dataItem: { [index: string]: any };
  done: boolean;
  runTime: string;
}

export class ModelViewer extends React.Component<IModelViewerProps, {}> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <div className={ModelViewerStyle}>
        <div className="before" />
        <div className={StatsContainerStyle(this.props.done)}>
          {Object.keys(this.props.dataItem).map(stat => {
            return (
              <Stat
                statName={stat}
                stat={this.props.dataItem[stat]}
                done={this.props.done}
              />
            );
          })}
          {this.props.done && (
            <div className={RunTimeStyle}>
              {'Total Run Time ' + this.props.runTime}
            </div>
          )}
        </div>
        <div className={GraphsStyle}>
          {this.props.spec.map(spec => {
            return <div id={spec['name']} className={GraphStyle} />;
          })}
        </div>
      </div>
    );
  }
}
