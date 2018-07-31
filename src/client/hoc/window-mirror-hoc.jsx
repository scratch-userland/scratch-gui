import React from 'react';
const BrowserWindow = require('electron').remote.BrowserWindow

/* Higher Order Component to control window mirror
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const WindowMirrorHOC = function (WrappedComponent) {
    class WindowMirrorComponent extends React.Component {
        constructor (props) {
            super(props);
            this.state = {
                mirroring: false
            };
        }
        componentDidMount () {
            console.log('--------');
            var win = new BrowserWindow({
                transparent: true,
                frame: false,
                width: 400,
                height: 275
            })
            win.loadURL('http://www.baidu.com');
            win.setFullScreen(true);
            win.show();
        }
        componentWillUnmount () {
        }
        render () {
            return (
                <WrappedComponent
                    {...this.props}
                />
            );
        }
    }

    return WindowMirrorComponent;
};

export {
    WindowMirrorHOC as default
};
