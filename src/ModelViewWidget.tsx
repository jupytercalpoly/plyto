import * as React from 'react';
import { ModelViewer } from './components/ModelViewer';
import { ReactElementWidget } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import VegaEmbed from 'vega-embed';

/** Top Level: ReactElementWidget that passes the kernel down to a React Component */
export class ModelViewWidget extends ReactElementWidget {
  constructor(kernel: Kernel.IKernel) {
    super(<ModelViewPanel kernel={kernel} />);
  }
}

/**
 * Interface for the machine learning panel's React props
 */
interface ModelViewPanelProps {
  kernel: Kernel.IKernel;
}

/**
 * Interface for the machine learning panel's React state
 */
interface ModelViewPanelState {
  runTime: number;
  dataSet: Object[];
  dataItem: { [index: string]: number };
  spec: Object[];
  currentStep: number;
  updateGraph: boolean;
  done: boolean;
}

/** Second Level: React Component that stores the state for the entire extension */
class ModelViewPanel extends React.Component<
  ModelViewPanelProps,
  ModelViewPanelState
> {
  state = {
    runTime: 0,
    dataSet: new Array<Object>(),
    spec: new Array<Object>(),
    dataItem: {},
    currentStep: 1,
    updateGraph: true,
    done: false
  };

  constructor(props: any) {
    super(props);
    /** Connect to custom comm with the backend package */
    this.props.kernel.iopubMessage.connect(this.onMessage, this);
  }

  onMessage(sender: Kernel.IKernel, msg: KernelMessage.IIOPubMessage) {
    if (msg.content.target_name === 'plyto') {
      this.setState(prevState => ({
        spec: msg.content.data['spec'],
        runTime: Number(parseInt(msg.content.data['runTime'].toString())),
        currentStep: Number(
          parseInt(msg.content.data['currentStep'].toString())
        ),
        updateGraph: prevState.currentStep !== msg.content.data['currentStep'] || this.state.done,
        dataSet: [...prevState.dataSet, msg.content.data['dataSet']],
        done: msg.content.data['totalProgress'] === 100,
        dataItem: msg.content.data['dataSet']
      }));
    }
  }

  getFormattedRuntime() {
    let hours = Math.floor(this.state.runTime / 3600);
    let minutes = Math.floor((this.state.runTime - hours * 3600) / 60);
    let seconds = Math.floor(this.state.runTime - hours * 3600 - minutes * 60);

    return hours + ':' + minutes + ':' + seconds;
  }

  render() {
    if (this.state.updateGraph && this.state.dataSet.length !== 0) {
      this.state.spec.forEach(spec => {
        VegaEmbed('#' + spec['name'], spec).then(res => {
          res.view.insert('dataSet', this.state.dataSet).run();
        });
      });
    }

    return (
      <ModelViewer
        spec={this.state.spec}
        dataItem={this.state.dataItem}
        done={this.state.done}
        runTime={this.getFormattedRuntime()}
      />
    );
  }
}
