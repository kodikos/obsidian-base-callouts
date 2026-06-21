import { Plugin } from 'obsidian';
import {
	CalloutsBasesView,
	CalloutViewType,
	defaultShowAllCustomCallouts,
	defaultShowAllStandardCallouts,
	defaultCustomCalloutTypes
} from './CalloutsBasesView';

export default class CalloutList extends Plugin {
	async onload() {
		// Tell Obsidian about the new view type that this plugin provides.
		this.registerBasesView(CalloutViewType, {
			name: 'Callouts',
			icon: 'lucide-rectangle-ellipsis',
			factory: (controller, containerEl) => {
				return new CalloutsBasesView(controller, containerEl)
			},
			options: () => ([
				{
					type: 'toggle',
					displayName: 'Show All Standard Types',
					key: 'showAllStandardCallouts',
					default: defaultShowAllStandardCallouts
				},
				{
					type: 'toggle',
					key: 'showAllCustomCallouts',
					displayName: 'Show All Custom Callouts',
					default: defaultShowAllCustomCallouts
				},
				{
					type: 'text',
					displayName: 'Only show these custom types (comma separated)',
					key: 'customCalloutTypeFilter',
					default: defaultCustomCalloutTypes
				}
			])
		});
	}
}
