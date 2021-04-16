import Link from 'next/link'
import { Client } from 'boardgame.io/react';
import { SocketIO } from 'boardgame.io/multiplayer'
import { TicTacToe } from '../lib/Game';
import { TicTacToeBoard } from '../components/Board';
import { LobbyClient } from 'boardgame.io/client';
import { useAsync } from '../hooks/useAsync';
import React from 'react';
import { Lobby } from '../components/Lobby';

const lobbyClient = new LobbyClient({ server: 'http://localhost:8000' });

const asyncFunction = async () => {
  const result = await lobbyClient.listGames();
  return result;
}

const GameClient = Client({ game: TicTacToe, board: TicTacToeBoard, multiplayer: SocketIO({ server: 'localhost:8000' }) })

const useLobby = () => {
  const result = useAsync(asyncFunction)

  return result;
}

class App extends React.Component {
  state = { playerID: null };

  render() {
    if (this.state.playerID === null) {
      return (
        <div>
          <p>Play as</p>
          <button onClick={() => this.setState({ playerID: "0" })}>
            Player 0
          </button>
          <button onClick={() => this.setState({ playerID: "1" })}>
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


export default function Home() {
  const result = useLobby();

  // console.log(result);
  return (
    <div>
      <Lobby
        gameServer={`http://localhost:8000`}
        lobbyServer={`http://localhost:8000`}
        gameComponents={[
                { game: TicTacToe, board: TicTacToeBoard }
        ]}
      />
    </div>
  )
}
