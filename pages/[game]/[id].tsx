import { SocketIO } from 'boardgame.io/multiplayer';
import { Client } from 'boardgame.io/react';
import { useRouter } from 'next/dist/client/router';
import React, { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';
import useSWR from 'swr';
import { HOST, lobbyClient } from '..';
import { TicTacToeBoard } from '../../components/Board';
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
    query: { id },
  } = useRouter();
  const [player] = usePlayer();
  const { match } = useMatch();

  // console.log({ player });

  // @TODO: player hasn't joined and game is full, but can join as a spectator

  return (
    <>
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
