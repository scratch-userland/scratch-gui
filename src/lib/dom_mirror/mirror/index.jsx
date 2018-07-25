// Polyfills
import 'es6-object-assign/auto';
import 'core-js/fn/array/includes';
import 'intl'; // For Safari 9

import React from 'react';
import ReactDOM from 'react-dom';

// import analytics from '../../analytics';
import MirrorHOC from '../mirror-hoc.jsx'

import styles from './index.css';

if (process.env.NODE_ENV === 'production' && typeof window === 'object') {
    // Warn before navigating away
    window.onbeforeunload = () => true;
}

// Register "base" page view
// analytics.pageview('/');

class FakeGUI extends React.Component {
    constructor(props) {
        super(props);
    }

    render () {
        return <div></div>
    }
}

const appTarget = document.createElement('div');
appTarget.className = styles.app;
document.body.appendChild(appTarget);

// GUI.setAppElement(appTarget);
const WrappedGui = MirrorHOC(FakeGUI);
//
// // TODO a hack for testing the backpack, allow backpack host to be set by url param
// const backpackHostMatches = window.location.href.match(/[?&]backpack_host=([^&]*)&?/);
// const backpackHost = backpackHostMatches ? backpackHostMatches[1] : null;
//
// const backpackOptions = {
//     visible: true,
//     host: backpackHost
// };

ReactDOM.render(<WrappedGui />, appTarget);
