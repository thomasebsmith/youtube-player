# YouTube Player
##### A Firefox add-on for playing YouTube playlists without logging in

YouTube Player is an add-on for Firefox. It provides the ability to store
and play YouTube playlists without logging in to YouTube. It is currently in
early development, but can still be useful. However, if you are not an
advanced user, it is not recommended.

## Functionality
Currently, YouTube Player allows you to create multiple playlists, which
can then be played in a random or fixed order in one or more tabs by
right-clicking on a tab that is navigated to youtube.com.
The playlists can be added to clicking on the add-on icon
to bring up a small popup.
The playlists can be modified by going to the add-on options page.

## Installation
YouTube Player is not yet available on addons.mozilla.org. To use it,
enable developer mode and load the add-on manually in about:debugging.
Unfortunately, the add-on must be reloaded every time the browser is restarted.

## Backing Up Your Playlists
A full backup solution is planned for v0.4. However, for now, all playlists
and settings can be backed up by going to YouTube Player > Manage Extension >
Preferences. Then, press `Ctrl`+`Shift`+`I` (or `Cmd`+`Opt`+`I` on MacOS).
In the console, type `getBackup().then(x => console.warn(x))`.
Then, copy the output highlighted in yellow. To restore this backup, type
``useBackup(`[paste backup here]`)`` in the console.

Note: this is only recommended for advanced users.

## License
YouTube Player is licensed under the MIT license. See [LICENSE](./LICENSE) for
details.

## Version History
##### v0.1
 - Ability to create YouTube playlists
 - Ability to play YouTube playlists
 - Ability to have multiple playlists

##### v0.2
 - Ability to customize playback behavior via options page
 - Ability to view and edit existing playlists
 - Ability to view and edit names and descriptions for videos in playlists
 - Better code quality, including more comments

##### v0.3
 - Improvements for behavior when the user navigates while a playlist is
   playing
 - Improvements for behavior when YouTube doesn't load properly
 - An HTML overlay that shows the status of the current playlist and
   allows users to skip back/forward in a playlist
 - Keyboard shortcuts to start playlists

## Future Versions
##### v0.4
 - Ability to auto-generate playlists based on browsing
 - Ability to save and restore playlists (partially implemented in v0.2)
 - Ability to add start/stop times for individual videos
 - Ability to reorder playlists without deleting and re-adding
