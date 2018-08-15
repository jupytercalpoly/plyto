import * as React from 'react';
import { ReactElementWidget } from '@jupyterlab/apputils';
import { Kernel } from '@jupyterlab/services';
import { NotebookPanel, INotebookTracker } from '@jupyterlab/notebook';
import { CommandRegistry } from '@phosphor/commands';
import { Status } from './components/Status';

export class StatusItemWidget extends ReactElementWidget {
  constructor(
    hasKernel: boolean,
    commands: CommandRegistry,
    tracker: INotebookTracker,
    hasPanel: Function
  ) {
    super(
      hasKernel ? (
        <StatusItem
          kernel={
            tracker.currentWidget.context.session.kernel as Kernel.IKernel
          }
          commands={commands}
          tracker={tracker}
          hasPanel={hasPanel}
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
  hasPanel: Function;
}

/**
 * Interface for the machine learning panel's React state
 */
interface IStatusItemState {
  kernel: Kernel.IKernel;
  overallComplete: number;
  stepComplete: number;
  stepNumber: number;
  commId: string;
  sending: boolean;
  outgoingComm: Kernel.IComm;
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
class StatusItem extends React.Component<IStatusItemProps, IStatusItemState> {
  state = {
    kernel: this.props.kernel,
    overallComplete: 0,
    stepComplete: 0,
    stepNumber: 1,
    commId: '',
    sending: this.props.hasPanel(),
    outgoingComm: null,
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
    this.props.kernel.anyMessage.connect(this.onMessage, this);

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
            kernel: widget.session.kernel as Kernel.IKernel,
          },
          () => {
            this.state.kernel.anyMessage.connect(this.onMessage, this);
            this.state.kernel.registerCommTarget('plyto', (comm, msg) => {});

            if (this.state.sending) {
              this.setState({
                outgoingComm: this.state.kernel.connectToComm('plyto-data','plyto-data')
              })
            }
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
            }, () => {
              this.isFinished()
            })
          }
        });

        this.props.tracker.currentWidget.session.kernelChanged.connect(() => {
          /** Handles kernel restarts */
          let widget: NotebookPanel | null = this.props.tracker.currentWidget;
          if (widget) {
            this.setState(
              {
                kernel: widget.session.kernel as Kernel.IKernel
              },
              () => {
                this.state.kernel.anyMessage.connect(this.onMessage, this);
                this.state.kernel.registerCommTarget('plyto', (comm, msg) => {});

                if (this.state.sending) {
                  this.setState({
                    outgoingComm: this.state.kernel.connectToComm('plyto-data','plyto-data')
                  })
                }
              }
            );
          }
        });
      }
    });

    if (this.props.tracker.currentWidget) {
      this.props.tracker.currentWidget.session.statusChanged.connect(() => {
        /** Handles kernel interruption,
         * status item shows 'Training Interrupted' for one second */
        if (
          this.props.tracker.currentWidget.session.status === 'idle' &&
          this.state.overallComplete < 100 &&
          this.state.overallComplete > 0
        ) {
          this.setState(
            {
              overallComplete: -1
            },
            () => this.isFinished()
          );
        }
      });

      this.props.tracker.currentWidget.session.kernelChanged.connect(() => {
        /** Handles kernel restarts */
        let widget: NotebookPanel | null = this.props.tracker.currentWidget;
        if (widget) {
          this.setState(
            {
              kernel: widget.session.kernel as Kernel.IKernel
            },
            () => {
              this.state.kernel.anyMessage.connect(this.onMessage, this);
              this.state.kernel.registerCommTarget('plyto', (comm, msg) => {});

              if (this.state.sending) {
                this.setState({
                  outgoingComm: this.state.kernel.connectToComm('plyto-data','plyto-data')
                })
              }
            }
          );
        }
      });
    }
  }

  async onMessage(sender: Kernel.IKernel, msg: any) {
    msg = msg.msg

    /** On comm_open message save comm_id */
    if (msg.channel === 'iopub' 
      && msg.content.target_name === 'plyto' 
      && msg.header.msg_type === 'comm_open'
    ) {
      await this.setState({
        commId: msg.content.comm_id.toString()
      })

    /** on comm_msg for plyto comm, update state for status item and model viewer */
    } else if (
      msg.channel === 'iopub' 
      && msg.header.msg_type === 'comm_msg' 
      && msg.content.comm_id === this.state.commId
    ) {
      /** update data for status item */
      await this.setState({
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
      });

      /** update data for model viewer panel */
      if (msg.content.data['runTime'] <= 0.5) {
        this.setState(
          {
            displayGraph: false,
          },
          () => {
            this.setState(prevState => ({
              spec: msg.content.data['spec'],
              runTime: Number(parseInt(msg.content.data['runTime'].toString())),
              currentStep: Number(
                parseInt(msg.content.data['currentStep'].toString())
              ),
              done: msg.content.data['totalProgress'] === 100,
              dataItem: msg.content.data['dataSet']
            }));
          }
        );
        } else {
          this.setState(prevState => ({
            spec: msg.content.data['spec'],
            runTime: Number(parseInt(msg.content.data['runTime'].toString())),
            currentStep: Number(
              parseInt(msg.content.data['currentStep'].toString())
            ),
            updateGraph:
              (prevState.currentStep !== msg.content.data['currentStep'] 
              && msg.content.data['currentStep'] !== 0)
              || this.state.done,
            displayGraph: true,
            dataSet: [...prevState.dataSet, msg.content.data['dataSet']],
            done: msg.content.data['totalProgress'] === 100,
            dataItem: msg.content.data['dataSet']
          }));
      }

      /** if panel is open, send data across plyto-data comm */
      if (this.state.sending) {
        this.state.outgoingComm.send({
          runTime: this.state.runTime,
          dataSet: this.state.dataSet,
          dataItem: this.state.dataItem,
          spec: this.state.spec,
          currentStep: this.state.currentStep,
          updateGraph: this.state.updateGraph,
          displayGraph: this.state.displayGraph,
          done: this.state.done
        })
      }

    /** when panel is opened, recieve plyto-data message and update sending and outgoingComm */
    } else if (msg.channel === 'shell' 
      && msg.content.comm_id === 'plyto-data'
      && msg.content.data['open']
    ) {
      this.setState({
        sending: true,
        outgoingComm: this.state.kernel.connectToComm('plyto-data','plyto-data')
      }, () => {
        if (this.state.dataSet.length > 0) {
          this.state.outgoingComm.send({
            runTime: this.state.runTime,
            dataSet: this.state.dataSet,
            dataItem: this.state.dataItem,
            spec: this.state.spec,
            currentStep: this.state.currentStep,
            updateGraph: true,
            displayGraph: true,
            done: this.state.done
          })
        }
      })

    }
  }

  isFinished() {
    /** If training complete or interrupted, display "Training Complete" or
     * "Training Interrupted" for 2 seconds */
    if (
      this.state.overallComplete === 100 ||
      this.state.overallComplete === -1
    ) {
      setTimeout(() => {
        this.setState({
          overallComplete: 0
        });
      }, 2000);

      this.state.kernel.connectToComm('plyto',this.state.commId).close()
      this.state.kernel.connectToComm('plyto-data').close()
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
