import React from 'react';
import DomTreeSerializer from './dom-tree-serializer.js'

/* Higher Order Component to get the project id from location.hash
 * @param {React.Component} WrappedComponent component to receive projectData prop
 * @returns {React.Component} component with project loading behavior
 */
const ProjectorHOC = function (WrappedComponent) {
    class ProjectorComponent extends React.Component {
        constructor (props) {
            super(props);

            this.state = {
            };

            this.projector = null;
            this.socket = null;

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
