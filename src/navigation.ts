import { Receipt } from "./domain/models";

export type RootStackParamList = {
  Home: undefined;
  SendMoney: undefined;
  Receipt: { receipt: Receipt };
};
