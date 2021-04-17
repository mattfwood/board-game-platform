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

    getMatch();
  }, []);

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

  console.log(match);

  // console.log(connection);
  // console.log(player);
  // console.log({ game, id });
  return <GameClient matchID={id} playerID={player.id} />;
}
