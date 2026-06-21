# Obsidian Base Callouts Plugin

This plugin provides an extension view for bases that lists callouts within markdown documents, with optional filtering.

## How to use

This plugin adds a view to bases that adds a column to the end for rendering. Filtering options for the callouts are in the view's options.

If you find that returning to a view has switched it away, you need to change the order of your views so that the desired view is at the top of the list (hover over the icon in the list and you can click and drag to change the order).

For more information about callouts, refer to the [Obsidian documentation](https://help.obsidian.md/Editing+and+formatting/Callouts).

## Installation

Download the files from the latest release and extract into the `.obsidian/plugins/callout_list/` folder. Then it should appear under the community plugins area in the settings, where you can then enable it and change the settings.

## Known issues/limitations

- Sometimes the view may not refresh. Switch to another view and back again.
- If you are running bases within callouts, it can cause an error "Uncaught ResizeObserver loop completed with undelivered notifications."

Also, I have not tested this on the mobile version. I'm not using any APIs other than Obsidian's, so it should work okay.

## License of use

Released under the MIT license
