import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ICommandPalette, MainAreaWidget } from '@jupyterlab/apputils';
import { Message } from '@lumino/messaging';
import { Widget } from '@lumino/widgets';

interface APODResponse {
  copyright: string;
  date: string;
  explanation: string;
  media_type: 'video' | 'image';
  title: string;
  url: string;
};

class APODWidget extends Widget {
  /**
   * Construct a new APOD widget
   */
  constructor() {
    super();

    this.addClass('my-apodWidget');

    // add an image element to the panel
    this.img = document.createElement('img');
    this.node.appendChild(this.img);

    // add summary element to the panel
    this.summary = document.createElement('p');
    this.node.appendChild(this.summary);
  }

  /**
   * the image element associated with the widget
   */
  readonly img: HTMLImageElement;

  /**
   * the summary text element associated with the widget.
   */
  readonly summary: HTMLParagraphElement;

  /**
   * handle update requests for the widget
   */
  async onUpdateRequest(msg: Message): Promise<void> {
    const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY&date=${this.randomDate()}`);
    if (!response.ok) {
      const data = await response.json();
      if (data.error) {
        this.summary.innerText = data.error.message;
      } else {
        this.summary.innerText = response.statusText;
      }
      return;
    }

    const data = await response.json() as APODResponse;

    if (data.media_type === 'image') {
      // populate image
      this.img.src = data.url;
      this.img.title = data.title;
      this.summary.innerText = data.explanation;
      if (data.copyright) {
        this.summary.innerText += ` (Copyright ${data.copyright})`;
      }
    } else {
      this.summary.innerText = 'Random APOD fetched was not an image.';
    }
  }

  /**
  * Get a random date string in YYYY-MM-DD format.
  */
   randomDate(): string {
    const start = new Date(2010, 1, 1);
    const end = new Date();
    const randomDate = new Date(start.getTime() + Math.random()*(end.getTime() - start.getTime()));
    return randomDate.toISOString().slice(0, 10);
  }
}

/**
 * Activate the APOD widget extension
 */
function activate(app: JupyterFrontEnd, palette: ICommandPalette) {
  console.log('JupyterLab extension myextension is activated!');

  // create a single widget
  const content = new APODWidget();
  const widget = new MainAreaWidget({content});
  widget.id = 'apod-jupyterlab';
  widget.title.label = 'Astronomy Picture';
  widget.title.closable = true;

  // add an application command
  const command: string = 'apod:open';
  app.commands.addCommand(command, {
    label: 'Random Astronomy Picture',
    execute: () => {
      if (!widget.isAttached) {
        app.shell.add(widget, 'main');
      }
      content.update();
      app.shell.activateById(widget.id);
    }
  });

  palette.addItem({ command, category: 'Tutorial' });
}

/**
 * Initialization data for the myextension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'myextension:plugin',
  autoStart: true,
  requires: [ICommandPalette],
  activate: activate,
};

export default extension;
