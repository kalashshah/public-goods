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
import { Leaf, Recycle, Zap } from "lucide-react";
import localFont from "next/font/local";
import Image from "next/image";

const nounsFontSolid = localFont({
  src: "./fonts/LondrinaSolid-Black.ttf",
  variable: "--font-geist-mono",
  weight: "100 900",
});

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

  return (
    <>
      <div className="bg-cover bg-center h-screen">
        {/* Add Londrina Solid font */}
        <style jsx global>{`
          @import url("https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@300;400;900&display=swap");
          body {
            font-family: "Londrina Solid", cursive;
          }
        `}</style>

        <Image
          src={require("../assets/nouns_bg.png")}
          alt="Bg"
          layout="fill" // This will make the image fill its container
          objectFit="cover" // Ensures the image covers the area like background-image
          className="absolute inset-0 z-[-1]" // Puts the image behind the content
        />

        <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-4 sm:p-8 flex items-center justify-center z-10">
          <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
            <div className="p-6 sm:p-12">
              <h1 className="text-4xl sm:text-5xl font-black text-green-600 mb-8 text-center leading-tight">
                EcoTrack: Your Sustainability Companion
              </h1>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <form className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="text-input"
                        className="text-xl font-bold text-gray-700"
                      >
                        Describe your eco-action
                      </Label>
                      <Input
                        id="text-input"
                        placeholder="E.g., Used public transport today"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full p-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 text-black text-lg"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label
                        htmlFor="image-input"
                        className="text-xl font-bold text-gray-700"
                      >
                        Upload an image (optional)
                      </Label>
                      <div className="relative">
                        <Input
                          id="image-input"
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) =>
                                setImage(event.target?.result as string);
                              reader.readAsDataURL(file);
                            }
                          }}
                          className="w-full h-100 p-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                        />
                      </div>
                    </div>
                    {connected ? (
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
                            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105"
                          >
                            Verify and Calculate Green Score
                          </Button>
                        )}
                      </IDKitWidget>
                    ) : (
                      <Button
                        onClick={connect}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 londrina-solid-black"
                        style={{}}
                      >
                        Connect to proceed!
                      </Button>
                    )}
                  </form>
                </div>

                <div className="flex flex-col justify-center items-center bg-green-50 rounded-2xl p-6">
                  <div className="text-7xl font-black text-green-600 mb-4">
                    {0}
                  </div>
                  <div className="text-3xl font-bold text-gray-700 mb-6">
                    Your Green Score
                  </div>
                  <div className="flex space-x-4">
                    <Leaf className="text-green-500" size={40} />
                    <Recycle className="text-blue-500" size={40} />
                    <Zap className="text-yellow-500" size={40} />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-green-600 p-6 flex justify-between items-center">
              <div className="text-white font-black text-2xl">
                Keep up the great work!
              </div>
              <div className="flex space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 bg-yellow-300 rounded-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
    // <div className="min-h-screen bg-gradient-to-b from-green-100 to-blue-100 p-4 sm:p-8 flex items-center justify-center font-sans">
    //   <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
    //     <div className="p-6 sm:p-12">
    //       <h1 className="text-3xl sm:text-4xl font-bold text-green-600 mb-6 text-center ">
    //         EcoTrack: Your Sustainability Companion
    //       </h1>

    //       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
    //         <div>
    //           <form className="space-y-6">
    //             <div className="space-y-2">
    //               <Label
    //                 htmlFor="text-input"
    //                 className="text-lg font-medium text-gray-700"
    //               >
    //                 Describe your eco-action
    //               </Label>
    //               <Input
    //                 id="text-input"
    //                 placeholder="E.g., Used public transport today"
    //                 value={text}
    //                 onChange={(e) => setText(e.target.value)}
    //                 className="w-full p-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 text-black"
    //               />
    //             </div>
    //             <div className="space-y-2">
    //               <Label
    //                 htmlFor="image-input"
    //                 className="text-lg font-medium text-gray-700"
    //               >
    //                 Upload an image (optional)
    //               </Label>
    //               <div className="relative">
    //                 <Input
    //                   id="image-input"
    //                   type="file"
    //                   accept="image/*"
    //                   onChange={(e) => {
    //                     const file = e.target.files?.[0];
    //                     if (file) {
    //                       const reader = new FileReader();
    //                       reader.onload = (event) =>
    //                         setImage(event.target?.result as string);
    //                       reader.readAsDataURL(file);
    //                     }
    //                   }}
    //                   className="w-full h-100 p-3 border-2 border-green-300 rounded-xl focus:ring-2 focus:ring-green-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
    //                 />
    //               </div>
    //             </div>
    //             {connected ? (
    //               <IDKitWidget
    //                 app_id="app_staging_ba8f7d74a9bcc471a13ebb050024aeb5"
    //                 action="public-good-act"
    //                 signal={JSON.stringify({ image, data: text })}
    //                 onSuccess={onSuccess}
    //                 verification_level={VerificationLevel.Device}
    //               >
    //                 {({ open }) => (
    //                   <Button
    //                     onClick={(e) => {
    //                       e.preventDefault();
    //                       open();
    //                     }}
    //                     className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105"
    //                   >
    //                     Verify and Calculate Green Score
    //                   </Button>
    //                 )}
    //               </IDKitWidget>
    //             ) : (
    //               <Button
    //                 onClick={connect}
    //                 className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition duration-300 ease-in-out transform hover:scale-105 londrina-solid-black"
    //                 style={{}}
    //               >
    //                 Connect to proceed!
    //               </Button>
    //             )}
    //           </form>
    //         </div>

    //         <div className="flex flex-col justify-center items-center bg-green-50 rounded-2xl p-6">
    //           <div className="text-6xl font-bold text-green-600 mb-4">{0}</div>
    //           <div className="text-2xl font-semibold text-gray-700 mb-6">
    //             Your Green Score
    //           </div>
    //           <div className="flex space-x-4">
    //             <Leaf className="text-green-500" size={32} />
    //             <Recycle className="text-blue-500" size={32} />
    //             <Zap className="text-yellow-500" size={32} />
    //           </div>
    //         </div>
    //       </div>
    //     </div>

    //     <div className="bg-green-600 p-6 flex justify-between items-center">
    //       <div className="text-white font-bold text-xl">
    //         Keep up the great work!
    //       </div>
    //       <div className="flex space-x-2">
    //         {[...Array(5)].map((_, i) => (
    //           <div key={i} className="w-8 h-8 bg-yellow-300 rounded-full"></div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
}
