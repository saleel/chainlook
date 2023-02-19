import { connectorsForWallets, lightTheme } from '@rainbow-me/rainbowkit';
import React, { ReactNode } from 'react';
import {
  AuthenticationStatus,
  createAuthenticationAdapter,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
  ledgerWallet,
} from '@rainbow-me/rainbowkit/wallets';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet } from 'wagmi/chains';
import { publicProvider } from 'wagmi/providers/public';
import { SiweMessage } from 'siwe';
import API from '../data/api';
import { deleteTokenAndUser, getUser, isTokenValid, saveTokenAndUser } from '../data/auth';
import User from '../domain/user';

const { chains, provider, webSocketProvider } = configureChains([mainnet], [publicProvider()]);

const connectors = connectorsForWallets([
  {
    groupName: 'Wallets',
    wallets: [
      metaMaskWallet({ chains }),
      coinbaseWallet({ appName: 'ChainLook', chains }),
      walletConnectWallet({ chains }),
      trustWallet({ chains }),
      ledgerWallet({ chains }),
    ],
  },
]);

const wagmiClient = createClient({
  autoConnect: false,
  connectors,
  provider,
  webSocketProvider,
});

type AuthContextParams = {
  isAuthenticated: boolean;
  user: User | null;
};

export const AuthContext = React.createContext<AuthContextParams>({
  isAuthenticated: isTokenValid(),
  user: getUser(),
});

const Disclaimer = () => (
  <div style={{ lineHeight: '1.5rem', margin: '0 -5px' }}>
    <h4 className='paragraph-title'>Sign in with Ethereum</h4>
    <div>
      You can use your Ethereum Wallet to sign in to ChainLook. This don't create a transaction{' '}
      <u>nor incur any gas fee</u>.
    </div>
  </div>
);

const customTheme = lightTheme();
customTheme.radii.modal = '10px';

export function AuthContextProvider(props: { children: ReactNode }) {
  const { children } = props;
  const verifyingRef = React.useRef(false);

  const [user, setUser] = React.useState<User | null>(getUser());

  const [authStatus, setAuthStatus] = React.useState<AuthenticationStatus>('loading');

  React.useEffect(() => {
    setAuthStatus(isTokenValid() ? 'authenticated' : 'unauthenticated');
  }, []);

  const authAdapter = React.useMemo(() => {
    return createAuthenticationAdapter({
      getNonce: async () => {
        return API.getNonce();
      },

      createMessage: ({ nonce, address, chainId }) => {
        return new SiweMessage({
          domain: window.location.host,
          address,
          statement: 'Sign in with Ethereum to the app.',
          uri: window.location.origin,
          version: '1',
          chainId,
          nonce,
        });
      },

      getMessageBody: ({ message }) => {
        return message.prepareMessage();
      },

      verify: async ({ message, signature }) => {
        verifyingRef.current = true;

        try {
          const { user, token } = await API.signIn({ message, signature });

          saveTokenAndUser(token, user);

          if (!user.username) {
            const username = window.prompt('Enter a username for your account');
            if (username) {
              await API.editProfile({ username });
              user.username = username;
              saveTokenAndUser(token, user);
            } else {
              alert('You need a username to continue');
              return false;
            }
          }

          setAuthStatus(token ? 'authenticated' : 'unauthenticated');
          setUser(user);

          return true;
        } catch (error) {
          console.error(error);
          return false;
        } finally {
          verifyingRef.current = false;
        }
      },

      signOut: async () => {
        setAuthStatus('unauthenticated');
        deleteTokenAndUser();
      },
    });
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated: authStatus === 'authenticated' || isTokenValid(), user }}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitAuthenticationProvider adapter={authAdapter} status={authStatus}>
          <RainbowKitProvider
            chains={chains}
            modalSize='compact'
            theme={customTheme}
            appInfo={{
              appName: 'ChainLook',
              disclaimer: Disclaimer,
            }}
            showRecentTransactions={false}
          >
            {children}
          </RainbowKitProvider>
        </RainbowKitAuthenticationProvider>
      </WagmiConfig>
    </AuthContext.Provider>
  );
}
