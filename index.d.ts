export interface SpyInfo {
  called: boolean,
  callCount: number,
  callArgs: any[][],
  lastCallArgs: any[],
  returnValues: any[],
  lastReturnValue: any,
}

export function spy(targetFunc: Function): SpyInfo;

export function mock(originFunc: Function, mockFunc?: Function): SpyInfo;
