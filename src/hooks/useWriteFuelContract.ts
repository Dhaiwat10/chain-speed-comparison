import {
  fuelContractAbi,
  fuelContractId,
  fuelWalletPk,
} from "@/lib/fuel-config";
import { Contract, hexlify, Provider, Wallet, WalletUnlocked } from "fuels";
import { useEffect, useMemo, useState } from "react";
import { usePrepareFuelContractCall } from "./usePrepareFuelContractCall";
import { awaitTransactionStatus } from "@/lib/fuel/utils";

export const useWriteFuelContract = () => {
  const [wallet, setWallet] = useState<WalletUnlocked>();
  const [contract, setContract] = useState<Contract>();

  const [status, setStatus] = useState<
    "idle" | "pending" | "success" | "failure"
  >("idle");

  const incrementFn = useMemo(() => {
    if (!wallet || !contract) {
      return;
    }
    return contract.functions.increment();
  }, [wallet, contract]);

  const { preparedTxReq, reprepareTxReq } =
    usePrepareFuelContractCall(incrementFn);

  useEffect(() => {
    (async () => {
      if (!wallet) {
        const provider = await Provider.create(
          "https://testnet.fuel.network/v1/graphql"
        );

        const wallet = Wallet.fromPrivateKey(fuelWalletPk, provider);
        setWallet(wallet);

        const contract = new Contract(fuelContractId, fuelContractAbi, wallet);
        setContract(contract);
      }
    })();
  }, [wallet]);

  const writeContractAsync = async () => {
    setStatus("pending");

    try {
      if (!preparedTxReq) {
        throw new Error("No prepared transaction request");
      }

      if (!wallet) {
        throw new Error("No wallet");
      }

      const signedTransaction = await wallet.signTransaction(preparedTxReq);

      preparedTxReq.updateWitnessByOwner(wallet.address, signedTransaction);

      const encodedTx = hexlify(preparedTxReq.toTransactionBytes());

      await awaitTransactionStatus(
        "https://testnet.fuel.network/v1/graphql-sub",
        encodedTx,
        fetch
      );

      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("failure");
    } finally {
      reprepareTxReq();
    }
  };

  return { status, writeContractAsync };
};
