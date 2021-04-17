/*
 * Copyright 2018 The boardgame.io Authors.
 *
 * Use of this source code is governed by a MIT-style
 * license that can be found in the LICENSE file or at
 * https://opensource.org/licenses/MIT.
 */

import React, { useState } from 'react';
import { v4 as uuid } from 'uuid';
import { Player, usePlayer } from '../hooks/usePlayer';

type LoginFormProps = {
  playerName?: string;
  onEnter?: (playerName: string) => void;
  onCancel?: () => void;
};

type LoginFormState = {
  playerName?: string;
  nameErrorMsg: string;
};

const LobbyLoginForm = (props: LoginFormProps) => {
  const [player, setPlayer] = usePlayer();
  const [playerName, setPlayerName] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    setPlayer({
      id: uuid(),
      name: playerName,
    });
    if (props.onEnter) {
      props?.onEnter(playerName);
    }
  }

  return (
    <div>
      <p className="phase-title">Choose a player name:</p>
      <form className="flex space-x-2" onSubmit={handleSubmit}>
        <input
          type="text"
          onChange={(e) => setPlayerName(e.target.value)}
          value={playerName}
        />
        <button className="buttons" type="submit">
          Enter
        </button>
        {Boolean(props.onCancel) && (
          <button
            type="button"
            className="btn-secondary"
            onClick={props.onCancel}
          >
            Cancel
          </button>
        )}
      </form>
      <br />
      {/* <span className="error-msg">
          {this.state.nameErrorMsg}
          <br />
        </span> */}
    </div>
  );
};

class LobbyLoginForm2 extends React.Component<LoginFormProps, LoginFormState> {
  static defaultProps = {
    playerName: '',
  };

  state = {
    playerName: this.props.playerName,
    nameErrorMsg: '',
  };

  render() {
    return (
      <div>
        <p className="phase-title">Choose a player name:</p>
        <div className="flex space-x-2">
          <input
            type="text"
            value={this.state.playerName}
            onChange={this.onChangePlayerName}
            onKeyPress={this.onKeyPress}
          />
          <button className="buttons" onClick={this.onClickEnter}>
            Enter
          </button>
          {Boolean(this.props.onCancel) && (
            <button className="btn-secondary" onClick={this.props.onCancel}>
              Cancel
            </button>
          )}
        </div>
        <br />
        <span className="error-msg">
          {this.state.nameErrorMsg}
          <br />
        </span>
      </div>
    );
  }

  onClickEnter = () => {
    if (this.state.playerName === '') return;
    this.props.onEnter(this.state.playerName);
  };

  onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      this.onClickEnter();
    }
  };

  onChangePlayerName = (event: React.ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value.trim();
    this.setState({
      playerName: name,
      nameErrorMsg: name.length > 0 ? '' : 'empty player name',
    });
  };
}

export default LobbyLoginForm;
