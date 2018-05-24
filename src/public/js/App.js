import React from 'react';
import devProcessTesting from './utils/dev-test';
import { createConnection } from './utils/connection';
import { SOCKET_EVENT_TYPE } from '../../shared/constants';
import ViewsSwitchList, {
    SWITCH_KEYS
} from './components/controls/ViewsSwitchList';
import TreeDiagram from './components/tree-diagram/TreeDiagram';
import {
    getTreeLayout,
    getTreeLayoutWithCodeCrumbs
} from './components/tree-diagram/treeLayout';

import './App.css';

class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            switchesOn: {
                [SWITCH_KEYS.SOURCE]: true,
                [SWITCH_KEYS.DEPENDENCIES]: false, //TODO: false
                [SWITCH_KEYS.CODE_CRUMBS]: false
            },

            filesTreeLayoutNodes: null,
            filesTree: null,
            filesList: null,
            dependenciesList: null
        };
    }

    componentDidMount() {
        createConnection(({ type, data }) => this.onSocketEvent(type, data));
    }

    onSwitchChange = (key, checked) => {
        let subState = {
            switchesOn: {
                ...this.state.switchesOn,
                [key]: checked
            }
        };

        if (key === SWITCH_KEYS.CODE_CRUMBS) {
            subState = {
                ...subState,
                filesTreeLayoutNodes: getTreeLayout(
                    this.state.filesTree,
                    checked
                )
            };
        }

        this.setState(subState);
    };

    onSocketEvent(type, data) {
        switch (type) {
            case SOCKET_EVENT_TYPE.SYNC_SOURCE_FILES:
                const { switchesOn } = this.state;
                const { filesTree, filesList, dependenciesList } = data.body;
                const filesTreeLayoutNodes = getTreeLayout(
                    filesTree,
                    switchesOn[SWITCH_KEYS.CODE_CRUMBS]
                );

                this.setState({
                    filesTreeLayoutNodes,
                    filesTree,
                    filesList,
                    dependenciesList
                });
                break;

            default:
                break;
        }
    }

    render() {
        const {
            filesTreeLayoutNodes,
            dependenciesList,
            switchesOn
        } = this.state;

        return (
            <div className="App-container">
                <ViewsSwitchList
                    defaultChecked={SWITCH_KEYS.SOURCE}
                    onChange={this.onSwitchChange}
                />

                <TreeDiagram
                    filesTreeLayoutNodes={filesTreeLayoutNodes}
                    dependenciesList={dependenciesList}
                    sourceDiagramOn={switchesOn[SWITCH_KEYS.SOURCE]}
                    dependenciesDiagramOn={switchesOn[SWITCH_KEYS.DEPENDENCIES]}
                    codeCrumbsDiagramOn={switchesOn[SWITCH_KEYS.CODE_CRUMBS]}
                />

                <footer className="App-footer">
                    Bohdan Liashenko{' '}
                    <a href="https://github.com/Bogdan-Lyashenko/codecrumbs">
                        Project Github
                    </a>
                </footer>
            </div>
        );
    }
}

export default App;