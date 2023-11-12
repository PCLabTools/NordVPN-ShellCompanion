/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

'use strict';

import GLib from 'gi://GLib';

import {gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Indicator from './indicator.js';
import * as Monitor from './monitor.js';

export const Manager = class Manager {
    constructor(extension) {
        this._extension = extension;
        this._extensionName = this._extension.metadata.name;
        this._extensionPath = this._extension.path;
        this._textDecoder = new TextDecoder();

        // Create indicator on the panel
        this._indicator = new Indicator.DebianUpdatesIndicator(this);

        // Start connection status monitor
        this._monitor = new Monitor.Monitor(this);
    }

    destroy() {
        // Destroy monitor
        if (this._monitor !== null) {
            this._monitor.destroy();
            this._monitor = null;
        }

        // Destroy indicator
        if (this._indicator !== null) {
            this._indicator.destroy();
            this._indicator = null;
        }
    }

    getNordStatus() {
        var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn status');
        // console.log(`${this._textDecoder.decode(out)}`);
        if (this._textDecoder.decode(out).includes("Status: Disconnected"))
        {
            this._indicator.nordStatus.visible = false;
            this._indicator.nordSeperator.visible = false;
            this._indicator._nordIcon.style_class = 'nordvpn-icon-disconnected';
        }
        else
        {
            this._indicator.nordStatus.label.set_text(_(this._textDecoder.decode(out).substring(10)));
            this._indicator.nordStatus.visible = true;
            this._indicator.nordSeperator.visible = true;
            this._indicator._nordIcon.style_class = 'nordvpn-icon-connected';
        }
        return true;
    }

};