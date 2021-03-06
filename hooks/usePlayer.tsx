import Cookies from 'react-cookies';
import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';

export type Player = {
  id?: string;
  credentials?: string;
  name?: string;
};

const playerState = atom<Player>({
  key: 'player',
  default: Cookies.load('playerState') || null,
});

export const usePlayer = () => {
  const [player, setPlayer] = useRecoilState<Player>(playerState);

  useEffect(() => {
    if (player !== null) {
      Cookies.save('playerState', player, { path: '/' });
    }
  }, [player]);

  return [player, setPlayer] as const;
};
