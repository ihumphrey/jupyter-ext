import {
  ILayoutRestorer,
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { 
  ICommandPalette,
  MainAreaWidget,
  WidgetTracker 
} from '@jupyterlab/apputils';

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
function activate(
  app: JupyterFrontEnd,
  palette: ICommandPalette,
  restorer: ILayoutRestorer) {

  console.log('JupyterLab extension myextension is activated!');

  // declare widget
  let widget: MainAreaWidget<APODWidget>;

  // add application commoand
  const command: string = 'apod:open';
  app.commands.addCommand(command, {
    label: 'Random Astronomy Picture',
    execute: () => {
      if (!widget || widget.isDisposed) {
        // create new widget if one does not exist
        // or if the previous one was disposed after closing the panel
        const content = new APODWidget();
        widget = new MainAreaWidget({content});
        widget.id = 'apod-jupyterlab';
        widget.title.label = 'Astronomy Picture';
        widget.title.closable = true;
      }
      if (!tracker.has(widget)) {
        // track the state of the widget for later restoration
        tracker.add(widget);
      }
      if (!widget.isAttached) {
        app.shell.add(widget, 'main');
      }
      widget.content.update();

      // activate the widget
      app.shell.activateById(widget.id);
    }
  });

  // add command to palette
  palette.addItem({ command, category: 'Tutorial' });

  // track and restore widget state
  let tracker = new WidgetTracker<MainAreaWidget<APODWidget>>({
    namespace: 'apod'
  });
  restorer.restore(tracker, {
    command,
    name: () => 'apod'
  });
}

/**
 * Initialization data for the myextension extension.
 */
const extension: JupyterFrontEndPlugin<void> = {
  id: 'myextension:plugin',
  autoStart: true,
  requires: [ICommandPalette, ILayoutRestorer],
  activate: activate,
};

export default extension;
