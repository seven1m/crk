# Crk

[![screenshot, yay!][2]][1]

This is a simple cork board app with sharable post-it notes and colored pins.

Changes are reflected on all connected clients in near real time via [Socket.IO][3].

This was developed quickly for fun and to show off [Backbone.js][4] at the May 2011 meeting of [TulsaWebDevs][5].

[1]: http://www.flickr.com/photos/timothymorgan/5667660671/
[2]: http://farm6.static.flickr.com/5146/5667660671_46e5ac4072.jpg
[3]: http://socket.io
[4]: http://documentcloud.github.com/backbone/
[5]: http://www.facebook.com/group.php?gid=199713962534

## Features / Usage

* Click **New** to create a new note.
* Double-click a note to edit it.
* Single-click a note to get its unique url and center it on the screen.
* Click a note's outside edge to drag and move it.
* Click the push pin to change it's color. Clicking will cycle through red, green, blue, and yellow.
* Click and drag the outline in the workspace preview in the lower-right in order to scroll quickly.
* Click the triangle in the lower-right corner of a note to change note size (two sizes).
* Select a note (a red outline will appear) and click the **Delete** button to delete it permanently.

## Installation

You'll need Node.js and the following modules (install with npm):

* express
* jade
* socket.io
* mongodb@0.9.3 (node-mongodb-native, version 0.9.4 seems to have a bug)

You'll also need to have MongoDB running.

## Running

To run in development mode:

    node d.js app.js

Modifying a file should restart the app automatically.

## Testing

I have only tested this on Chrome 11 and Firefox 4. If you find issues with other browsers, let me know.

## Author

Tim Morgan [@seven1m](http://twitter.com/seven1m) | [timmorgan.org](http://timmorgan.org)

## Copyright

Copyright (c) 2011, Tim Morgan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
