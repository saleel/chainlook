import React from 'react';
import { providers } from 'ethers';

const provider = window.ethereum && new providers.Web3Provider(window.ethereum);

function useWallet() {
  const [isLoading, setIsLoading] = React.useState(!!provider);
  const [isChainValid, setIsChainValid] = React.useState(false);
  const [signer, setSigner] = React.useState(provider && provider.getSigner());
  const [address, setAddress] = React.useState();

  React.useEffect(() => {
    if (!provider) {
      return;
    }

    window.ethereum.on('chainChanged', (newChainId) => {
      const isValid = parseInt(newChainId, 16) === Number(process.env.REACT_APP_CHAIN_ID);
      setIsChainValid(isValid);

      if (!isValid) {
        setAddress();
      }
    });

    (async () => {
      const chainId = parseInt((await signer.getChainId()).toString(), 10);

      if (chainId !== Number(process.env.REACT_APP_CHAIN_ID)) {
        setIsLoading(false);
        setIsChainValid(false);
        return;
      }

      setIsChainValid(true);

      if (signer) {
        signer.getAddress().then((add) => setAddress(add));
      }

      setIsLoading(false);

      window.ethereum.on('accountsChanged', (([account1]) => {
        setAddress(account1.toLowerCase());
      }));
    })();
  }, [signer]);

  async function onConnectClick() {
    await provider.send('eth_requestAccounts', []);

    setSigner(provider.getSigner());
    const account = await provider.getSigner().getAddress();
    setAddress(account.toLowerCase());
  }

  function Component() {
    if (isLoading) return null;

    if (!provider) {
      return (
        <>
          <h4 className="subtitle">Cannot find a Wallet provider.</h4>
          <div className="mt-3 mb-5">
            You need to have <a target="_blank" href="https://metamask.io/" rel="noreferrer">Metamask</a>
            {' '} or other similar browser plugin installed in order to interact with the Stable contract
          </div>
        </>
      );
    }

    if (!isChainValid) {
      return (
        <>
          <h4 className="subtitle">You are not on Aurora chain.</h4>
          <div className="mt-3 mb-5">
            Please change your Metamask chain to <a target="_blank" href="https://aurora.dev/start" rel="noreferrer">Aurora Mainnet</a>.
          </div>
        </>
      );
    }

    return (
      <>
        <h4 className="subtitle">Connect to your ETH wallet using Metamask (or similar) to interact with the Stable contract.</h4>
        <div className="mt-3 mb-5">
          <img src="https://images.ctfassets.net/9sy2a0egs6zh/4zJfzJbG3kTDSk5Wo4RJI1/1b363263141cf629b28155e2625b56c9/mm-logo.svg" alt="Metamask" />
        </div>
        <button className="button btn-submit-prices is-medium" type="button" onClick={onConnectClick}>
          Connect
        </button>

      </>
    );
  }

  return {
    isLoading, signer, provider, address, Component,
  };
}

export default useWallet;
