import Cookies from 'react-cookies';
import PropTypes from 'prop-types';
import { Game, LobbyAPI } from 'boardgame.io';
import { SocketIO } from 'boardgame.io/multiplayer';
// import { Client } from "boardgame.io/dist/types/packages/client";
import { Local } from 'boardgame.io/dist/types/packages/multiplayer';
import { DebugOpt } from 'boardgame.io/dist/types/src/client/client';
// import { GameComponent, LobbyConnection } from "boardgame.io/dist/types/src/lobby/connection";
// import  { MatchOpts } from "boardgame.io/dist/types/src/lobby/match-instance";
import React, { ComponentType } from 'react';
import LobbyLoginForm from './LobbyLoginForm';
import LobbyCreateMatchForm from './LobbyCreateMatchForm';
import { Client } from 'boardgame.io/react';
// import { LobbyConnection } from 'boardgame.io/client';
import LobbyMatchInstance, { MatchOpts } from './LobbyMatchInstance';
import { LobbyConnection } from './LobbyConnection';
import withRouter from 'next/dist/client/with-router';
import { lobbyClient } from '../pages';
// import { LobbyConnection } from 'boardgame.io/dist/types/src/lobby/connection';
// import { Client } from 'boardgame.io/dist/types/packages/react';

export interface GameComponent {
  game: Game;
  board: ComponentType<any>;
}

export interface LobbyConnectionOpts {
  server: string;
  playerName?: string;
  playerCredentials?: string;
  gameComponents: GameComponent[];
}

enum LobbyPhases {
  ENTER = 'enter',
  PLAY = 'play',
  LIST = 'list',
}

type RunningMatch = {
  app: ReturnType<typeof Client>;
  matchID: string;
  playerID: string;
  credentials?: string;
};

type LobbyProps = {
  gameComponents: GameComponent[];
  lobbyServer?: string;
  gameServer?: string;
  debug?: DebugOpt | boolean;
  clientFactory?: typeof Client;
  refreshInterval?: number;
  renderer?: (args: {
    errorMsg: string;
    gameComponents: GameComponent[];
    matches: LobbyAPI.MatchList['matches'];
    phase: LobbyPhases;
    playerName: string;
    runningMatch?: RunningMatch;
    handleEnterLobby: (playerName: string) => void;
    handleExitLobby: () => Promise<void>;
    handleCreateMatch: (gameName: string, numPlayers: number) => Promise<void>;
    handleJoinMatch: (
      gameName: string,
      matchID: string,
      playerID: string
    ) => Promise<void>;
    handleLeaveMatch: (gameName: string, matchID: string) => Promise<void>;
    handleExitMatch: () => void;
    handleRefreshMatches: () => Promise<void>;
    handleStartMatch: (gameName: string, matchOpts: MatchOpts) => void;
  }) => JSX.Element;
};

type LobbyState = {
  phase: LobbyPhases;
  playerName: string;
  runningMatch?: RunningMatch;
  errorMsg: string;
  credentialStore?: { [playerName: string]: string };
  showLoginForm: boolean;
};

/**
 * Lobby
 *
 * React lobby component.
 *
 * @param {Array}  gameComponents - An array of Board and Game objects for the supported games.
 * @param {string} lobbyServer - Address of the lobby server (for example 'localhost:8000').
 *                               If not set, defaults to the server that served the page.
 * @param {string} gameServer - Address of the game server (for example 'localhost:8001').
 *                              If not set, defaults to the server that served the page.
 * @param {function} clientFactory - Function that is used to create the game clients.
 * @param {number} refreshInterval - Interval between server updates (default: 2000ms).
 * @param {bool}   debug - Enable debug information (default: false).
 *
 * Returns:
 *   A React component that provides a UI to create, list, join, leave, play or
 *   spectate matches (game instances).
 */
class BaseLobby extends React.Component<LobbyProps, LobbyState> {
  static propTypes = {
    gameComponents: PropTypes.array.isRequired,
    lobbyServer: PropTypes.string,
    gameServer: PropTypes.string,
    debug: PropTypes.bool,
    clientFactory: PropTypes.func,
    refreshInterval: PropTypes.number,
  };

  static defaultProps = {
    debug: false,
    clientFactory: Client,
    refreshInterval: 2000,
  };

  state = {
    phase: LobbyPhases.ENTER,
    playerName: 'Visitor',
    runningMatch: null,
    errorMsg: '',
    credentialStore: {},
    showLoginForm: false,
  };

  private connection?: ReturnType<typeof LobbyConnection>;

