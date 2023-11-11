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

export const Monitor = class Monitor {
    constructor(Manager) {
        this._manager = Manager;
        this._extension = this._manager._extension;
        this._extensionName = this._extension.metadata.name;
        this.checkInitialConnection();
        this.startConnectionMonitor();
    }

    checkInitialConnection() {
        let updateRate = 1;
        this._initialConnetionID = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            updateRate,
            () => {
                this._manager.getNordStatus();
                return false;
            }
        );
    }

    startConnectionMonitor() {
        let updateRate = 30;
        this._connectionMonitorID = GLib.timeout_add_seconds(
            GLib.PRIORITY_DEFAULT,
            updateRate,
            () => {
                return this._manager.getNordStatus();
            }
        );
    }

    destroy() {
        if (this._initialConnetionID) {
            GLib.source_remove(this._initialConnetionID);
            this._initialConnetionID = 0;
        }
        if (this._connectionMonitorID) {
            GLib.source_remove(this._connectionMonitorID);
            this._connectionMonitorID = 0;
        }
    }
};