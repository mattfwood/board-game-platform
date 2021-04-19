import { AppProps } from 'next/app';
import { RecoilRoot } from 'recoil';
import LobbyLoginForm from '../components/LobbyLoginForm';
import { usePlayer } from '../hooks/usePlayer';
import '../styles/tailwind.css';

const Container = ({ children }) => {
  const [player] = usePlayer();

  return (
    <div>
      {!player ? (
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div>
            <LobbyLoginForm />
          </div>
        </div>
      ) : (
        <div>{children}</div>
      )}
    </div>
  );
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
