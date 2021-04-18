import { LobbyAPI } from 'boardgame.io';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { GAME_COMPONENTS, HOST, lobbyClient } from '..';
import { TicTacToeBoard } from '../../components/Board';
import Lobby, { RendererProps } from '../../components/Lobby';
import { LobbyConnection } from '../../components/LobbyConnection';
import { usePlayer } from '../../hooks/usePlayer';
import { TicTacToe } from '../../lib/Game';

const GameLobby = ({ match }: { match: LobbyAPI.Match }) => {
  const {
    query: { game, id },
  } = useRouter();
  const { connection, refreshLobby } = useLobbyConnection();
  const [player, setPlayer] = usePlayer();
  const freeSeat = match?.players?.find((player) => !player?.name);

  const playerSeat = match?.players?.find(
    (matchPlayer) => matchPlayer?.id === player?.id
  );

  console.log({ connection });

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
        <button
          onClick={async () => {
            await connection.join(
              game as string,
              id as string,
              String(freeSeat.id)
            );

            await refreshLobby();
          }}
        >
          Join Game
        </button>
      </div>
    );
  }

  // player has joined, game is full
  if (playerSeat) {
  }

  return <div>Actions</div>;
};

const useLobbyConnection = () => {
  const [player] = usePlayer();
  const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

  const connection = useRef<ReturnType<typeof LobbyConnection> | null>(null);

  async function refreshLobby() {
    if (connection.current) {
      await connection.current.refresh();
      forceUpdate();
    }
  }

  async function joinGame() {}

  useEffect(() => {
    const lobbyConnection = LobbyConnection({
      server: HOST,
      gameComponents: GAME_COMPONENTS,
      playerName: player.name,
      // playerCredentials: player.id,
    });

    connection.current = lobbyConnection;

    refreshLobby();
  }, [player.name]);

  return {
    connection: connection?.current || null,
    refreshLobby,
  };
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
  // const connection = useLobbyConnection();
  const [player, setPlayer] = usePlayer();
  const match = useMatch(game, id);

  // const freeSeat = match?.players?.find((player) => !player?.name);

  // const playerSeat = match?.players?.find(
  //   (matchPlayer) => matchPlayer?.id === player?.id
  // );

  // console.log({ match, player, playerSeat, freeSeat });

  // // player has joined, more seats are available
  // if (playerSeat && freeSeat) {
  //   return (
  //     <div>
  //       <button>Leave Game</button>
  //     </div>
  //   );
  // }

  // // player hasn't joined, seats are available
  // if (freeSeat) {
  //   return (
  //     <div>
  //       <button>Join Game</button>
  //     </div>
  //   );
  // }

  // // player has joined, game is full
  // if (playerSeat) {
  // }

  // @TODO: player hasn't joined and game is full, but can join as a spectator

  return (
    <>
      {/* <Lobby
        gameServer={HOST}
        lobbyServer={HOST}
        gameComponents={GAME_COMPONENTS}
        renderer={(props: RendererProps) => {
          console.log(props);

          const match = props.matches.find((match) => match.matchID);

          if (!match) return <div>Loading</div>;

          const freeSeat = match.players.find((player) => !player.name);

          const playerSeat = match.players.find(
            (player) => player.name === props.playerName
          );

          return (
            <div>
              <button
                onClick={() => {
                  props.handleJoinMatch(
                    game as string,
                    match?.matchID,
                    String(freeSeat.id)
                  );
                }}
              >
                Join Game
              </button>
              <button
                onClick={() => {
                  props.handleStartMatch(game as string, {
                    matchID: match?.matchID,
                    playerID: '' + playerSeat.id,
                    numPlayers: match.players.length,
                  });
                }}
              >
                Start Game
              </button>
              <ul>
                {match?.players?.map((player) => (
                  <div>{JSON.stringify(player)}</div>
                ))}
              </ul>
              {props.runningMatch && (
                <props.runningMatch.app
                  matchID={props.runningMatch.matchID}
                  playerID={props.runningMatch.playerID}
                  credentials={props.runningMatch.credentials}
                />
              )}
            </div>
          );
        }}
      /> */}
      <GameLobby match={match} />
      <div>
        <h4 className="text-2xl font-bold">Players</h4>
        <ul>
          {match?.players?.map((player) => (
            <li>{JSON.stringify(player)}</li>
          ))}
        </ul>
      </div>
      <GameClient
        matchID={id as string}
        playerID={player.id}
        credentials={player.id}
      />
    </>
  );
}
