import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Widget } from '@lumino/widgets';

interface APODResponse {
  copyright: string;
  date: string;
  explanation: string;
  media_type: 'video' | 'image';
  title: string;
  url: string;
};

/**
 * Initialization data for the myextension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'myextension:plugin',
  autoStart: true,
  requires: [ICommandPalette],
  activate: async (app: JupyterFrontEnd, palette: ICommandPalette) => {
    console.log('JupyterLab extension myextension is activated!');
    //console.log('ICommandPalette:', palette);

    // create a blank content widget inside of a mainareawidget
    const content = new Widget();
    content.addClass('my-apodWidget');
    const widget = new MainAreaWidget({ content });
    widget.id = 'apod-jupyterlab';
    widget.title.label = 'Astronomy Picture';
    widget.title.closable = true;

    // add an image element to the content
    let img = document.createElement('img');
    content.node.appendChild(img);

    let summary = document.createElement('p');
    content.node.appendChild(summary);

    // get a random date string in YYYY-MM-DD format
    function randomDate() {
      const start = new Date(2010, 1, 1);
      const end = new Date();
      const randomDate = new Date(start.getTime() + Math.random()*(end.getTime() - start.getTime()));
      return randomDate.toISOString().slice(0, 10);
    }

    // fetch info about a random picture
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${randomDate()}`);
    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        summary.innerText = data.error.message;
      } else {
        summary.innerText = response.statusText;
      }
    } else {
      const data = await response.json() as APODResponse;
      
      if (data.media_type === 'image') {
        // populate the image
        img.src = data.url;
        img.title = data.title;
        summary.innerText = data.title;
        if (data.copyright) {
          summary.innerText += ` (Copyright ${data.copyright})`;
        }
      } else {
        console.log('Random APOD was not a picture.');
      }
    }

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
