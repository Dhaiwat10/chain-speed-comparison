import abi from "./fuel-contract-abi.json";

export const fuelContractId =
  "0x62b46719e36130416d39e1585e80918b065935da823d9b9a4a767a5be489f8b2";

export const fuelContractAbi = abi;

export const fuelWalletPk = process.env
  .NEXT_PUBLIC_FUEL_PVT_KEY as `0x${string}`;
