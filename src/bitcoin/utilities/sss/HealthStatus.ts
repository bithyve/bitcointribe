import config from '../../Config';

const { HEXA_HEALTH } = config.HEALTH_STATUS;
const { ENTITY_HEALTH } = config.HEALTH_STATUS;
const { TIME_SLOTS } = config.HEALTH_STATUS;

export default class HealthStatus {
  private counter: {
    good: number;
    bad: number;
    ugly: number;
  };

  constructor() {
    this.counter = {
      good: 0,
      bad: 0,
      ugly: 0,
    };
  }

  public appHealthStatus = (
    qaTimestamp: number,
    shares: [
      { shareId: string; updatedAt: number } | null,
      { shareId: string; updatedAt: number } | null,
      { shareId: string; updatedAt: number } | null,
      { shareId: string; updatedAt: number } | null,
      { shareId: string; updatedAt: number } | null
    ],
  ): {
    sharesInfo: Array<{ shareId: number; shareStage: string }>;
    qaStatus: string;
    overallStatus: string;
  } => {
    let overallStatus: string = HEXA_HEALTH.STAGE1;
    const qaRes = this.qaHealthStatus(qaTimestamp);
    const qaStatus = qaRes.qaStage;
    // let sharesData: any;
    // let sharesInfo: any;
    const sharesData = this.shareHealthStatus(shares);
    const { sharesInfo } = sharesData;
    if (this.counter.ugly > 3 || this.counter.bad > 4) {
      overallStatus = HEXA_HEALTH.STAGE1;
    } else if (this.counter.ugly > 2 || this.counter.bad > 3) {
      overallStatus = HEXA_HEALTH.STAGE2;
    } else if (this.counter.ugly > 1 || this.counter.bad > 2) {
      overallStatus = HEXA_HEALTH.STAGE3;
    } else if (this.counter.ugly > 0 || this.counter.bad > 1) {
      overallStatus = HEXA_HEALTH.STAGE4;
    } else if (this.counter.good >= 6) {
      overallStatus = HEXA_HEALTH.STAGE5;
    }
    return { sharesInfo, qaStatus, overallStatus };
  };

  public mnemonicAppHealthStatus = (
    qaTimestamp: number,
    secureTimestamp: number,
    mnemonicTimestamp: number,
  ): {
    mnemonicStatus: string;
    qaStatus: string;
    secureAcStatus: string;
    overallStatus: string;
  } => {
    let overallStatus: string = HEXA_HEALTH.STAGE1;
    const qaRes = this.qaHealthStatus(qaTimestamp);
    const qaStatus = qaRes.qaStage;
    const saRes = this.secureAccountHealthStatus(secureTimestamp);
    const secureAcStatus = saRes.secureAcStage;

    let mnemonicStatus = ENTITY_HEALTH.STAGE1;
    const mnemonicRes = this.mnemonicHealthStatus(mnemonicTimestamp);
    mnemonicStatus = mnemonicRes.mnemonicStage;

    if (this.counter.ugly >= 2) {
      overallStatus = HEXA_HEALTH.STAGE1;
    } else if (this.counter.ugly === 1) {
      overallStatus = HEXA_HEALTH.STAGE2;
    } else if (this.counter.bad > 1) {
      overallStatus = HEXA_HEALTH.STAGE3;
    } else if (this.counter.bad === 1) {
      overallStatus = HEXA_HEALTH.STAGE4;
    } else if (this.counter.good === 3) {
      overallStatus = HEXA_HEALTH.STAGE5;
    }
    console.log(
      'mnemonic',
      mnemonicStatus,
      'qaStatus',
      qaStatus,
      'secureAcStatus',
      secureAcStatus,
      'overallStatus',
      overallStatus,
    );
    return {
      mnemonicStatus,
      qaStatus,
      secureAcStatus,
      overallStatus,
    };
  };

  private mnemonicHealthStatus = (time: number): { mnemonicStage: string } => {
    let mnemonicStage = ENTITY_HEALTH.STAGE1;
    const delta = Math.abs(Date.now() - time);
    const numberOfDays = Math.round(delta / TIME_SLOTS.DIVIDE_BY);
    if (numberOfDays > 2 * TIME_SLOTS.MNEMONIC_SLOT) {
      mnemonicStage = ENTITY_HEALTH.STAGE1;
      this.counter.ugly++;
    } else if (
      numberOfDays > TIME_SLOTS.MNEMONIC_SLOT &&
      numberOfDays <= 2 * TIME_SLOTS.MNEMONIC_SLOT
    ) {
      mnemonicStage = ENTITY_HEALTH.STAGE2;
      this.counter.bad++;
    } else if (numberOfDays <= TIME_SLOTS.MNEMONIC_SLOT) {
      mnemonicStage = ENTITY_HEALTH.STAGE3;
      this.counter.good++;
    }
    return { mnemonicStage };
  };

