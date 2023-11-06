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

import GObject from 'gi://GObject';
import St from 'gi://St';
const GLib = imports.gi.GLib;

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('My Shiny Indicator'));

        this.add_child(new St.Icon({
            icon_name: 'face-smile-symbolic',
            style_class: 'system-status-icon',
        }));

        let nordStatus = new PopupMenu.PopupMenuItem(_('Status'));
        nordStatus.connect('activate', () => {
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn status');
            Main.notify(_(out.toString().replace("\n", "")));
        });
        this.menu.addMenuItem(nordStatus);

        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        let nordConnect = new PopupMenu.PopupSubMenuMenuItem(_('Connect')); 
        this.menu.addMenuItem(nordConnect);

        let nordConnectFastest = new PopupMenu.PopupMenuItem(_('Fastest'));
        nordConnectFastest.connect('activate', () => {
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn connect');
            Main.notify(_('Connecting...'));
            if (out.toString().includes("connected"))
            {
                Main.notify(_("Connected"));
            }
            else
            {
                Main.notify(_("Failed to connect"));
            }
        });
        nordConnect.menu.addMenuItem(nordConnectFastest);

        let nordConnectUK = new PopupMenu.PopupMenuItem(_('United Kingdom'));
        nordConnectUK.connect('activate', () => {
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn connect uk');
            if (out.toString().includes("connected"))
            {
                Main.notify(_("Connected"));
            }
            else
            {
                Main.notify(_("Failed to connect"));
            }
        });
        nordConnect.menu.addMenuItem(nordConnectUK);

        let nordConnectNL = new PopupMenu.PopupMenuItem(_('Netherlands'));
        nordConnectNL.connect('activate', () => {
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn connect nl');
            if (out.toString().includes("connected"))
            {
                Main.notify(_("Connected"));
            }
            else
            {
                Main.notify(_("Failed to connect"));
            }
        });
        nordConnect.menu.addMenuItem(nordConnectNL);

        let nordDisconnect = new PopupMenu.PopupMenuItem(_('Disconnect'));
        nordDisconnect.connect('activate', () => {
            Main.notify(_('Disconnecting...'));
            var [ok, out, err, exit] = GLib.spawn_command_line_sync('nordvpn disconnect');
            if (out.toString().includes("disconnected"))
            {
                Main.notify(_("Disconnected"));
            }
            else
            {
                Main.notify(_("You are not connected to a VPN"));
            }
        });
        this.menu.addMenuItem(nordDisconnect);
    }
});

export default class IndicatorExampleExtension extends Extension {
    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
