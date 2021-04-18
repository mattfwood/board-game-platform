import { LobbyAPI } from 'boardgame.io';
import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect, useReducer, useRef, useState } from 'react';
import { atom, useRecoilState } from 'recoil';
import useSWR from 'swr';
import { GAME_COMPONENTS, HOST, lobbyClient } from '..';
import { TicTacToeBoard } from '../../components/Board';
import Lobby, { RendererProps } from '../../components/Lobby';
import { LobbyConnection } from '../../components/LobbyConnection';
import { usePlayer } from '../../hooks/usePlayer';
import { TicTacToe } from '../../lib/Game';

const GameLobby = () => {
  const {
    query: { game, id },
  } = useRouter();
  const { match, refetchMatch } = useMatch();
  const [player, setPlayer] = usePlayer();
  const freeSeat = match?.players?.find((player) => !player?.name);

  const playerSeat = match?.players?.find(
    (matchPlayer) => matchPlayer?.id === player?.id
  );

  console.log({ match });

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
            const { playerCredentials } = await lobbyClient.joinMatch(
              game as string,
              id as string,
              {
                playerName: player.name,
                playerID: String(freeSeat.id),
              }
            );

            setPlayer((prev) => ({
              ...prev,
              id: String(freeSeat.id),
              credentials: playerCredentials,
            }));

            await refetchMatch();
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

// const useLobbyConnection = () => {
//   const [player] = usePlayer();
//   const [ignored, forceUpdate] = useReducer((x) => x + 1, 0);

//   const connection = useRef<ReturnType<typeof LobbyConnection> | null>(null);

//   async function refreshLobby() {
//     if (connection.current) {
//       await connection.current.refresh();

//       connection.current = connection.current;
//     }
//   }

//   async function joinGame() {}

//   useEffect(() => {
//     const lobbyConnection = LobbyConnection({
//       server: HOST,
//       gameComponents: GAME_COMPONENTS,
//       playerName: player.name,
//       // playerCredentials: player.id,
//     });

//     connection.current = lobbyConnection;

//     refreshLobby();
//   }, [player.name]);

//   return {
//     connection: connection?.current || null,
//     refreshLobby,
//   };
// };

const matchState = atom({
  key: 'match',
  default: null,
});

const useMatch = () => {
  const {
    query: { game: gameName, id },
  } = useRouter();
  const result = useSWR(`${HOST}/games/${gameName}/${id}`, {
    refreshInterval: 2000,
  });
  const [match, setMatch] = useRecoilState(matchState);
  const [player, setPlayer] = usePlayer();

  console.log({ result });

  async function getMatch() {
    const result = await lobbyClient.getMatch(gameName as string, id as string);
    setMatch(result);
  }

  async function joinMatch(gameName, gameID, playerID) {
    const { playerCredentials } = await lobbyClient.joinMatch(
      gameName,
      gameID,
      {
        playerName: player.name,
        playerID: String(playerID),
      }
    );

    setPlayer((prev) => ({
      ...prev,
      id: String(playerID),
      credentials: playerCredentials,
    }));

    await getMatch();
  }

  useEffect(() => {
    if (gameName && id) {
      getMatch();
    }
  }, [gameName, id]);

  return { match, refetchMatch: getMatch, joinMatch };
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
  const [player, setPlayer] = usePlayer();
  const { match } = useMatch();

  console.log({ player });

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
      <GameLobby />
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
        credentials={player.credentials}
      />
    </>
  );
}
