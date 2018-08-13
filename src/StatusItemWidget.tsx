import * as React from 'react';
import { ReactElementWidget } from '@jupyterlab/apputils';
import { Kernel, KernelMessage } from '@jupyterlab/services';
import { NotebookPanel, INotebookTracker } from '@jupyterlab/notebook';
import { CommandRegistry } from '@phosphor/commands';
import { Status } from './components/Status';

export class StatusItemWidget extends ReactElementWidget {
  constructor(
    hasKernel: boolean,
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
      /** When current widget changes reset state, connect messaging, 
       *  register comm target with the new kernel, and connect statusChanged and 
       *  kernelChanged functionality to new */
      let widget: NotebookPanel | null = tracker.currentWidget;
      if (widget && widget.session.kernel) {
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

      if (this.props.tracker.currentWidget) {
        this.props.tracker.currentWidget.session.statusChanged.connect(() => {
          /** Handles kernel interruption, 
           * status item shows 'Training Interrupted' for one second */
          if (this.props.tracker.currentWidget.session.status === 'idle' 
            && this.state.overallComplete < 100 
            && this.state.overallComplete > 0
          ) {    
            this.setState({
              overallComplete: -1
            }, () => this.isFinished())
          }
        })

        this.props.tracker.currentWidget.session.kernelChanged.connect(() => {
          /** Handles kernel restarts */
          let widget: NotebookPanel | null = this.props.tracker.currentWidget;
          if (widget) {    
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
      }
    });

    if (this.props.tracker.currentWidget) {
      this.props.tracker.currentWidget.session.statusChanged.connect(() => {
        /** Handles kernel interruption, 
        * status item shows 'Training Interrupted' for one second */
        if (this.props.tracker.currentWidget.session.status === 'idle' 
          && this.state.overallComplete < 100 
          && this.state.overallComplete > 0
        ) {
          this.setState({
            overallComplete: -1
          }, () => this.isFinished())
        }
      })

      this.props.tracker.currentWidget.session.kernelChanged.connect(() => {
        /** Handles kernel restarts */
        let widget: NotebookPanel | null = this.props.tracker.currentWidget;
        if (widget) {
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
    }
  }

  async onMessage(sender: Kernel.IKernel, msg: KernelMessage.IIOPubMessage) {
    /** On plyto message update progress */
    console.log(msg)
    if (msg.content.target_name === 'plyto') {
      // if (msg.header.msg_type === 'comm_open') {
      //   console.log('trying to fix bug')
      //   try {
      //     this.state.kernel.iopubMessage.connect(this.onMessage, this);
      //     this.state.kernel.registerCommTarget('plyto', (comm, msg) => {});
      //   }
      //   catch {
      //     console.log('couldnt re-register targets')
      //   }
      // }
      await this.setState(
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
        () => {
          this.isFinished()
        }
      );
    }
    if (msg.header.msg_type === 'comm_msg') {
      console.log('test')
      await this.state.kernel.registerCommTarget('plyto', (comm, msg) => {});
      await this.state.kernel.connectToComm('plyto')
      console.log('done test')
    }
  }

  isFinished() {
    /** If training complete or interrupted, display "Training Complete" or 
     * "Training Interrupted" for 2 seconds */
    if (this.state.overallComplete === 100 || this.state.overallComplete === -1) {
      setTimeout(() => {
        this.setState({
          overallComplete: 0
        });
      }, 2000);
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
