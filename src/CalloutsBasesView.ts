import { BasesView, QueryController } from 'obsidian';
import { parseForCalloutBlocks, renderCalloutBlocks, type CalloutParserOptions } from './CalloutView';
import { TFile } from 'obsidian';

export type FilterOptions = {
	customCalloutTypes: string;
	showAllCustomCallouts: boolean;
	showAllStandardCallouts: boolean;
}

export const CalloutViewType = 'Callouts';

export const standardCallouts: string[] = [
	'note',
	'abstract', 'summary', 'tldr',
	'info',
	'todo',
	'tip', 'hint',
	'success', 'check', 'done',
	'question', 'help', 'faq',
	'warning', 'attention', 'caution',
	'failure', 'fail', 'missing',
	'danger', 'error',
	'bug',
	'example',
	'quote', 'cite'
];

export const defaultCustomCalloutTypes = '';
export const defaultShowAllCustomCallouts = true;
export const defaultShowAllStandardCallouts = true;


export class CalloutsBasesView extends BasesView {
	readonly type = CalloutViewType;
	private containerEl: HTMLElement;

	constructor(controller: QueryController, parentEl: HTMLElement) {
		super(controller);
		this.containerEl = parentEl.createDiv('bases-callout-view-container');
	}

	public async onDataUpdated(): Promise<void> {
		const order = this.config.getOrder();
		const filteredCalloutTypes = this.getCalloutFilteredTypes(this.getFilterOptions());

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

	getFilterOptions() : FilterOptions{
		const defaultOnUndefined =
			(value : any, defaultValue : any) =>
				value === undefined ? defaultValue : value;
		return {
			customCalloutTypes: defaultOnUndefined(this.config.get('customCalloutTypeFilter'), defaultCustomCalloutTypes),
			showAllCustomCallouts: defaultOnUndefined(this.config.get('showAllCustomCallouts'), defaultShowAllCustomCallouts),
			showAllStandardCallouts: defaultOnUndefined(this.config.get('showAllStandardCallouts'), defaultShowAllStandardCallouts)
		};
	}

	getCalloutFilteredTypes(filterOptions : FilterOptions) : CalloutParserOptions {
		const parseCalloutField =
			(field: string) => field.split(',').map((s) => s.trim()).filter((s) => s.length > 0);

		const customCalloutTypes = parseCalloutField(filterOptions.customCalloutTypes);
		const showAllCustomCallouts = filterOptions.showAllCustomCallouts;
		const showAllStandardCallouts = filterOptions.showAllStandardCallouts;
		const standardCalloutTypes = showAllStandardCallouts ? standardCallouts : [];

		// show all custom: since I don't have a list of all custom properties, I'm
		// switching it to use an exclusion filter when parsing. So this inverts the
		// standard callouts list

		//console.log("FILTER INPUTS", standardCalloutTypes, customCalloutTypes, showAllCustomCallouts);

		return showAllCustomCallouts
			? { excludeTypes: standardCallouts.filter((type) => !customCalloutTypes.includes(type)) }
			: { includeTypes: [...standardCalloutTypes, ...customCalloutTypes] };
	}
}
