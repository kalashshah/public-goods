"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useEffect, useState } from "react";
import {
  IDKitWidget,
  ISuccessResult,
  VerificationLevel,
} from "@worldcoin/idkit";
import {
  EventType,
  MetaMaskSDK,
  SDKProvider,
  ServiceStatus,
  useSDK,
} from "@metamask/sdk-react";
import { MetaMaskButton } from "@metamask/sdk-react-ui";

export default function Home() {
  const [text, setText] = useState("");
  const [image, setImage] = useState("");

  const [sdk, setSDK] = useState<MetaMaskSDK>();
  const [chain, setChain] = useState("");
  const [account, setAccount] = useState<string>("");
  const [response, setResponse] = useState<any>("");
  const [connected, setConnected] = useState(false);
  const [serviceStatus, setServiceStatus] = useState<ServiceStatus>();
  const [activeProvider, setActiveProvider] = useState<SDKProvider>();

  //initialize sdk
  useEffect(() => {
    const doAsync = async () => {
      const clientSDK = new MetaMaskSDK({
        useDeeplink: false,

        checkInstallationImmediately: false,
        i18nOptions: {
          enabled: true,
        },
        dappMetadata: {
          name: "NEXTJS demo",
          url: "https://localhost:3001",
        },
        logging: {
          developerMode: false,
        },
        storage: {
          enabled: true,
        },
      });
      await clientSDK.init();
      setSDK(clientSDK);
    };
    doAsync();
  }, []);

  useEffect(() => {
    if (!sdk || !activeProvider) {
      return;
    }

    // activeProvider is mapped to window.ethereum.
    console.debug(`App::useEffect setup active provider listeners`);
    if (window.ethereum?.getSelectedAddress()) {
      console.debug(`App::useEffect setting account from window.ethereum `);
      setAccount(window.ethereum?.getSelectedAddress() ?? "");
      setConnected(true);
    } else {
      setConnected(false);
    }

    const onChainChanged = (chain: unknown) => {
      console.log(`App::useEfect on 'chainChanged'`, chain);
      setChain(chain as string);
      setConnected(true);
    };

    const onInitialized = () => {
      console.debug(`App::useEffect on _initialized`);
      setConnected(true);
      if (window.ethereum?.getSelectedAddress()) {
        setAccount(window.ethereum?.getSelectedAddress() ?? "");
      }

      if (window.ethereum?.getChainId()) {
        setChain(window.ethereum.getChainId());
      }
    };

    const onAccountsChanged = (accounts: unknown) => {
      console.log(`App::useEfect on 'accountsChanged'`, accounts);
      setAccount((accounts as string[])?.[0]);
      setConnected(true);
    };

    const onConnect = (_connectInfo: any) => {
      console.log(`App::useEfect on 'connect'`, _connectInfo);
      setConnected(true);
      setChain(_connectInfo.chainId as string);
    };

    const onDisconnect = (error: unknown) => {
      console.log(`App::useEfect on 'disconnect'`, error);
      console.log("Listening");
      setConnected(false);
      setChain("");
    };

    const onServiceStatus = (_serviceStatus: ServiceStatus) => {
      console.debug(`sdk connection_status`, _serviceStatus);
      setServiceStatus(_serviceStatus);
    };

    window.ethereum?.on("chainChanged", onChainChanged);

    window.ethereum?.on("_initialized", onInitialized);

    window.ethereum?.on("accountsChanged", onAccountsChanged);

    window.ethereum?.on("connect", onConnect);

    window.ethereum?.on("disconnect", onDisconnect);

    sdk.on(EventType.SERVICE_STATUS, onServiceStatus);

    return () => {
      console.debug(`App::useEffect cleanup activeprovider events`);
      window.ethereum?.removeListener("chainChanged", onChainChanged);
      window.ethereum?.removeListener("_initialized", onInitialized);
      window.ethereum?.removeListener("accountsChanged", onAccountsChanged);
      window.ethereum?.removeListener("connect", onConnect);
      window.ethereum?.removeListener("disconnect", onDisconnect);
      sdk.removeListener(EventType.SERVICE_STATUS, onServiceStatus);
    };
  }, [activeProvider]);

  useEffect(() => {
    if (!sdk?.isInitialized()) {
      return;
    }

    const onProviderEvent = (accounts?: string[]) => {
      if (accounts?.[0]?.startsWith("0x")) {
        setConnected(true);
        setAccount(accounts?.[0]);
      } else {
        setConnected(false);
        setAccount("");
      }
      setActiveProvider(sdk.getProvider());
    };
    // listen for provider change events
    sdk.on(EventType.PROVIDER_UPDATE, onProviderEvent);
    return () => {
      sdk.removeListener(EventType.PROVIDER_UPDATE, onProviderEvent);
    };
  }, [sdk]);

  const connect = () => {
    if (!window.ethereum) {
      throw new Error(`invalid ethereum provider`);
    }

    window.ethereum
      .request({
        method: "eth_requestAccounts",
        params: [],
      })
      .then((accounts) => {
        if (accounts) {
          console.debug(`connect:: accounts result`, accounts);
          setAccount((accounts as string[])[0]);
          setConnected(true);
        }
      })
      .catch((e) => console.log("request accounts ERR", e));
  };

  const onSuccess = async (res: ISuccessResult) => {
    try {
      console.log({
        text,
        image,
        wc: res,
      });

      const response = await fetch("/api/create-good", {
        method: "POST",
        body: JSON.stringify({
          image,
          data: text,
          proof: res.proof,
          nullifier_hash: res.nullifier_hash,
          merkle_root: res.merkle_root,
          verification_level: res.verification_level,
          action: "public-good-act",
          signal: JSON.stringify({ image, data: text }),
        }),
      });

      console.log("response", response);
    } catch (e) {
      console.log("Error", e);
    }
  };

  return connected ? (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <form className="space-y-6 w-full max-w-md">
          <div className="space-y-2">
            <Label htmlFor="text-input">Text Input</Label>
            <Input
              id="text-input"
              placeholder="Enter your text here"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-input">Image Input</Label>
            <Input
              id="image-input"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = (event) => {
                    const base64String = event.target?.result as string;
                    setImage(base64String);
                  };
                  reader.readAsDataURL(file);
                }
              }}
            />
          </div>
          <IDKitWidget
            app_id="app_staging_ba8f7d74a9bcc471a13ebb050024aeb5"
            action="public-good-act"
            signal={JSON.stringify({ image, data: text })}
            onSuccess={onSuccess}
            verification_level={VerificationLevel.Device}
          >
            {({ open }) => (
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  open();
                }}
              >
                Verify with World ID
              </Button>
            )}
          </IDKitWidget>
        </form>
      </main>
    </div>
  ) : (
    <button style={{ padding: 10, margin: 10 }} onClick={connect}>
      Connect
    </button>
  );
}
