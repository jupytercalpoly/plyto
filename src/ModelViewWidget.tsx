import * as React from 'react';
import { ModelViewer } from './components/ModelViewer';
import { ReactElementWidget } from '@jupyterlab/apputils';
import { Kernel /*KernelMessage*/ } from '@jupyterlab/services';
import { INotebookTracker } from '@jupyterlab/notebook';
import VegaEmbed from 'vega-embed';

/** Top Level: ReactElementWidget that passes the kernel down to a React Component */
export class ModelViewWidget extends ReactElementWidget {
  constructor(kernel: Kernel.IKernel, tracker: INotebookTracker) {
    super(<ModelViewPanel kernel={kernel} tracker={tracker} />);
  }
}

/**
 * Interface for the machine learning panel's React props
 */
interface ModelViewPanelProps {
  kernel: Kernel.IKernel;
  tracker: INotebookTracker;
}

/**
 * Interface for the machine learning panel's React state
 */
interface ModelViewPanelState {
  runTime: number;
  dataSet: { [index: string]: any }[];
  dataItem: { [index: string]: number };
  spec: { [index: string]: any }[];
  currentStep: number;
  updateGraph: boolean;
  displayGraph: boolean;
  done: boolean;
  didRender: boolean;
  title: string;
  kernel: Kernel.IKernel;
}

/** Second Level: React Component that stores the state for the entire extension */
class ModelViewPanel extends React.Component<
  ModelViewPanelProps,
  ModelViewPanelState
> {
  state = {
    runTime: 0,
    dataSet: new Array<{ [index: string]: any }>(),
    spec: new Array<{ [index: string]: any }>(),
    dataItem: {},
    currentStep: 0,
    updateGraph: true,
    displayGraph: true,
    done: false,
    didRender: false,
    title: '',
    kernel: this.props.kernel
  };

  constructor(props: any) {
    super(props);

    if (this.props.tracker.currentWidget && this.state.kernel) {
      /** Connect to custom comm with the backend package */
      this.state.kernel.anyMessage.connect(
        this.onMessage,
        this
      );
    }

    this.props.tracker.currentChanged.connect(tracker => {
      if (tracker.currentWidget && tracker.currentWidget.session.kernel) {
        this.setState(
          {
            kernel: tracker.currentWidget.session.kernel as Kernel.IKernel
          },
          () => {
            this.state.kernel.anyMessage.connect(
              this.onMessage,
              this
            );
          }
        );
      } else if (tracker.currentWidget) {
        tracker.currentWidget.session.statusChanged.connect(session => {
          if (session.status === 'connected') {
            this.setState(
              {
                kernel: tracker.currentWidget.session.kernel as Kernel.IKernel
              },
              () => {
                this.state.kernel.anyMessage.connect(
                  this.onMessage,
                  this
                );
              }
            );
          }
        });
      }
    });
  }

  componentWillMount() {
    this.setState({
      didRender: false,
      spec: []
    });
  }

  componentDidMount() {
    let comm: Kernel.IComm = this.state.kernel.connectToComm(
      'plyto-data',
      'plyto-data'
    );
    comm.send({ open: true });
    this.setState({
      didRender: false
    });
  }

  componentDidUpdate() {
    if (!this.state.didRender && this.state.spec.length !== 0) {
      this.setState({
        didRender: true
      });
    }
  }

  onMessage(sender: Kernel.IKernel, msg: any) {
    msg = msg.msg;
    if (
      msg.channel === 'shell' &&
      msg.content.comm_id === 'plyto-data' &&
      !msg.content.data['open']
    ) {
      let data = JSON.parse(msg.content.data)
      if (data['title'] !== 'none') {
        this.setState({
          runTime: data['runTime'],
          dataSet: data['dataSet'],
          spec: data['spec'],
          dataItem: data['dataItem'],
          currentStep: data['currentStep'],
          updateGraph: data['updateGraph'],
          displayGraph: data['displayGraph'],
          done: data['done'],
          title: data['title']
        });
      } else {
        this.setState({
          runTime: data['runTime'],
          dataSet: data['dataSet'],
          spec: data['spec'],
          dataItem: data['dataItem'],
          currentStep: data['currentStep'],
          updateGraph: data['updateGraph'],
          displayGraph: data['displayGraph'],
          done: data['done']
        });
      }
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

    if (
      this.state.didRender &&
      this.state.updateGraph &&
      this.state.spec.length !== 0
    ) {
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
        title={this.state.title}
      />
    );
  }
}