  constructor(props: LobbyProps) {
    super(props);
    this._createConnection(this.props);
    setInterval(this._updateConnection, this.props.refreshInterval);
  }

  componentDidMount() {
    const cookie = Cookies.load('lobbyState') || {};
    if (cookie.phase && cookie.phase === LobbyPhases.PLAY) {
      cookie.phase = LobbyPhases.LIST;
    }
    this.setState({
      phase: cookie.phase || LobbyPhases.ENTER,
      playerName: cookie.playerName || 'Visitor',
      credentialStore: cookie.credentialStore || {},
    });
  }

  componentDidUpdate(prevProps: LobbyProps, prevState: LobbyState) {
    const name = this.state.playerName;
    const creds = this.state.credentialStore[name];
    if (
      prevState.phase !== this.state.phase ||
      prevState.credentialStore[name] !== creds ||
      prevState.playerName !== name
    ) {
      this._createConnection(this.props);
      this._updateConnection();
      const cookie = {
        phase: this.state.phase,
        playerName: name,
        credentialStore: this.state.credentialStore,
      };
      Cookies.save('lobbyState', cookie, { path: '/' });
    }
  }

  _createConnection = (props: LobbyProps) => {
    const name = this.state.playerName;
    this.connection = LobbyConnection({
      server: props.lobbyServer,
      gameComponents: props.gameComponents,
      playerName: name,
      playerCredentials: this.state.credentialStore[name],
    });
  };

  _updateCredentials = (playerName: string, credentials: string) => {
    this.setState((prevState) => {
      // clone store or componentDidUpdate will not be triggered
      const store = Object.assign({}, prevState.credentialStore);
      store[playerName] = credentials;
      return { credentialStore: store };
    });
  };

  _updateConnection = async () => {
    await this.connection.refresh();
    this.forceUpdate();
  };

  _enterLobby = (playerName: string) => {
    this.setState({ playerName, phase: LobbyPhases.LIST });
  };

  _exitLobby = async () => {
    await this.connection.disconnect();
    this.setState({ phase: LobbyPhases.ENTER, errorMsg: '' });
  };

