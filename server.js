
import { Server } from 'boardgame.io/server';
import { TicTacToe } from './lib/game';

const server = Server({ games: [TicTacToe] });
const PORT = process.env.PORT || 8000;

server.run(PORT);