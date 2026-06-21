import { MarkdownRenderer, Component, BasesView } from 'obsidian';

export type CalloutParserOptions = {
	includeTypes?: string[];
	excludeTypes?: string[];
}

export function renderCalloutBlocks(
	callouts: string[][],
	container: HTMLElement,
	component: Component
) {
	if (callouts.length == 0) return '';
	const calloutMarkdown = callouts
		.map((block) => block.join('\n'));	// Join up all the lines in a callout

	const output = calloutMarkdown.join('\n\n'); // join up all the callouts
	const markdownWrapper = container.createDiv();

	const hostApp = (component as BasesView)?.app;
	MarkdownRenderer.render(hostApp, output, markdownWrapper, '', component);
}

//	Extract specific type of callout blocks from a markdown file
export function parseForCalloutBlocks(contents: string, options : CalloutParserOptions) : string[][] {
	const lines = contents.split('\n');
	const calloutBlocks = [];
	let currentCalloutBlock : string[] = [];
	let inCalloutBlock = false;

	const isEligibleCalloutType = (calloutType: string) => {
		return (options.includeTypes && options.includeTypes.includes(calloutType))
			|| (options.excludeTypes && !options.excludeTypes.includes(calloutType));
	}

	for (const line of lines) {
		if (line.startsWith('>[!')) {
			inCalloutBlock = true;
		}
		if (inCalloutBlock) {
			if (line.startsWith('>')) {
				currentCalloutBlock.push(line);
			} else {
				inCalloutBlock = false;

				// Get the callout type and title from the first line
				const calloutInfo = currentCalloutBlock[0].match(/\>\[!([^\]]+)\](.*)?$/);
				const calloutType = calloutInfo ? calloutInfo[1] : null;
				if (calloutType && isEligibleCalloutType(calloutType)) {
					calloutBlocks.push(currentCalloutBlock);
				}

				currentCalloutBlock = [];
			}
		}
	}
	return calloutBlocks;
}