  _createMatch = async (gameName: string, numPlayers: number) => {
    try {
      const { matchID } = await lobbyClient.createMatch(gameName, {
        numPlayers,
      });
      // @ts-ignore
      this.props.router.push(`/${gameName}/${matchID}`);
      // const { matchId } = await this.connection.create(gameName, numPlayers);
      // await this.connection.refresh();
      // rerender
      this.setState({});
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _joinMatch = async (gameName: string, matchID: string, playerID: string) => {
    try {
      await this.connection.join(gameName, matchID, playerID);
      await this.connection.refresh();
      this._updateCredentials(
        this.connection.playerName,
        this.connection.playerCredentials
      );
      // @ts-ignore
      this.props.router.push(`/${gameName}/${matchID}`);
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _leaveMatch = async (gameName: string, matchID: string) => {
    try {
      await this.connection.leave(gameName, matchID);
      await this.connection.refresh();
      this._updateCredentials(
        this.connection.playerName,
        this.connection.playerCredentials
      );
    } catch (error) {
      this.setState({ errorMsg: error.message });
    }
  };

  _startMatch = (gameName: string, matchOpts: MatchOpts) => {
    const gameCode = this.connection._getGameComponents(gameName);
    if (!gameCode) {
      this.setState({
        errorMsg: 'game ' + gameName + ' not supported',
      });
      return;
    }

    let multiplayer = undefined;
    if (matchOpts.numPlayers > 1) {
      multiplayer = this.props.gameServer
        ? SocketIO({ server: this.props.gameServer })
        : SocketIO();
    }

    // no bots!
    // if (matchOpts.numPlayers == 1) {
    //   const maxPlayers = gameCode.game.maxPlayers;
    //   const bots = {};
    //   for (let i = 1; i < maxPlayers; i++) {
    //     bots[i + ''] = MCTSBot;
    //   }
    //   multiplayer = Local({ bots });
    // }

    const app = this.props.clientFactory({
      game: gameCode.game,
      board: gameCode.board,
      debug: this.props.debug,
      multiplayer,
    });

    const match = {
      app: app,
      matchID: matchOpts.matchID,
      playerID: matchOpts.numPlayers > 1 ? matchOpts.playerID : '0',
      credentials: this.connection.playerCredentials,
    };

    this.setState({ phase: LobbyPhases.PLAY, runningMatch: match });
  };

  _exitMatch = () => {
    this.setState({ phase: LobbyPhases.LIST, runningMatch: null });
  };

  _getPhaseVisibility = (phase: LobbyPhases) => {
    return this.state.phase !== phase ? 'hidden' : 'phase';
  };

  renderMatches = (
    matches: LobbyAPI.MatchList['matches'],
    playerName: string
  ) => {
    return matches.map((match) => {
      const { matchID, gameName, players } = match;
      return (
        <LobbyMatchInstance
          key={'instance-' + matchID}
          match={{ matchID, gameName, players: Object.values(players) }}
          playerName={playerName}
          onClickJoin={this._joinMatch}
          onClickLeave={this._leaveMatch}
          onClickPlay={this._startMatch}
        />
      );
    });
  };

  render() {
    const { gameComponents, renderer } = this.props;
    const { errorMsg, playerName, phase, runningMatch } = this.state;

    if (renderer) {
      return renderer({
        errorMsg,
        gameComponents,
        matches: this.connection.matches,
        phase,
        playerName,
        runningMatch,
        handleEnterLobby: this._enterLobby,
        handleExitLobby: this._exitLobby,
        handleCreateMatch: this._createMatch,
        handleJoinMatch: this._joinMatch,
        handleLeaveMatch: this._leaveMatch,
        handleExitMatch: this._exitMatch,
        handleRefreshMatches: this._updateConnection,
        handleStartMatch: this._startMatch,
      });
    }

    return (
      <div id="lobby-view" style={{ padding: 50 }}>
        <div className={this._getPhaseVisibility(LobbyPhases.ENTER)}>
          <LobbyLoginForm
            // onCancel={() => {}}
            key={playerName}
            playerName={playerName}
            onEnter={this._enterLobby}
          />
        </div>

        <div className={this._getPhaseVisibility(LobbyPhases.LIST)}>
          <section aria-labelledby="profile-overview-title" className="mb-4">
            <div className="rounded-lg bg-white overflow-hidden shadow">
              <h2 className="sr-only" id="profile-overview-title">
                Profile Overview
              </h2>
              <div className="bg-white p-6">
                {this.state.showLoginForm ? (
                  <LobbyLoginForm
                    onCancel={() => this.setState({ showLoginForm: false })}
                    key={playerName}
                    playerName={playerName}
                    onEnter={(name) => {
                      this.setState({ showLoginForm: false });
                      this._enterLobby(name);
                    }}
                  />
                ) : (
                  <div className="sm:flex sm:items-center sm:justify-between">
                    <div className="sm:flex sm:space-x-5">
                      {/* <div className="flex-shrink-0">
                          <img className="mx-auto h-20 w-20 rounded-full" src={user.imageUrl} alt="" />
                        </div> */}

                      <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                        <p className="text-sm font-medium text-gray-600">
                          Welcome back,
                        </p>
                        <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                          {playerName}
                        </p>
                        {/* <p className="text-sm font-medium text-gray-600">{user.role}</p> */}
                      </div>
                    </div>
                    <div className="mt-5 flex justify-center sm:mt-0">
                      <button
                        onClick={() =>
                          this.setState({
                            showLoginForm: !this.state.showLoginForm as boolean,
                          })
                        }
                        className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      >
                        Change Name
                      </button>
                    </div>
                  </div>
                )}
                {/* {this.state.showLoginForm && (
              <LobbyLoginForm
              key={playerName}
              playerName={playerName}
              onEnter={this._enterLobby}
            />

            )} */}
              </div>
            </div>
          </section>

          <div className="phase-title" id="match-creation">
            <LobbyCreateMatchForm
              games={gameComponents}
              createMatch={this._createMatch}
            />
          </div>
          <p className="phase-title">Join a match:</p>
          <div id="instances">
            <table>
              <tbody>
                {this.renderMatches(this.connection.matches, playerName)}
              </tbody>
            </table>
            <span className="error-msg">
              {errorMsg}
              <br />
            </span>
          </div>
          <p className="phase-title">
            Matches that become empty are automatically deleted.
          </p>
        </div>

        <div className={this._getPhaseVisibility(LobbyPhases.PLAY)}>
          {runningMatch && (
            <runningMatch.app
              matchID={runningMatch.matchID}
              playerID={runningMatch.playerID}
              credentials={runningMatch.credentials}
            />
          )}
          <div className="buttons" id="match-exit">
            <button onClick={this._exitMatch}>Exit match</button>
          </div>
        </div>

        <div className="buttons" id="lobby-exit">
          <button onClick={this._exitLobby}>Exit lobby</button>
        </div>
      </div>
    );
  }
}

// @ts-ignore
export default withRouter(BaseLobby);