  private secureAccountHealthStatus = (
    time: number,
  ): { secureAcStage: string } => {
    let secureAcStage = ENTITY_HEALTH.STAGE1;
    const delta = Math.abs(Date.now() - time);
    const numberOfDays = Math.floor(delta / TIME_SLOTS.DIVIDE_BY);
    if (numberOfDays > TIME_SLOTS.SHARE_SLOT2) {
      secureAcStage = ENTITY_HEALTH.STAGE1;
      this.counter.ugly++;
    } else if (
      numberOfDays > TIME_SLOTS.SHARE_SLOT1 &&
      numberOfDays <= TIME_SLOTS.SHARE_SLOT2
    ) {
      secureAcStage = ENTITY_HEALTH.STAGE2;
      this.counter.bad++;
    } else if (numberOfDays <= TIME_SLOTS.SHARE_SLOT2) {
      secureAcStage = ENTITY_HEALTH.STAGE3;
      this.counter.good++;
    }
    return { secureAcStage };
  };

  private qaHealthStatus = (time: number): { qaStage: string } => {
    let qaStage: string = ENTITY_HEALTH.STAGE1;
    const delta = Math.abs(Date.now() - time);
    const numberOfDays = Math.round(delta / TIME_SLOTS.DIVIDE_BY);

    if (numberOfDays > TIME_SLOTS.SHARE_SLOT2) {
      qaStage = ENTITY_HEALTH.STAGE1;
      this.counter.ugly++;
    } else if (
      numberOfDays > TIME_SLOTS.SHARE_SLOT1 &&
      numberOfDays <= TIME_SLOTS.SHARE_SLOT2
    ) {
      qaStage = ENTITY_HEALTH.STAGE2;
      this.counter.bad++;
    } else if (numberOfDays <= TIME_SLOTS.SHARE_SLOT1) {
      qaStage = ENTITY_HEALTH.STAGE3;
      this.counter.good++;
    }
    return { qaStage };
  };

  private shareHealthStatus = (
    shares: [
      { shareId: string; updatedAt: number } | null,
      { shareId: string; updatedAt: number } | null,
      { shareId: string; updatedAt: number } | null,
      { shareId: string; updatedAt: number } | null,
      { shareId: string; updatedAt: number } | null
    ],
  ) => {
    const sharesInfo = [];
    for (let itr = 0; itr < shares.length; itr++) {
      const obj = shares[itr];
      if (obj === null) {
        sharesInfo.push({
          shareId: null,
          shareStage: ENTITY_HEALTH.STAGE1,
        });
      } else {
        sharesInfo.push({
          shareId: obj.shareId,
          shareStage: ENTITY_HEALTH.STAGE1,
        });
      }
    }
    const delta: number[] = new Array(5);
    const numberOfDays: number[] = new Array(5);
    for (let i = 0; i < delta.length; i++) {
      const obj = shares[i];
      if (obj === null) {
        delta[i] = Math.abs(Date.now() - 0);
      } else {
        delta[i] = Math.abs(Date.now() - obj.updatedAt);
      }
    }

    for (let i = 0; i < numberOfDays.length; i++) {
      numberOfDays[i] = Math.floor(delta[i] / TIME_SLOTS.DIVIDE_BY);
      const obj = sharesInfo[i];

      if (numberOfDays[i] > TIME_SLOTS.SHARE_SLOT2) {
        obj.shareStage = ENTITY_HEALTH.STAGE1;
        this.counter.ugly++;
      } else if (
        numberOfDays[i] > TIME_SLOTS.SHARE_SLOT1 &&
        numberOfDays[i] <= TIME_SLOTS.SHARE_SLOT2
      ) {
        obj.shareStage = ENTITY_HEALTH.STAGE2;
        this.counter.bad++;
      } else if (numberOfDays[i] <= TIME_SLOTS.SHARE_SLOT1) {
        obj.shareStage = ENTITY_HEALTH.STAGE3;
        this.counter.good++;
      }
    }
    return { sharesInfo };
  };
}
