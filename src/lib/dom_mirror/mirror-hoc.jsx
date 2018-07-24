import React from 'react';
import bindAll from 'lodash.bindall';
import DomTreeDeserializer from './dom-tree-deserializer.js'

/* Higher Order Component to get the project id from location.hash
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const MirrorHOC = function (WrappedComponent) {
    class MirrorComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleMessage'
            ]);
            this.state = {
            };
            this.base = null;

            this.receiver = null;
            this.socket = null;

            console.warn('RECEIVER MODE');
            // console.error('------- , ', localStorage.getItem('ccc'))
            // if (localStorage.getItem('ccc') === 'ccc') {
            //     console.error('ddddddd')
            //     return;
            // }
            // localStorage.setItem('ccc', 'ccc');


            this.socket = new WebSocket('ws://localhost:8080/receiver');
            this.socket.onopen = () => {
                this.socket.send(JSON.stringify({ base: location.href.match(/^(.*\/)[^\/]*$/)[1] }));

                this.receiver = new DomTreeDeserializer(document, {
                    createElement: function(nodeData, tagName, parent) {
                        if (tagName == 'SCRIPT') {
                            var node = document.createElement('NO-SCRIPT');
                            node.style.display = 'none';
                            return node;
                        }

                        if (tagName == 'HEAD') {
                            var node = document.createElement('HEAD');
                            node.appendChild(document.createElement('BASE'));
                            node.firstChild.href = this.base;
                            return node;
                        }
                    }
                });
            };

            this.socket.onmessage = event => {
                var msg = JSON.parse(event.data);
                if (msg instanceof Array) {
                    let _this = this;
                    msg.forEach(function(subMessage) {
                        _this.handleMessage(JSON.parse(subMessage));
                    });
                } else {
                    this.handleMessage(msg);
                }
            };

            this.socket.onclose = () => {
                this.socket = null;
            }
        }

        handleMessage(msg) {
            if (msg.clear) {
                while (document.firstChild) {
                    document.removeChild(document.firstChild);
                }
            } else if (msg.base) {
                this.base = msg.base;
            } else {
                this.receiver[msg.f].apply(this.receiver, msg.args);
            }
        }

        componentDidMount () {
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

    return MirrorComponent;
};

export {
    MirrorHOC as default
};
