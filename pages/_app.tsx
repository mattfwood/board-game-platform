import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import LobbyLoginForm from '../components/LobbyLoginForm';
import { usePlayer } from '../hooks/usePlayer';
import '../styles/tailwind.css';

const Container = ({ children }) => {
  const [player] = usePlayer();

  if (!player) {
    return (
      <div className="rounded-lg bg-white overflow-hidden shadow p-6">
        <LobbyLoginForm />
      </div>
    );
  }

  return children;
};

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <RecoilRoot>
      <Container>
        <Component {...pageProps} />
      </Container>
    </RecoilRoot>
  );
};

export default App;
