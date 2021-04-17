import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useState } from 'react';
import { GAME_COMPONENTS, HOST, lobbyClient } from '..';
import { TicTacToeBoard } from '../../components/Board';
import { LobbyConnection } from '../../components/LobbyConnection';
import { usePlayer } from '../../hooks/usePlayer';
import { TicTacToe } from '../../lib/Game';

const useLobbyConnection = () => {
  const [player] = usePlayer();
  const [connection, setConnection] = useState({});

  useEffect(() => {
    const lobbyConnection = LobbyConnection({
      server: HOST,
      gameComponents: GAME_COMPONENTS,
      playerName: player.name,
    });
    setConnection(lobbyConnection);
  }, []);

  return connection;
};

const useMatch = (gameName, id) => {
  const [match, setMatch] = useState(null);

  useEffect(() => {
    async function getMatch() {
      const result = await lobbyClient.getMatch(gameName, id);
      setMatch(result);
    }

    if (gameName && id) {
      getMatch();
    }
  }, [gameName, id]);

  return match;
};

const GameClient = Client({
  game: TicTacToe,
  board: TicTacToeBoard,
  multiplayer: SocketIO({ server: HOST }),
});

export default function GameView() {
  const {
    query: { game, id },
  } = useRouter();
  const connection = useLobbyConnection();
  const [player, setPlayer] = usePlayer();
  const match = useMatch(game, id);

  const freeSeat = match.players.find((player) => !player.name);

  const playerSeat = match?.players?.find(
    (matchPlayer) => matchPlayer.id === player?.id
  );

  console.log({ match, player, playerSeat, freeSeat });

  // player has joined, more seats are available
  if (playerSeat && freeSeat) {
    return (
      <div>
        <button>Leave Game</button>
      </div>
    );
  }

  // player hasn't joined, seats are available
  if (freeSeat) {
    return (
      <div>
        <button>Join Game</button>
      </div>
    );
  }

  // player has joined, game is full
  if (playerSeat) {
  }

  // @TODO: player hasn't joined and game is full, but can join as a spectator

  return (
    <GameClient
      matchID={id as string}
      playerID={player.id}
      credentials={player.id}
    />
  );
}
