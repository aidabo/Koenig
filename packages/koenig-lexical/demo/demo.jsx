import './styles/demo.css';
import DemoApp from './DemoApp';
import HtmlOutputDemo from './HtmlOutputDemo';
import Navigator from './components/Navigator';
import React from 'react';
import ReactDOM from 'react-dom/client';
import RestrictedContentDemo from './RestrictedContentDemo';
import {
    BrowserRouter,
    Route,
    HashRouter as Router,
    Routes
} from 'react-router-dom';
import {DesignSandbox} from '../src';

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <Router>
            <Navigator />
            <Routes>
                <Route element={<DesignSandbox />} path="/designsandbox" />
                <Route element={<RestrictedContentDemo paragraphs={1} />} path="/contentrestricted" />
                <Route element={<HtmlOutputDemo />} path="/html-output" />
                <Route element={<DemoApp introContent={true} />} path="/" />
                <Route element={<DemoApp editorType='basic' introContent={true} />} path="/basic" />
                <Route element={<DemoApp editorType='minimal' introContent={true} />} path="/minimal" />
                <Route element={<DemoApp introContent={true} isMultiplayer={true} />} path="/multiplayer" />
            </Routes>
        </Router>
    </React.StrictMode>
);
