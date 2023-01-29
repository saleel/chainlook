import {
  connectorsForWallets,
  lightTheme,
  useConnectModal,
} from "@rainbow-me/rainbowkit";
import React, { ReactNode } from "react";
import {
  AuthenticationStatus,
  createAuthenticationAdapter,
  getDefaultWallets,
  RainbowKitAuthenticationProvider,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import {
  metaMaskWallet,
  coinbaseWallet,
  walletConnectWallet,
  trustWallet,
  ledgerWallet,
} from "@rainbow-me/rainbowkit/wallets";
import { configureChains, createClient, WagmiConfig } from "wagmi";
import { mainnet } from "wagmi/chains";
import { publicProvider } from "wagmi/providers/public";
import { SiweMessage } from "siwe";
import API from "../data/api";

const { chains, provider, webSocketProvider } = configureChains(
  [mainnet],
  [publicProvider()]
);

const connectors = connectorsForWallets([
  {
    groupName: "Wallets",
    wallets: [
      metaMaskWallet({ chains }),
      coinbaseWallet({ appName: "ChainLook", chains }),
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
  authStatus: AuthenticationStatus;
};

export const AuthContext = React.createContext<AuthContextParams>({
  authStatus: "loading",
});

const Disclaimer = () => (
  <div style={{ lineHeight: '1.5rem', margin: '0 -5px' }}>
    <h4 className="paragraph-title">Sign in with Ethereum</h4>
    <div>
      You can use your Ethereum Wallet to sign in to ChainLook.
      This don't create a transaction <u>nor incur any gas fee</u>.
    </div>
  </div>
);

const customTheme = lightTheme();
customTheme.radii.modal = "10px";

export function AuthContextProvider(props: { children: ReactNode }) {
  const { children } = props;
  const fetchingStatusRef = React.useRef(false);
  const verifyingRef = React.useRef(false);

  const [authStatus, setAuthStatus] =
    React.useState<AuthenticationStatus>("loading");

  // Fetch user when:
  React.useEffect(() => {
    const fetchStatus = async () => {
      if (fetchingStatusRef.current || verifyingRef.current) {
        return;
      }

      fetchingStatusRef.current = true;

      try {
        // const response = await fetch('/api/me');
        // const json = await response.json();
        // setAuthStatus(json.address ? 'authenticated' : 'unauthenticated');
        setAuthStatus("unauthenticated");
      } catch (_error) {
        setAuthStatus("unauthenticated");
      } finally {
        fetchingStatusRef.current = false;
      }
    };

    // 1. page loads
    fetchStatus();

    // 2. window is focused (in case user logs out of another window)
    window.addEventListener("focus", fetchStatus);
    return () => window.removeEventListener("focus", fetchStatus);
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
          statement: "Sign in with Ethereum to the app.",
          uri: window.location.origin,
          version: "1",
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
          const authenticated = await API.signIn({ message, signature });
          if (authenticated) {
            setAuthStatus(authenticated ? "authenticated" : "unauthenticated");
          }
          return authenticated;
        } catch (error) {
          return false;
        } finally {
          verifyingRef.current = false;
        }
      },

      signOut: async () => {
        setAuthStatus("unauthenticated");
        await fetch("/api/logout");
      },
    });
  }, []);

  return (
    <AuthContext.Provider value={{ authStatus }}>
      <WagmiConfig client={wagmiClient}>
        <RainbowKitAuthenticationProvider
          adapter={authAdapter}
          status={authStatus}
        >
          <RainbowKitProvider
            chains={chains}
            modalSize="compact"
            theme={customTheme}
            appInfo={{
              appName: "ChainLook",
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
