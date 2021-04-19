import { TicTacToe } from '../lib/Game';
import { TicTacToeBoard } from '../components/Board';
import { LobbyClient } from 'boardgame.io/client';
import React, { useState } from 'react';
import LobbyCreateMatchForm from '../components/LobbyCreateMatchForm';
import { usePlayer } from '../hooks/usePlayer';
import { useRouter } from 'next/dist/client/router';
import LobbyLoginForm from '../components/LobbyLoginForm';

const isDev = process.env.NODE_ENV !== 'production';
export const HOST = isDev
  ? 'http://localhost:8000'
  : 'https://board-game-backend.herokuapp.com';

export const lobbyClient = new LobbyClient({ server: HOST });

export const GAME_COMPONENTS = [{ game: TicTacToe, board: TicTacToeBoard }];

export default function Home() {
  const [showLoginForm, setShowLoginForm] = useState(false);
  const router = useRouter();
  const [player] = usePlayer();

  return (
    <div>
      <div>
        <div className="w-full max-w-screen-sm mx-auto rounded-lg bg-white overflow-hidden shadow p-6 mb-2">
          {showLoginForm ? (
            <LobbyLoginForm onCancel={() => setShowLoginForm(false)} />
          ) : (
            <>
              <h2 className="sr-only" id="profile-overview-title">
                Profile Overview
              </h2>
              <div className="sm:flex sm:items-center sm:justify-between">
                <div className="sm:flex sm:space-x-5">
                  <div className="mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
                    <p className="text-sm font-medium text-gray-600">
                      Welcome back,
                    </p>
                    <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {player.name}
                    </p>
                  </div>
                </div>
                <div className="mt-5 flex justify-center sm:mt-0">
                  <button
                    onClick={() => setShowLoginForm(true)}
                    className="flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Change Name
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <LobbyCreateMatchForm
        games={GAME_COMPONENTS}
        createMatch={async (gameName, numPlayers) => {
          const { matchID } = await lobbyClient.createMatch(gameName, {
            numPlayers,
          });

          router.push(`/${gameName}/${matchID}`);
        }}
      />
    </div>
  );
}
