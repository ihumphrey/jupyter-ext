import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

/**
 * Initialization data for the myextension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'myextension:plugin',
  autoStart: true,
  requires: [ICommandPalette],
  activate: (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension myextension is activated!');
    //console.log('ICommandPalette:', palette);

    // create a blank content widget inside of a mainareawidget
    const content = new Widget();
    const widget = new MainAreaWidget({ content });
    widget.id = 'apod-jupyterlab';
    widget.title.label = 'Astronomy Picture';
    widget.title.closable = true;

    // add an application command
    const command: string = 'apod:open';
    
    app.commands.addCommand(command, {
      label: 'Random Astronomy Picture',
      execute: () => {
        if (!widget.isAttached) {
          // attach the widget to the main work are if it's not there
          app.shell.add(widget, 'main');
        }
        // activate the widget
        app.shell.activateById(widget.id);
      }
    });

    // add the command to the palette
    palette.addItem({ command, category: 'Tutorial' });



  }
};

export default extension;
