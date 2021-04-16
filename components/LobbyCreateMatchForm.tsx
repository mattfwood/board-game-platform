/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import { Game } from 'boardgame.io';
import { GameComponent } from 'boardgame.io/dist/types/src/lobby/connection';
// import { GameComponent } from 'boardgame.io/dist/types/src/lobby/connection';
import React from 'react';
// import type { Game } from '../types';
// import type { GameComponent } from './connection';

type CreateMatchProps = {
  games: GameComponent[];
  createMatch: (gameName: string, numPlayers: number) => Promise<void>;
};

type CreateMatchState = {
  selectedGame: number;
  numPlayers: number;
};

class LobbyCreateMatchForm extends React.Component<
  CreateMatchProps,
  CreateMatchState
> {
  state = {
    selectedGame: 0,
    numPlayers: 2,
  };

  constructor(props: CreateMatchProps) {
    super(props);
    /* fix min and max number of players */
    for (const game of props.games) {
      const matchDetails = game.game;
      if (!matchDetails.minPlayers) {
        matchDetails.minPlayers = 1;
      }
      if (!matchDetails.maxPlayers) {
        matchDetails.maxPlayers = 4;
      }
      console.assert(matchDetails.maxPlayers >= matchDetails.minPlayers);
    }
    this.state = {
      selectedGame: 0,
      numPlayers: props.games[0].game.minPlayers,
    };
  }

  _createGameNameOption = (game: GameComponent, idx: number) => {
    return (
      <option key={'name-option-' + idx} value={idx}>
        {game.game.name}
      </option>
    );
  };

  _createNumPlayersOption = (idx: number) => {
    return (
      <option key={'num-option-' + idx} value={idx}>
        {idx}
      </option>
    );
  };

  _createNumPlayersRange = (game: Game) => {
    return [...new Array(game.maxPlayers + 1).keys()].slice(game.minPlayers);
  };

  render() {
    return (
      <div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            this.onClickCreate();
          }}
        >
          <div className="shadow sm:rounded-md sm:overflow-hidden">
            <div className="bg-white py-6 px-4 space-y-6 sm:p-6">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Create a Match
                </h3>
                {/* <p className="mt-1 text-sm text-gray-500">
                  Provide basic informtion about the job. Be specific with the job title.
                </p> */}
              </div>

              <fieldset>
                <legend className="text-base font-medium text-gray-900">
                  Game Type
                </legend>
                <select
                  className="mt-4 block w-full bg-white border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={this.state.selectedGame}
                  onChange={(evt) => this.onChangeSelectedGame(evt)}
                >
                  {this.props.games.map(this._createGameNameOption)}
                </select>
              </fieldset>
              <fieldset className="mt-6">
                <legend className="text-base font-medium text-gray-900">
                  Player Count
                </legend>
                <select
                  className="mt-4"
                  value={this.state.numPlayers}
                  onChange={this.onChangeNumPlayers}
                >
                  {this._createNumPlayersRange(
                    this.props.games[this.state.selectedGame].game
                  ).map(this._createNumPlayersOption)}
                </select>
              </fieldset>
            </div>
            <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
              <button
                type="submit"
                className="bg-indigo-600 border border-transparent rounded-md shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
              >
                Create Game
              </button>
            </div>
          </div>
        </form>
        {/* <select
          value={this.state.selectedGame}
          onChange={(evt) => this.onChangeSelectedGame(evt)}
        >
          {this.props.games.map(this._createGameNameOption)}
        </select> */}
        {/* <span>Players:</span>
        <select
          value={this.state.numPlayers}
          onChange={this.onChangeNumPlayers}
        >
          {this._createNumPlayersRange(
            this.props.games[this.state.selectedGame].game
          ).map(this._createNumPlayersOption)}
        </select> */}
        {/* <span className="buttons">
          <button onClick={this.onClickCreate}>Create</button>
        </span> */}
      </div>
    );
  }

  onChangeNumPlayers = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({
      numPlayers: Number.parseInt(event.target.value),
    });
  };

  onChangeSelectedGame = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const idx = Number.parseInt(event.target.value);
    this.setState({
      selectedGame: idx,
      numPlayers: this.props.games[idx].game.minPlayers,
    });
  };

  onClickCreate = () => {
    this.props.createMatch(
      this.props.games[this.state.selectedGame].game.name,
      this.state.numPlayers
    );
  };
}

export default LobbyCreateMatchForm;
