import { privateKeyToAccount } from "viem/accounts";
import { http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import abi from "./base-contract-abi.json";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  transports: {
    [baseSepolia.id]: http(),
  },
});

export const baseSepoliaAccount = privateKeyToAccount(
  process.env.NEXT_PUBLIC_BASE_PVT_KEY as `0x${string}`
);

export const baseContractAddress = "0x718833D2EfE162F33e349Ba492f39293134b19E2";

export const baseContractAbi = abi;
