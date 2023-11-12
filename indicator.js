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
import GObject from 'gi://GObject';
import St from 'gi://St';

import {gettext as _, ngettext as n_} from 'resource:///org/gnome/shell/extensions/extension.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

export const DebianUpdatesIndicator = GObject.registerClass({
    GTypeName: 'DebianUpdatesIndicator',
}, class DebianUpdatesIndicator extends PanelMenu.Button {
    _init(Manager) {
        this._manager = Manager;

        this._extension = this._manager._extension;
        this._extensionName = this._extension.metadata.name;

        super._init(0.0, `${this._extensionName}`, false);

        this._nordIcon = new St.Icon({
            style_class: 'nordvpn-icon-connected'
        });

        this.add_child(this._nordIcon);

        this._assembleMenu();

        Main.panel.addToStatusArea(`${this._extensionName} Indicator`, this);
    }

    destroy() {
        this._nordIcon.destroy();

        super.destroy();
    }

    _assembleMenu() {
        this.nordStatus = new PopupMenu.PopupMenuItem(_('Status'));
        this.nordStatus.visible = false;
        this.nordStatus.reactive = false;
        
        this.nordSeperator = new PopupMenu.PopupSeparatorMenuItem()
        this.nordSeperator.visible = false;
        this.nordSeperator.reactive = false;
        
        this.nordConnect = new PopupMenu.PopupSubMenuMenuItem(_('Connect')); 
        
        this.nordConnectFastest = new PopupMenu.PopupMenuItem(_('Fastest'));
        this.nordConnectFastest.connect('activate', () => {
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn connect');
            this._nordCheckConnected(out, 'Fastest');
        });
          
        this.nordConnectUK = new PopupMenu.PopupMenuItem(_('United Kingdom'));
        this.nordConnectUK.connect('activate', () => {
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn connect uk');
            this._nordCheckConnected(out, 'United Kingdom');
        });
  
        this.nordConnectNL = new PopupMenu.PopupMenuItem(_('Netherlands'));
        this.nordConnectNL.connect('activate', () => {
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn connect nl');
            this._nordCheckConnected(out, 'Netherlands');
        });
        
        this.nordDisconnect = new PopupMenu.PopupMenuItem(_('Disconnect'));
        this.nordDisconnect.connect('activate', () => {
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn disconnect');
            this._nordCheckDisconnected(out);
        });
        
        // construct menu
        this.menu.addMenuItem(this.nordStatus);
        this.menu.addMenuItem(this.nordSeperator);
        this.nordConnect.menu.addMenuItem(this.nordConnectFastest);
        this.nordConnect.menu.addMenuItem(this.nordConnectUK);
        this.nordConnect.menu.addMenuItem(this.nordConnectNL);
        this.menu.addMenuItem(this.nordConnect);
        this.menu.addMenuItem(this.nordDisconnect);
      }

    _nordCheckConnected(out, ccode)
    {
        if (this._manager._textDecoder.decode(out).includes("connected"))
        {
            console.log(`${this._extension.metadata.name} - Connected`);
            Main.notify(_(`Connected to ${ccode}`));
            this._manager.getNordStatus();
        }
        else
        {
            console.log(`${this._extension.metadata.name} - Failed to connect`);
            Main.notify(_("Failed to connect"));
        }
    }

    _nordCheckDisconnected(out)
    {
        if (this._manager._textDecoder.decode(out).includes("disconnected"))
        {
            console.log(`${this._extension.metadata.name} - Disconnected`);
            Main.notify(_("Disconnected"));
            this._manager.getNordStatus();
        }
        else
        {
            console.log(`${this._extension.metadata.name} - No connection to close`);
            Main.notify(_("You are not connected to a VPN"));
        }
    }
});
