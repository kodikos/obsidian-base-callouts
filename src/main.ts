import { Plugin, BasesView, QueryController, parsePropertyId, TFile } from 'obsidian';
import { parseForCalloutBlocks, renderCalloutBlocks } from './CalloutView';

export const CalloutViewType = 'Callouts';

export default class CalloutList extends Plugin {
  async onload() {
    // Tell Obsidian about the new view type that this plugin provides.
    this.registerBasesView(CalloutViewType, {
      name: 'Callouts',
      icon: 'lucide-rectangle-ellipsis',
      factory: (controller, containerEl) => {
        return new CalloutsBasesView(controller, containerEl)
      }
    });
  }
}

export class CalloutsBasesView extends BasesView {
  readonly type = CalloutViewType;
  private containerEl: HTMLElement;

  constructor(controller: QueryController, parentEl: HTMLElement) {
    super(controller);
    this.containerEl = parentEl.createDiv('bases-callout-view-container');
  }

  // onDataUpdated is called by Obsidian whenever there is a configuration
  // or data change in the vault which may affect your view. For now,
  // simply draw "Hello World" to screen.
  public onDataUpdated(): Promise<void> {
  	const order = this.config.getOrder();
    this.containerEl.empty();
    const tableRoot = this.containerEl.createDiv('bases-callout-table-container');

    // Handles groups, one of the sort options
    for (const group of this.data.groupedData) {
      console.log("group", group);
	  //const columnClass = group.entries.length > 0 ? 'double-column' : 'single-column';
    //   const groupEl = tableRoot.createDiv(`bases-callout-table ${columnClass}`);
      //groupEl.createDiv('bases-callout-group-heading', { text: group.name });
    //   const bodyEl = groupEl.createDiv('bases-callout-tbody');
      //const groupHeadingEl = groupEl.createDiv('bases-callout-group-heading', { text: group.name });
      // el.createSpan('bases-callout-group-heading-count', { text: `(${group.entries.length})` });

      // I think this is more likely traversing an index of group entries
      for (const entry of group.entries) {
        tableRoot.createDiv('bases-callout-tr', async (el) => {
          console.log("element in group", el);
          //  The properties are each column of data
          const columnRenders : string[] = [];
          let rowFile : TFile|null = null;

          for (const propertyName of order) {
            const { type, name } = parsePropertyId(propertyName);
            const value = entry.getValue(propertyName);

            if (name === 'name' && type === 'file') {
              rowFile = entry.file;
            } else {
              el.createEl('div', {
              	cls: 'bases-callout-td',
              	text: value.toString()
              });
            }
          }
          // rendering should probably happen here once all the values have been collected
          if (rowFile != null) {
            const calloutMarkup = parseForCalloutBlocks(
              await this.app.vault.cachedRead(rowFile as TFile),
                ['todo', 'list', 'error']
              );
            console.log('callout markup', calloutMarkup);
            //const nameEl = el.createDiv({ text: calloutMarkup.join("<br>") });
            renderCalloutBlocks(calloutMarkup, rowFile.name, el.createDiv('bases-callout-td callout-cell'), this);
          }
        });
      }
      //this.containerEl.createDiv({ text: 'Hello World' });
    }
  }
}

// this has the details for it being its own view. But I probably only want
// the ribbon hooks or commands
/*
import { Plugin, WorkspaceLeaf } from 'obsidian';
//import { CalloutView, VIEW_TYPE_CALLOUT } from './CalloutView';
//import { CalloutSettingsTab, CalloutListSettings, DEFAULT_SETTINGS } from './CalloutSettings';
export default class CalloutList extends Plugin {
    settings: CalloutListSettings;

    async onload() {
        await this.loadSettings();

        // Callout list is a view of its own
        this.registerView(
            VIEW_TYPE_CALLOUT,
            (leaf) => new CalloutView(leaf, this)
        );

        // This creates an icon in the left ribbon.
        this.addRibbonIcon('rows-3', 'Callout List', (evt: MouseEvent) => {
            this.activateView();
        });

        // This adds a simple command that can be triggered anywhere
        this.addCommand({
            id: 'open-callout-list',
            name: 'Open callout list',
            callback: () => {
                this.activateView();
            }
        });

        // This adds a settings tab so the user can configure various aspects of the plugin
        this.addSettingTab(new CalloutSettingsTab(this.app, this));
    }

    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }

    async saveSettings() {
        await this.saveData(this.settings);
    }

    async activateView() {
        const { workspace } = this.app;

        let leaf: WorkspaceLeaf | null = null;
        const leaves = workspace.getLeavesOfType(VIEW_TYPE_CALLOUT);

        if (leaves.length > 0) {
          // A leaf with our view already exists, use that
          leaf = leaves[0];
        } else {
          // Our view could not be found in the workspace, create a new leaf
          // in the right sidebar for it
          leaf = workspace.getLeaf(true);
          await leaf.setViewState({ type: VIEW_TYPE_CALLOUT, active: true });
        }

        // "Reveal" the leaf in case it is in a collapsed sidebar
        workspace.revealLeaf(leaf);
      }
}
*/
