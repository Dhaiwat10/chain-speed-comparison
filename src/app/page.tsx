"use client";

import { Button } from "@/components/ui/button";
import { useTxTimer } from "@/hooks/useTxTimer";
import { useWriteFuelContract } from "@/hooks/useWriteFuelContract";
import {
  baseContractAbi,
  baseContractAddress,
  baseSepoliaAccount,
} from "@/lib/wagmi-config";
import { useWriteContract } from "wagmi";
import Image from "next/image";
import { useState } from "react";

export default function Home() {
  const { writeContractAsync, status } = useWriteContract();
  const { writeContractAsync: writeFuelContractAsync, status: fuelStatus } =
    useWriteFuelContract();

  const {
    startTimer: startBaseTimer,
    stopTimer: stopBaseTimer,
    timerDuration: baseTimerDuration,
  } = useTxTimer();
  const {
    startTimer: startFuelTimer,
    stopTimer: stopFuelTimer,
    timerDuration: fuelTimerDuration,
  } = useTxTimer();

  const [raceComplete, setRaceComplete] = useState(false);

  const resetRace = () => {
    setRaceComplete(false);
    startBaseTimer();
    startFuelTimer();
  };

  const sendBaseTx = async () => {
    startBaseTimer();
    await writeContractAsync({
      address: baseContractAddress,
      abi: baseContractAbi,
      functionName: "setGreeting",
      args: ["Hello World"],
      account: baseSepoliaAccount,
    });
    stopBaseTimer();
  };

  const sendFuelTx = async () => {
    startFuelTimer();
    await writeFuelContractAsync();
    stopFuelTimer();
  };

  const sendBothTxs = async () => {
    resetRace();
    
    await Promise.all([
      sendBaseTx().then(() => stopBaseTimer()),
      sendFuelTx().then(() => stopFuelTimer()),
    ]);
    
    setRaceComplete(true);
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="row-start-2 w-full max-w-4xl mx-auto">
        <div className="grid grid-cols-2 gap-8 mb-8">
          {/* Fuel Side */}
          <div className="flex flex-col items-center relative">
            <Image 
              src="/fuel-logo.png" 
              alt="Fuel Logo" 
              width={100} 
              height={100}
            />
            {raceComplete && fuelTimerDuration > 0 && fuelTimerDuration < baseTimerDuration && (
              <div className="absolute -top-8 text-lg font-bold text-green-500">
                Winner! 🏆
              </div>
            )}
            {fuelTimerDuration > 0 && (
              <p className="text-sm text-gray-500 mt-4">{fuelTimerDuration}ms</p>
            )}
          </div>

          {/* Base Side */}
          <div className="flex flex-col items-center relative">
            <Image 
              src="/base-logo.png" 
              alt="Base Logo" 
              width={100} 
              height={100}
            />
            {raceComplete && baseTimerDuration > 0 && baseTimerDuration < fuelTimerDuration && (
              <div className="absolute -top-8 text-lg font-bold text-green-500">
                Winner! 🏆
              </div>
            )}
            {baseTimerDuration > 0 && (
              <p className="text-sm text-gray-500 mt-4">{baseTimerDuration}ms</p>
            )}
          </div>
        </div>

        {/* Race Button */}
        <div className="flex justify-center mt-8">
          <Button
            onClick={sendBothTxs}
            className="px-8 mt-4"
            disabled={status === "pending" || fuelStatus === "pending"}
          >
            {status === "pending" || fuelStatus === "pending"
              ? "Racing..."
              : "RACEEEE"}
          </Button>
        </div>
      </main>
    </div>
  );
}
