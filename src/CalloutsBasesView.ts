import { BasesView, QueryController, TFile } from 'obsidian';
import { parseForCalloutBlocks, renderCalloutBlocks, type CalloutParserOptions } from './CalloutTools';
import { getFilterOptions, getCalloutFilteredTypes } from './FilterTools';

export const CalloutViewType = 'Callouts';

export class CalloutsBasesView extends BasesView {
	readonly type = CalloutViewType;
	private containerEl: HTMLElement;

	constructor(controller: QueryController, parentEl: HTMLElement) {
		super(controller);
		this.containerEl = parentEl.createDiv('bases-callout-view-container');
	}

	public async onDataUpdated(): Promise<void> {
		const order = this.config.getOrder();
		const filteredCalloutTypes = getCalloutFilteredTypes(getFilterOptions(this));

		this.containerEl.empty();
		const tableRoot = this.containerEl.createDiv('bases-callout-table-container');

		// Handle groups, one of the sort options. Always at least 1
		for (const group of this.data.groupedData) {

			// Traverse the group's entries/rows
			for (const entry of group.entries) {
				tableRoot.createDiv('bases-callout-tr', async (el) => {
					const rowFile = entry.file;

					// Loop through the standard properties/columns in the given order
					for (const propertyName of order) {
						const value = entry.getValue(propertyName) || '';

						el.createEl('div', {
							cls: 'bases-callout-td',
							text: value.toString()
						});
					}

					// render the callout blocks for this row, if any
					if (rowFile != null) {
						const calloutMarkup = parseForCalloutBlocks(
							await this.app.vault.cachedRead(rowFile as TFile),
							filteredCalloutTypes
						);

						renderCalloutBlocks(
							calloutMarkup,
							el.createDiv('bases-callout-td callout-cell'),
							this
						);
					}
				});
			}
		}
	}
}
