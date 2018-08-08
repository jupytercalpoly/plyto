import * as React from 'react';
import { ReactElementWidget } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { NotebookPanel, INotebookTracker } from '@jupyterlab/notebook';
import { CommandRegistry } from '@phosphor/commands';
import { Status } from './components/Status';

export class StatusItemWidget extends ReactElementWidget {
  constructor(
    hasKernel: boolean,
    lossGraphSpec: any,
    accuracyGraphSpec: any,
    commands: CommandRegistry,
    tracker: INotebookTracker
  ) {
    super(
      hasKernel ? (
        <StatusItem
          kernel={
            tracker.currentWidget.context.session.kernel as Kernel.IKernel
          }
          commands={commands}
          tracker={tracker}
        />
      ) : (
        <div />
      )
    );
  }
}

/**
 * Interface for the machine learning panel's React props
 */
interface IStatusItemProps {
  kernel: Kernel.IKernel;
  commands: CommandRegistry;
  tracker: INotebookTracker;
}

/**
 * Interface for the machine learning panel's React state
 */
interface IStatusItemState {
  kernel: Kernel.IKernel;
  overallComplete: number;
  stepComplete: number;
  stepNumber: number;
}

/** Second Level: React Component that stores the state for the entire extension */
class StatusItem extends React.Component<IStatusItemProps, IStatusItemState> {
  state = {
    kernel: this.props.kernel,
    overallComplete: 0,
    stepComplete: 0,
    stepNumber: 1
  };

  constructor(props: any) {
    super(props);
    /** Connect to custom comm with the backend package */
    this.props.kernel.iopubMessage.connect(this.onMessage, this);

    /** Register a custom comm with the backend package */
    this.props.kernel.registerCommTarget('plyto', (comm, msg) => {});

    this.props.tracker.currentChanged.connect(tracker => {
      let widget: NotebookPanel | null = tracker.currentWidget;
      if (widget.session.kernel) {
        console.log('new widget. re-registering comm targets');
        console.log(widget, widget.session.kernel)
        this.setState(
          {
            kernel: widget.session.kernel as Kernel.IKernel
          },
          () => {
            this.state.kernel.iopubMessage.connect(this.onMessage, this);
            try {
              this.state.kernel.registerCommTarget('plyto', (comm, msg) => {});
            }
            catch {
              console.log('could not register comm', this.state.kernel)
            }
          }
        );
      }
    });

    this.props.tracker.currentWidget.session.kernelChanged.connect(() => {
      let widget: NotebookPanel | null = this.props.tracker.currentWidget;
      if (widget) {
        console.log('new kernel. re-registering comm targets');

        this.setState(
          {
            kernel: widget.session.kernel as Kernel.IKernel
          },
          () => {
            this.state.kernel.iopubMessage.connect(this.onMessage, this);
            this.state.kernel.registerCommTarget('plyto', (comm, msg) => {});
          }
        );
      }
    })

    this.props.tracker.currentWidget.session.statusChanged.connect(() => {
      if (this.props.tracker.currentWidget.session.status === 'idle' 
        && this.state.overallComplete < 100 
        && this.state.overallComplete > 0
      ) {
        console.log('kernel interrupted')

        this.setState({
          overallComplete: -1
        }, () => this.isFinished())
      }
    })
  }

  onMessage(sender: Kernel.IKernel, msg: KernelMessage.IIOPubMessage) {
    if (msg.content.target_name === 'plyto') {
      this.setState(
        {
          overallComplete: Number(
            parseFloat(msg.content.data['totalProgress'].toString()).toFixed(2)
          ),
          stepComplete: Number(
            parseFloat(msg.content.data['currentProgress'].toString()).toFixed(
              2
            )
          ),
          stepNumber: Number(
            parseInt(msg.content.data['currentStep'].toString())
          )
        },
        () => this.isFinished()
      );
    }
  }

  isFinished() {
    if (this.state.overallComplete === 100) {
      setTimeout(() => {
        this.setState({
          overallComplete: 0
        });
      }, 5000);
    } else {
      setTimeout(() => {
        this.setState({
          overallComplete: 0
        });
      }, 5000)
    }
  }

  render() {
    return (
      this.state.overallComplete !== 0 && (
        <Status
          done={this.state.overallComplete === 100}
          overallComplete={this.state.overallComplete}
          stepComplete={this.state.stepComplete}
          epoch={this.state.stepNumber}
          commands={this.props.commands}
        />
      )
    );
  }
}
