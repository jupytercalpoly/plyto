import * as React from 'react';
import { ModelViewer } from './components/ModelViewer';
import { ReactElementWidget } from '@jupyterlab/apputils';
import { Kernel, /*KernelMessage*/ } from '@jupyterlab/services';
import VegaEmbed from 'vega-embed';

/** Top Level: ReactElementWidget that passes the kernel down to a React Component */
export class ModelViewWidget extends ReactElementWidget {
  constructor(kernel: Kernel.IKernel, title:string) {
    super(<ModelViewPanel kernel={kernel} title={title}/>);
  }
}

/**
 * Interface for the machine learning panel's React props
 */
interface ModelViewPanelProps {
  kernel: Kernel.IKernel;
  title: string;
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
  displayGraph: boolean;
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
    currentStep: 0,
    updateGraph: true,
    displayGraph: true,
    done: false
  };

  constructor(props: any) {
    super(props);
    /** Connect to custom comm with the backend package */
    //this.props.kernel.iopubMessage.connect(this.onMessage, this);
    this.props.kernel.anyMessage.connect(this.onMessage, this);
  }

  componentDidMount() {
    let comm: Kernel.IComm = this.props.kernel.connectToComm('plyto-data', 'plyto-data')
    comm.send({open: true})
  }

  onMessage(sender: Kernel.IKernel, msg: any) {
    msg = msg.msg
    if (msg.channel === 'shell' 
      && msg.content.comm_id === 'plyto-data'
      && !msg.content.data['open']
    ) {
      this.setState({
        runTime: msg.content.data['runTime'],
        dataSet: msg.content.data['dataSet'],
        spec: msg.content.data['spec'],
        dataItem: msg.content.data['dataItem'],
        currentStep: msg.content.data['currentStep'],
        updateGraph: msg.content.data['updateGraph'],
        displayGraph: msg.content.data['displayGraph'],
        done: msg.content.data['done']
      })
    }
  }

  getFormattedRuntime() {
    let hours = Math.floor(this.state.runTime / 3600);
    let minutes = Math.floor((this.state.runTime - hours * 3600) / 60);
    let seconds = Math.floor(this.state.runTime - hours * 3600 - minutes * 60);

    return hours + ':' + minutes + ':' + seconds;
  }

  render() {
    let options = {
      actions: {
        export: true,
        source: false,
        compiled: false,
        editor: false
      }
    };

    if (this.state.updateGraph && this.state.dataSet.length > 0) {
      this.state.spec.forEach(spec => {
        VegaEmbed('#' + spec['name'], spec, options).then(res => {
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
        displayGraph={this.state.displayGraph}
        title={this.props.title}
      />
    );
  }
}
