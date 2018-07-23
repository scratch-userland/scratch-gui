import React from 'react';
import bindAll from 'lodash.bindall';
import DomTreeSerializer from 'dom-tree-serializer'
import DomTreeDeserializer from 'dom-tree-deserializer'

/* Higher Order Component to get the project id from location.hash
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const DomMirrorHOC = function (WrappedComponent) {
    class DomMirrorComponent extends React.Component {
        constructor (props) {
            super(props);
            // bindAll(this, [
            //     'handleHashChange'
            // ]);
            this.state = {
                dom_list: []
            };

            this.mirrorClient = null;
            this.projection_socket = new WebSocket('ws://localhost:8080/projector');
            this.projection_socket.onopen = () => {
                this.projection_socket.send(JSON.stringify({ base: location.href.match(/^(.*\/)[^\/]*$/)[1] }));

                this.mirrorClient = new DomTreeSerializer(document, {
                    initialize: (rootId, children) => {
                        this.projection_socket.send(JSON.stringify({
                            f: 'initialize',
                            args: [rootId, children]
                        }));
                        // console.log('DomTreeSerializer ---- initialize');
                        // console.log('DomTreeSerializer rootId ---- ', rootId);
                        // console.log('DomTreeSerializer children ---- ', children);
                    },

                    applyChanged: (removed, addedOrMoved, attributes, text) => {
                        this.projection_socket.send(JSON.stringify({
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
            }

            this.projection_socket.onclose = () => {
                this.mirrorClient.disconnect();
                this.projection_socket = undefined;
            }
        }
        componentDidMount () {
            // window.addEventListener('hashchange', this.handleHashChange);
            // this.handleHashChange();

            // this.mirrorClient = new DomTreeSerializer(document, {
            //     initialize: function(rootId, children) {
            //         // socketSend({
            //         //     f: 'initialize',
            //         //     args: [rootId, children]
            //         // });
            //         console.log('DomTreeSerializer ---- initialize');
            //         console.log('DomTreeSerializer rootId ---- ', rootId);
            //         console.log('DomTreeSerializer children ---- ', children);
            //     },
            //
            //     applyChanged: function(removed, addedOrMoved, attributes, text) {
            //         // socketSend({
            //         //     f: 'applyChanged',
            //         //     args: [removed, addedOrMoved, attributes, text]
            //         // });
            //         console.log('DomTreeSerializer ---- applyChanged');
            //         console.log('DomTreeSerializer removed ---- ', removed);
            //         console.log('DomTreeSerializer addedOrMoved ---- ', addedOrMoved);
            //         console.log('DomTreeSerializer attributes ---- ', attributes);
            //         console.log('DomTreeSerializer text ---- ', text);
            //     }
            // });
        }
        componentWillUnmount () {
            // window.removeEventListener('hashchange', this.handleHashChange);
            this.mirrorClient.disconnect();
        }

        // handleHashChange () {
        //     const hashMatch = window.location.hash.match(/#(\d+)/);
        //     const projectId = hashMatch === null ? 0 : hashMatch[1];
        //     if (projectId !== this.state.projectId) {
        //         this.setState({projectId: projectId});
        //     }
        // }
        render () {
            return (
                <WrappedComponent
                    dom_list={this.state.dom_list}
                    {...this.props}
                />
            );
        }
    }

    return DomMirrorComponent;
};

export {
    DomMirrorHOC as default
};
