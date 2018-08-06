import * as React from 'react';

import { Stat } from './Stat';

import {
  modelViewerStyle,
  graphsStyle,
  runTimeStyle,
  emptyPanelStyle
} from '../componentStyle/modelViewerStyle';

import { statsContainerStyle, graphStyle } from '../componentStyle/graphStyle';

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
    console.log(this.props)
    return (
      <div className={modelViewerStyle}>
        <div className="before" />
        <div className={statsContainerStyle(this.props.done)}>
          {Object.keys(this.props.dataItem).length === 0 && (
            <div className={emptyPanelStyle}>
              Train a model using Plyto to see statistics and visualizations
            </div>
          )}
          {Object.keys(this.props.dataItem).map(stat => {
            return (
              <Stat
                key={stat}
                statName={stat}
                stat={this.props.dataItem[stat]}
                done={this.props.done}
              />
            );
          })}
          {this.props.done && (
            <div className={runTimeStyle}>
              {'Total Run Time ' + this.props.runTime}
            </div>
          )}
        </div>
        <div className={graphsStyle}>
          {this.props.spec !== [] 
            ? this.props.spec.map(spec => {
              return (
                <div
                  key={spec['name']}
                  id={spec['name']}
                  className={graphStyle}
                />
              );
            })
            : null
          }
        </div>
      </div>
    );
  }
}
