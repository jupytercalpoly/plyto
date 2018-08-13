import { JupyterLab, JupyterLabPlugin } from '@jupyterlab/application';
import { ICommandPalette, Toolbar, ToolbarButton } from '@jupyterlab/apputils';
import { INotebookTracker, NotebookPanel } from '@jupyterlab/notebook';
import { Kernel } from '@jupyterlab/services';
import { IStatusBar } from '@jupyterlab/statusbar';
import { iconClass, widgetStyle } from './componentStyle/modelViewerStyle';
import { ModelViewWidget } from './ModelViewWidget';
import { StatusItemWidget } from './StatusItemWidget';
import { each } from '@phosphor/algorithm';
import '../style/urls.css';

/**
 * An extension to further explore machine learning models
 * with JupyterLab
 **/
const extension: JupyterLabPlugin<void> = {
  id: '@jupyterlab/jupyterlab-machinelearning',
  requires: [ICommandPalette, INotebookTracker, IStatusBar],
  activate: (
    app: JupyterLab,
    palette: ICommandPalette,
    tracker: INotebookTracker,
    statusBar: IStatusBar
  ): void => {

    console.log('16')

    function hasKernel(): boolean {
      return (
        tracker.currentWidget !== null &&
        tracker.currentWidget.context.session.kernel !== null
      );
    }

    function hasWidget(): boolean {
      let check: boolean = false;
      each(app.shell.widgets('main'), widget => {
        if (widget instanceof ModelViewWidget 
          && widget.id === 'modelview-'+tracker.currentWidget.context.path
        ) {
          check = true;
        } 
      })
      return check
    }

    /** Add command to command registry */
    const command: string = 'machinelearning:open-new';
    app.commands.addCommand(command, {
      label: 'Open Machine Learning View',
      iconClass: iconClass,
      isEnabled: hasKernel,
      execute: () => {
        
        const title: string = tracker.currentWidget.context.path;
        const id: string = 'modelview-'+title;

        if (hasWidget()) {
          app.shell.activateById(id);
        } else {
          let kernel: Kernel.IKernel = tracker.currentWidget.context.session
          .kernel as Kernel.IKernel;
          
          const widget = new ModelViewWidget(kernel, title);
          widget.id = id;
          widget.addClass(widgetStyle);
          widget.title.label = title;
          widget.title.iconClass = iconClass;
          widget.title.closable = true;

          if (!widget.isAttached) {
            tracker.currentWidget.context.addSibling(widget, {
              mode: 'split-right'
            });
          }
          app.shell.activateById(widget.id);
        }
      }
    });

    /** Add command to command palette */
    palette.addItem({ command, category: 'Notebook Operations' });

    /** Add button for machine learning to notebook toolbar */
    function addButton() {
      let widget: NotebookPanel | null = tracker.currentWidget;
      if (widget) {
        let button: ToolbarButton = Toolbar.createFromCommand(
          app.commands,
          command
        );
        widget.toolbar.insertItem(9, app.commands.label(command), button);
      }
    }

    /** Refresh command, used to update isEnabled when kernel status is changed */
    function refreshNewCommand() {
      app.commands.notifyCommandChanged(command);
    }

    /** Add status bar item **/
    function addStatus() {
      try {
        statusBar.registerStatusItem(
          '@jupyterlab/machinelearning',
          new StatusItemWidget(hasKernel(), app.commands, tracker),
          { align: 'middle' }
        );
      } catch (error) { 
        /** We attempt to add the status item whenever the currentWidget changes
         * it is only actually added if the currentWidget is a notebook
         * this is not truly an error, simply adds statusbar item if it is not already there
         * (at the moment there is no way to check if a statusbar item is already registered) */
      }
    }

    /**
     * Deals with updating isEnabled status of command,
     * placing button when currentWidget is a notebook panel,
     * and linking status item to kernel
     *
     * Code credit to @vidartf/jupyterlab-kernelspy
     * */
    let widget: NotebookPanel | null = tracker.currentWidget;
    if (widget) {
      widget.context.session.kernelChanged.connect(refreshNewCommand);
      widget.context.session.kernelChanged.connect(addStatus);
    }

    tracker.currentChanged.connect(tracker => {
      addButton();
      if (widget) {
        widget.context.session.kernelChanged.disconnect(refreshNewCommand);
        widget.context.session.kernelChanged.disconnect(addStatus);
      }
      widget = tracker.currentWidget;
      if (widget) {
        widget.context.session.kernelChanged.connect(refreshNewCommand);
        widget.context.session.kernelChanged.connect(addStatus);
      }
    });
  },
  autoStart: true
};

export default extension;
