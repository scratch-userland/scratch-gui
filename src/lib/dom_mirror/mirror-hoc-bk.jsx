import React from 'react';
import bindAll from 'lodash.bindall';
import DomTreeSerializer from './dom-tree-serializer.js'
import DomTreeDeserializer from './dom-tree-deserializer.js'

/* Higher Order Component to get the project id from location.hash
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const ProjectorHOC = function (WrappedComponent) {
    class ProjectorComponent extends React.Component {
        constructor (props) {
            super(props);
            bindAll(this, [
                'handleMessage'
            ]);
            this.state = {
            };
            this.base = null;

            this.receiver = null;
            this.projector = null;
            this.socket = null;


            if (window.location.search === '?type=receiver') {
                console.warn('RECEIVER MODE');
                // console.error('------- , ', localStorage.getItem('ccc'))
                if (localStorage.getItem('ccc') === 'ccc') {
                    console.error('ddddddd')
                    return;
                }

                localStorage.setItem('ccc', 'ccc');


                this.socket = new WebSocket('ws://localhost:8080/receiver');
                this.socket.onopen = () => {
                    this.socket.send(JSON.stringify({ base: location.href.match(/^(.*\/)[^\/]*$/)[1] }));

                    this.receiver = new DomTreeDeserializer(document, {
                        // createElement: function(nodeData, tagName, parent) {
                            // console.log('---------- ', nodeData);
                            // if (tagName == 'SCRIPT') {
                            //     var node = document.createElement('NO-SCRIPT');
                            //     node.style.display = 'none';
                            //     return node;
                            // }

                            // if (tagName == 'HEAD') {
                            //     var node = document.createElement('HEAD');
                            //     node.appendChild(document.createElement('BASE'));
                            //     node.firstChild.href = this.base;
                            //     return node;
                            // }
                        // }
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
            } else if (window.location.search === '?type=projector') {
                console.warn('PROJECTOR MODE');
                this.socket = new WebSocket('ws://localhost:8080/projector');
                this.socket.onopen = () => {
                    this.socket.send(JSON.stringify({ base: location.href.match(/^(.*\/)[^\/]*$/)[1] }));

                    this.projector = new DomTreeSerializer(document, {
                        initialize: (rootId, children) => {
                            this.socket.send(JSON.stringify({
                                f: 'initialize',
                                args: [rootId, children]
                            }));

                            // console.log('DomTreeSerializer ---- initialize');
                            // console.log('DomTreeSerializer rootId ---- ', rootId);
                            // console.log('DomTreeSerializer children ---- ', children);
                        },

                        applyChanged: (removed, addedOrMoved, attributes, text) => {
                            this.socket.send(JSON.stringify({
                                f: 'applyChanged',
                                args: [removed, addedOrMoved, attributes, text]
                            }));

                            // console.log('DomTreeSerializer ---- applyChanged');
                            // console.log('DomTreeSerializer removed ---- ', removed);
                            // console.log('DomTreeSerializer addedOrMoved ---- ', addedOrMoved);
                            // console.log('DomTreeSerializer attributes ---- ', attributes);
                            // console.log('DomTreeSerializer text ---- ', text);
                        }
                    });
                };
                this.socket.onclose = () => {
                    this.projector.disconnect();
                    this.socket = null;
                }
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

    return ProjectorComponent;
};

export {
    ProjectorHOC as default
};
