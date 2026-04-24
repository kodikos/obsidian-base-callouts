import { ItemView, MarkdownRenderer, WorkspaceLeaf, TFile, Component } from 'obsidian';
import CalloutList from './main';

export const VIEW_TYPE_CALLOUT = 'callout-view';

export class CalloutView extends ItemView {
	plugin: CalloutList;

	constructor(leaf: WorkspaceLeaf, plugin: CalloutList) {
		super(leaf);
		this.plugin = plugin;
	}

	getViewType() {
		return VIEW_TYPE_CALLOUT;
	}

	getDisplayText() {
		return 'Callout List';
	}

	async onload() {
		//	Redraw the view when it becomes the active view, which includes onOpen
		//	but not after a hot reload, but that's a dev-only issue
		this.registerEvent(this.app.workspace.on('active-leaf-change', () => {
			const activeCalloutView = this.app.workspace.getActiveViewOfType(CalloutView);

			//	Only dealing with one window instance at the moment, so this is okay
			//	But if not, activeCalloutView===this should be okay
			if (activeCalloutView === null) return;

			this.redraw();
		}));
	}

	renderHeader(container: Element) {
		const { calloutTypeFilter, includePathFilter, excludePathFilter } = this.plugin.settings || {};
		const calloutTypeFilterString = calloutTypeFilter.length > 0 ? `callouts of type **${calloutTypeFilter}**` : '**any** callouts';
		const includingPathFilterString = includePathFilter.length > 0 ? `under paths **${includePathFilter}**` : 'in **whole vault**';
		const excludingPathFilterString = excludePathFilter.length > 0 ? `excluding paths **${excludePathFilter}**` : '';

		const markdownText = `# Callout List\n`
			+ `Showing ${calloutTypeFilterString} ${includingPathFilterString} ${excludingPathFilterString}`;

		const markdownWrapper = container.createDiv();
		MarkdownRenderer.render(this.app, markdownText, markdownWrapper, '', this);
	}

	async redraw() {
		//	work out the filters
		const { calloutTypeFilter, includePathFilter, excludePathFilter } = this.plugin.settings || {};
		const calloutTypeFilterString = calloutTypeFilter.length > 0 ? `callouts of type ${calloutTypeFilter}` : 'any callouts';
		const includingPathFilterString = includePathFilter.length > 0 ? `under paths ${includePathFilter}` : 'in whole vault';
		const excludingPathFilterString = excludePathFilter.length > 0 ? `excluding paths ${excludePathFilter}` : '';
		const allowedTypes = this.getAllowedCalloutTypes(calloutTypeFilter);

		//	Empty the container and show a header
		const container = this.containerEl.children[1];
		container.empty();
		this.renderHeader(container);
		// container.createEl('h1', { text: 'Callout List' });
		// container.createEl('div', { text: `Showing ${calloutTypeFilterString} ${includingPathFilterString} ${excludingPathFilterString}` })

		//	fetch the list of markdown files
		const filteredFiles = this.getApplicableFiles(includePathFilter, excludePathFilter);
		const results = await Promise.all(
			filteredFiles.map(async (filename) =>{
				return {
					filename: filename.path,
					contents: parseForCalloutBlocks(
						await this.app.vault.cachedRead(filename),
						allowedTypes
					)
				};
			})
		);

		//	Collate them into markdown
		const filesOutput = results
			.filter((result) => result.contents.length > 0)
			.map((result) => {
				const calloutMarkdown = result.contents
					.map((callout) => callout.join('\n'))	// mapping each callout block and joining lines
					.join('\n\n');							// joining all callout blocks

				// return with a heading for each file
				return `### ${result.filename}\n${calloutMarkdown}`;
			});

		//	Render the markdown
		const markdownWrapper = container.createDiv();
		MarkdownRenderer.render(this.app, filesOutput.join('\n'), markdownWrapper, '', this);
	}

	async onClose() {
		// Nothing to clean up.
	}

	getApplicableFiles(includePathFilter : string, excludePathFilter : string) : TFile[] {
		const includePaths = this.getSettingsPathList(includePathFilter);
		const excludePaths = this.getSettingsPathList(excludePathFilter);

		let filteredFiles =  this.app.vault.getMarkdownFiles();
		if (includePaths.length > 0) {
			filteredFiles = filteredFiles.filter((file) => includePaths.some((path) => file.path.startsWith(path)));
		}
		if (excludePaths.length > 0) {
			filteredFiles = filteredFiles.filter((file) => !excludePaths.some((path) => file.path.startsWith(path)));
		}
		return filteredFiles;
	}

	getAllowedCalloutTypes(calloutTypeFilter: string) : string[] {
		if (calloutTypeFilter.trim().length === 0) return [];
		return calloutTypeFilter.split(',').map((t) => t.trim());
	}

	getSettingsPathList(pathFilter: string) : string[] {
		if (pathFilter.trim().length === 0) return [];
		return pathFilter.split(';').map((p) => p.trim());
	}
}

export function renderCalloutBlocks(
	callouts: string[][],
	filename : string,
	container: HTMLElement,
	component: Component
) {
	if (callouts.length == 0) return '';
	const calloutMarkdown = callouts
		//.filter((block) => block.length > 0)
		.map((block) => block.join('\n');	// Join up all the lines

	const output = `### ${filename}\n${calloutMarkdown.join('\n\n')}`;

	//	Render the markdown
	const markdownWrapper = container.createDiv();
	MarkdownRenderer.render(this.app, output, markdownWrapper, '', component);
}

//	Extract specific type of callout blocks from a markdown file
export function parseForCalloutBlocks(contents: string, allowedCalloutTypes: string[]) : string[][] {
	const lines = contents.split('\n');
	const calloutBlocks = [];
	const doTypeFilter = allowedCalloutTypes.length > 0;
	let currentCalloutBlock : string[] = [];
	let inCalloutBlock = false;

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
				if (!doTypeFilter
					|| (doTypeFilter && calloutType && allowedCalloutTypes.includes(calloutType))
				) {
					calloutBlocks.push(currentCalloutBlock);
				}

				currentCalloutBlock = [];
			}
		}
	}
	return calloutBlocks;
}
