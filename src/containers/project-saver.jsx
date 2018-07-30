import bindAll from 'lodash.bindall';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {desktopCapturer} from 'electron';
import Peer from 'peerjs';

/**
 * Project saver component passes a saveProject function to its child.
 * It expects this child to be a function with the signature
 *     function (saveProject, props) {}
 * The component can then be used to attach project saving functionality
 * to any other component:
 *
 * <ProjectSaver>{(saveProject, props) => (
 *     <MyCoolComponent
 *         onClick={saveProject}
 *         {...props}
 *     />
 * )}</ProjectSaver>
 */
class ProjectSaver extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'saveProject'
        ]);
    }
    saveProject () {
        desktopCapturer.getSources({types: ['window']}, (error, sources) => {
            if (error) {
                console.debug('get window source error: ', error);
            } else {
                for (let i = 0; i < sources.length; ++i) {
                    if (sources[i].name === 'Scratch 3.0 GUI') {
                        console.debug('got scratch window source: ', sources[i]);
                        navigator.mediaDevices.getUserMedia({
                            audio: false,
                            video: {
                                mandatory: {
                                    chromeMediaSource: 'desktop',
                                    chromeMediaSourceId: sources[i].id,
                                    minWidth: 1920,
                                    maxWidth: 1920,
                                    minHeight: 1080,
                                    maxHeight: 1080
                                }
                            }
                        })
                            .then(stream => {
                                console.debug('got scratch window stream: ', stream);
                                // Answer the call, providing our mediaStream
                                console.log('call stream!');
                                var opt = {
                                    host: '127.0.0.1',
                                    port: 9000,
                                    path: '/mirror'
                                };
                                var peer = new Peer('sender_peer_manson', opt);
                                var call = peer.call('receiver_peer_manson', stream);
                            })
                            .catch(e => {
                                console.debug('fetch scratch window stream error: ', e);
                            });
                        break;
                    }
                }
            }
        });

        // const saveLink = document.createElement('a');
        // document.body.appendChild(saveLink);
        //
        // this.props.vm.saveProjectSb3().then(content => {
        //     // TODO user-friendly project name
        //     // File name: project-DATE-TIME
        //     const date = new Date();
        //     const timestamp = `${date.toLocaleDateString()}-${date.toLocaleTimeString()}`;
        //     const filename = `untitled-project-${timestamp}.sb3`;
        //
        //     // Use special ms version if available to get it working on Edge.
        //     if (navigator.msSaveOrOpenBlob) {
        //         navigator.msSaveOrOpenBlob(content, filename);
        //         return;
        //     }
        //
        //     const url = window.URL.createObjectURL(content);
        //     saveLink.href = url;
        //     saveLink.download = filename;
        //     saveLink.click();
        //     window.URL.revokeObjectURL(url);
        //     document.body.removeChild(saveLink);
        // });
    }
    render () {
        const {
            /* eslint-disable no-unused-vars */
            children,
            vm,
            /* eslint-enable no-unused-vars */
            ...props
        } = this.props;
        return this.props.children(this.saveProject, props);
    }
}

ProjectSaver.propTypes = {
    children: PropTypes.func,
    vm: PropTypes.shape({
        saveProjectSb3: PropTypes.func
    })
};

const mapStateToProps = state => ({
    vm: state.scratchGui.vm
});

export default connect(
    mapStateToProps,
    () => ({}) // omit dispatch prop
)(ProjectSaver);
