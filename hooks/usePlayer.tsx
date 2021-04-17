import Cookies from 'react-cookies';
import { useEffect } from 'react';
import { atom, useRecoilState } from 'recoil';

type Player = {
  name?: string;
};

const playerState = atom<Player>({
  key: 'player',
  default: Cookies.load('playerState') || null,
});

export const usePlayer = () => {
  const [player, setPlayer] = useRecoilState(playerState);

  useEffect(() => {
    Cookies.save('playerState', player);
  }, [player]);

  return [player, setPlayer];
};
