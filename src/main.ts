import { Plugin } from 'obsidian';
import {
	CalloutsBasesView,
	CalloutViewType
} from './CalloutsBasesView';

import {
	defaultShowAllCustomCallouts,
	defaultShowAllStandardCallouts,
	defaultCustomCalloutTypes
} from './FilterTools';


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
					displayName: 'Always show (comma separated)',
					key: 'customCalloutTypeFilter',
					default: defaultCustomCalloutTypes
				}
			])
		});
	}
}
