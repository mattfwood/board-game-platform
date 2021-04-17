import Link from 'next/link';
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer';
import { TicTacToe } from '../lib/Game';
import { TicTacToeBoard } from '../components/Board';
import { LobbyClient } from 'boardgame.io/client';
import { useAsync } from '../hooks/useAsync';
import React from 'react';
import Lobby from '../components/Lobby';

const isDev = process.env.NODE_ENV !== 'production';
export const HOST = isDev
  ? 'http://localhost:8000'
  : 'https://board-game-backend.herokuapp.com';

export const lobbyClient = new LobbyClient({ server: HOST });

const asyncFunction = async () => {
  const result = await lobbyClient.listGames();
  return result;
};

const GameClient = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: SocketIO({ server: HOST }),
});

const useLobby = () => {
  const result = useAsync(asyncFunction);

  return result;
};

class App extends React.Component {
  state = { playerID: null };

  render() {
    if (this.state.playerID === null) {
      return (
        <div>
          <p>Play as</p>
          <button onClick={() => this.setState({ playerID: '0' })}>
            Player 0
          </button>
          <button onClick={() => this.setState({ playerID: '1' })}>
            Player 1
          </button>
        </div>
      );
    }
    return (
      <div>
        <GameClient playerID={this.state.playerID} />
      </div>
    );
  }
}

export const GAME_COMPONENTS = [{ game: TicTacToe, board: TicTacToeBoard }];

export default function Home() {
  const result = useLobby();

  // console.log(result);
  return (
    <div>
      <Lobby
        gameServer={HOST}
        lobbyServer={HOST}
        gameComponents={GAME_COMPONENTS}
      />
    </div>
  );
}
