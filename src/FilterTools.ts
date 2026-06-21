import { Component, BasesView } from 'obsidian';
import { CalloutParserOptions } from './CalloutTools';

export type FilterOptions = {
	customCalloutTypes: string;
	showAllCustomCallouts: boolean;
	showAllStandardCallouts: boolean;
}

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

export function getFilterOptions(comp : Component) : FilterOptions {
	const { config } = comp as BasesView;
	const defaultOnUndefined =
		(value : any, defaultValue : any) =>
			value === undefined ? defaultValue : value;
	return {
		customCalloutTypes: defaultOnUndefined(config.get('customCalloutTypeFilter'), defaultCustomCalloutTypes),
		showAllCustomCallouts: defaultOnUndefined(config.get('showAllCustomCallouts'), defaultShowAllCustomCallouts),
		showAllStandardCallouts: defaultOnUndefined(config.get('showAllStandardCallouts'), defaultShowAllStandardCallouts)
	};
}

export function getCalloutFilteredTypes(filterOptions : FilterOptions) : CalloutParserOptions {
	const parseCalloutField =
		(field: string) => field.split(',').map((s) => s.trim()).filter((s) => s.length > 0);
	const xor = (a : boolean, b : boolean) => (a || b) && !(a && b);

	const customCalloutTypes = parseCalloutField(filterOptions.customCalloutTypes);
	const showAllCustomCallouts = filterOptions.showAllCustomCallouts;
	const showAllStandardCallouts = filterOptions.showAllStandardCallouts;
	const standardCalloutTypes = xor(showAllStandardCallouts, showAllCustomCallouts)
		? [] : standardCallouts;

	// show all custom: since I don't have a list of all custom properties, I'm
	// switching it to use an exclusion filter when parsing. So this inverts the
	// standard callouts list

	if (showAllCustomCallouts) {
		return { excludeTypes: standardCalloutTypes.filter((type) => !customCalloutTypes.includes(type)) };
	}
	return { includeTypes: [...standardCalloutTypes, ...customCalloutTypes] };
}
